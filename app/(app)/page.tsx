import { createAdminClient } from "@/app/lib/supabase/admin";
import FlavorsTable from "./flavors-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function FlavorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createAdminClient();

  let countQuery = supabase
    .from("humor_flavors")
    .select("*", { count: "exact", head: true });
  if (q) countQuery = countQuery.ilike("slug", `%${q}%`);

  let dataQuery = supabase
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc")
    .order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (q) dataQuery = dataQuery.ilike("slug", `%${q}%`);

  const [{ count }, { data: flavors }] = await Promise.all([countQuery, dataQuery]);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Get step counts
  const flavorIds = (flavors ?? []).map((f) => f.id);
  let stepCounts: Record<number, number> = {};
  if (flavorIds.length > 0) {
    const { data: steps } = await supabase
      .from("humor_flavor_steps")
      .select("humor_flavor_id")
      .in("humor_flavor_id", flavorIds);
    if (steps) {
      for (const s of steps) {
        stepCounts[s.humor_flavor_id] = (stepCounts[s.humor_flavor_id] || 0) + 1;
      }
    }
  }

  const flavorsWithCounts = (flavors ?? []).map((f) => ({
    ...f,
    step_count: stepCounts[f.id] || 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-head text-3xl uppercase tracking-tight">Humor Flavors</h1>
      <FlavorsTable
        flavors={flavorsWithCounts}
        page={page}
        totalPages={totalPages}
        q={q || undefined}
      />
    </div>
  );
}
