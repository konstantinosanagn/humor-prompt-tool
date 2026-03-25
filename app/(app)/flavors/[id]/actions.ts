"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateFlavorDetail(formData: FormData) {
  const id = Number(formData.get("id"));
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;

  const supabase = createAdminClient();
  await supabase.from("humor_flavors").update({ slug, description }).eq("id", id);
  revalidatePath(`/flavors/${id}`);
}

export async function createStep(formData: FormData) {
  const flavorId = Number(formData.get("humor_flavor_id"));

  const supabase = createAdminClient();

  // Get next order_by
  const { data: maxStep } = await supabase
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxStep?.order_by ?? 0) + 1;

  await supabase.from("humor_flavor_steps").insert({
    humor_flavor_id: flavorId,
    order_by: nextOrder,
    humor_flavor_step_type_id: Number(formData.get("humor_flavor_step_type_id")),
    llm_model_id: Number(formData.get("llm_model_id")),
    llm_temperature: parseFloat(formData.get("llm_temperature") as string),
    llm_input_type_id: Number(formData.get("llm_input_type_id")),
    llm_output_type_id: Number(formData.get("llm_output_type_id")),
    llm_system_prompt: formData.get("llm_system_prompt") as string,
    llm_user_prompt: formData.get("llm_user_prompt") as string,
    description: (formData.get("description") as string) || null,
  });

  revalidatePath(`/flavors/${flavorId}`);
}

export async function updateStep(formData: FormData) {
  const id = Number(formData.get("id"));
  const flavorId = Number(formData.get("humor_flavor_id"));

  const supabase = createAdminClient();
  await supabase
    .from("humor_flavor_steps")
    .update({
      humor_flavor_step_type_id: Number(formData.get("humor_flavor_step_type_id")),
      llm_model_id: Number(formData.get("llm_model_id")),
      llm_temperature: parseFloat(formData.get("llm_temperature") as string),
      llm_input_type_id: Number(formData.get("llm_input_type_id")),
      llm_output_type_id: Number(formData.get("llm_output_type_id")),
      llm_system_prompt: formData.get("llm_system_prompt") as string,
      llm_user_prompt: formData.get("llm_user_prompt") as string,
      description: (formData.get("description") as string) || null,
    })
    .eq("id", id);

  revalidatePath(`/flavors/${flavorId}`);
}

export async function deleteStep(formData: FormData) {
  const id = Number(formData.get("id"));
  const flavorId = Number(formData.get("humor_flavor_id"));

  const supabase = createAdminClient();
  await supabase.from("humor_flavor_steps").delete().eq("id", id);

  // Re-number remaining steps
  const { data: remaining } = await supabase
    .from("humor_flavor_steps")
    .select("id")
    .eq("humor_flavor_id", flavorId)
    .order("order_by");

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from("humor_flavor_steps")
        .update({ order_by: i + 1 })
        .eq("id", remaining[i].id);
    }
  }

  revalidatePath(`/flavors/${flavorId}`);
}

export async function reorderSteps(flavorId: number, orderedStepIds: number[]) {
  const supabase = createAdminClient();

  for (let i = 0; i < orderedStepIds.length; i++) {
    await supabase
      .from("humor_flavor_steps")
      .update({ order_by: i + 1 })
      .eq("id", orderedStepIds[i]);
  }

  revalidatePath(`/flavors/${flavorId}`);
}
