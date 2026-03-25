"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentUserId } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateFlavorDetail(formData: FormData) {
  const id = Number(formData.get("id"));
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const userId = await getCurrentUserId();

  const supabase = createAdminClient();
  await supabase.from("humor_flavors").update({ slug, description, modified_by_user_id: userId }).eq("id", id);
  revalidatePath(`/flavors/${id}`);
}

export async function createStep(formData: FormData) {
  const flavorId = Number(formData.get("humor_flavor_id"));
  const userId = await getCurrentUserId();

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
    created_by_user_id: userId,
    modified_by_user_id: userId,
  });

  revalidatePath(`/flavors/${flavorId}`);
}

export async function updateStep(formData: FormData) {
  const id = Number(formData.get("id"));
  const flavorId = Number(formData.get("humor_flavor_id"));
  const userId = await getCurrentUserId();

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
      modified_by_user_id: userId,
    })
    .eq("id", id);

  revalidatePath(`/flavors/${flavorId}`);
}

export async function deleteStep(formData: FormData) {
  const id = Number(formData.get("id"));
  const flavorId = Number(formData.get("humor_flavor_id"));
  const userId = await getCurrentUserId();

  const supabase = createAdminClient();
  await supabase.from("humor_flavor_steps").delete().eq("id", id);

  // Re-number remaining steps
  const { data: remaining } = await supabase
    .from("humor_flavor_steps")
    .select("id")
    .eq("humor_flavor_id", flavorId)
    .order("order_by");

  if (remaining && remaining.length > 0) {
    await Promise.all(
      remaining.map((r, i) =>
        supabase.from("humor_flavor_steps").update({ order_by: i + 1, modified_by_user_id: userId }).eq("id", r.id)
      )
    );
  }

  revalidatePath(`/flavors/${flavorId}`);
}

export async function reorderSteps(flavorId: number, orderedStepIds: number[]) {
  const userId = await getCurrentUserId();
  const supabase = createAdminClient();

  await Promise.all(
    orderedStepIds.map((stepId, i) =>
      supabase.from("humor_flavor_steps").update({ order_by: i + 1, modified_by_user_id: userId }).eq("id", stepId)
    )
  );

  revalidatePath(`/flavors/${flavorId}`);
}
