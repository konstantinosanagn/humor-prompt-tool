import { createAdminClient } from "@/app/lib/supabase/admin";
import { notFound } from "next/navigation";
import FlavorHeader from "./flavor-header";
import DraggableStepList from "./draggable-step-list";
import TestPanel from "./test-panel";

export const dynamic = "force-dynamic";

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flavorId = Number(id);
  const supabase = createAdminClient();

  const [flavorRes, stepsRes, modelsRes, inputTypesRes, outputTypesRes, stepTypesRes, imageSetsRes] =
    await Promise.all([
      supabase.from("humor_flavors").select("id, slug, description").eq("id", flavorId).single(),
      supabase.from("humor_flavor_steps").select("*").eq("humor_flavor_id", flavorId).order("order_by"),
      supabase.from("llm_models").select("id, name, llm_provider_id, is_temperature_supported"),
      supabase.from("llm_input_types").select("id, slug, description"),
      supabase.from("llm_output_types").select("id, slug, description"),
      supabase.from("humor_flavor_step_types").select("id, slug, description"),
      supabase.from("study_image_sets").select("id, slug, description"),
    ]);

  const flavor = flavorRes.data;
  if (!flavor) notFound();

  // Fetch images for all image sets server-side (avoids RLS issues on client)
  const setIds = (imageSetsRes.data ?? []).map((s) => s.id);
  const imageSetImages: Record<number, { id: number; url: string; image_description: string | null }[]> = {};
  if (setIds.length > 0) {
    const { data: mappings } = await supabase
      .from("study_image_set_image_mappings")
      .select("study_image_set_id, image_id")
      .in("study_image_set_id", setIds);

    if (mappings && mappings.length > 0) {
      const imageIds = [...new Set(mappings.map((m) => m.image_id))];
      const { data: imgs } = await supabase
        .from("images")
        .select("id, url, image_description")
        .in("id", imageIds);

      const imgMap = new Map((imgs ?? []).map((i) => [i.id, i]));
      for (const m of mappings) {
        if (!imageSetImages[m.study_image_set_id]) imageSetImages[m.study_image_set_id] = [];
        const img = imgMap.get(m.image_id);
        if (img) imageSetImages[m.study_image_set_id].push(img);
      }
    }
  }

  return (
    <div className="space-y-8">
      <FlavorHeader flavor={flavor} />

      <DraggableStepList
        steps={stepsRes.data ?? []}
        models={modelsRes.data ?? []}
        inputTypes={inputTypesRes.data ?? []}
        outputTypes={outputTypesRes.data ?? []}
        stepTypes={stepTypesRes.data ?? []}
        flavorId={flavorId}
      />

      <TestPanel
        flavorId={flavorId}
        imageSets={imageSetsRes.data ?? []}
        imageSetImages={imageSetImages}
      />
    </div>
  );
}
