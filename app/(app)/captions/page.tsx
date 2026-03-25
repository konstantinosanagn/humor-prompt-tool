import { createAdminClient } from "@/app/lib/supabase/admin";
import Image from "next/image";
import Pagination from "@/app/components/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ flavor?: string; page?: string }>;
}) {
  const params = await searchParams;
  const flavorFilter = params.flavor ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createAdminClient();

  // Get flavors for filter dropdown
  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("id, slug")
    .order("slug");

  // Build query
  let countQuery = supabase
    .from("captions")
    .select("*", { count: "exact", head: true });
  let dataQuery = supabase
    .from("captions")
    .select("id, content, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (flavorFilter) {
    countQuery = countQuery.eq("humor_flavor_id", Number(flavorFilter));
    dataQuery = dataQuery.eq("humor_flavor_id", Number(flavorFilter));
  }

  const [{ count }, { data: captions }] = await Promise.all([countQuery, dataQuery]);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Resolve image URLs
  const imageIds = [...new Set((captions ?? []).map((c) => c.image_id).filter(Boolean))];
  let imageMap: Record<number, string> = {};
  if (imageIds.length > 0) {
    const { data: images } = await supabase
      .from("images")
      .select("id, url")
      .in("id", imageIds);
    if (images) {
      for (const img of images) imageMap[img.id] = img.url;
    }
  }

  // Resolve flavor slugs
  const flavorMap: Record<number, string> = {};
  if (flavors) {
    for (const f of flavors) flavorMap[f.id] = f.slug;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-head text-3xl uppercase tracking-tight">Captions</h1>

      {/* Filter */}
      <form action="/captions" method="get" className="flex items-center gap-3">
        <select
          name="flavor"
          defaultValue={flavorFilter}
          className="px-3 py-2 border-2 border-[var(--border)] text-sm bg-[var(--background)] font-sans"
        >
          <option value="">All Flavors</option>
          {(flavors ?? []).map((f) => (
            <option key={f.id} value={f.id}>
              {f.slug}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          Filter
        </button>
      </form>

      {/* Captions list */}
      <div className="space-y-3">
        {(captions ?? []).map((c) => (
          <div key={c.id} className="border-2 border-[var(--border)] shadow-[var(--shadow-sm)] p-4 flex gap-4">
            {/* Image thumbnail */}
            {imageMap[c.image_id] && (
              <div className="w-20 h-20 flex-shrink-0 border-2 border-[var(--border)] overflow-hidden relative">
                <Image
                  src={imageMap[c.image_id]}
                  alt="Caption image"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-bold">{c.content}</p>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--foreground)]/60">
                {c.humor_flavor_id && (
                  <span className="px-2 py-0.5 border border-[var(--border)] bg-[var(--foreground)]/5">
                    {flavorMap[c.humor_flavor_id] ?? `flavor:${c.humor_flavor_id}`}
                  </span>
                )}
                <span>req:{c.caption_request_id}</span>
                <span>chain:{c.llm_prompt_chain_id}</span>
                <span>{new Date(c.created_datetime_utc).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination basePath="/captions" page={page} totalPages={totalPages} extraParams={flavorFilter ? { flavor: flavorFilter } : undefined} />
    </div>
  );
}
