"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createFlavor(formData: FormData) {
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("humor_flavors")
    .insert({ slug, description });

  if (error) console.error("Failed to create flavor:", error.message);
  revalidatePath("/");
}

export async function updateFlavor(formData: FormData) {
  const id = Number(formData.get("id"));
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;

  const supabase = createAdminClient();
  await supabase
    .from("humor_flavors")
    .update({ slug, description })
    .eq("id", id);
  revalidatePath("/");
}

export async function deleteFlavor(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("humor_flavors").delete().eq("id", id);
  revalidatePath("/");
}

export async function duplicateFlavor(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();

  // Fetch original flavor
  const { data: original } = await supabase
    .from("humor_flavors")
    .select("slug, description")
    .eq("id", id)
    .single();
  if (!original) return;

  // Insert copy
  const { data: newFlavor } = await supabase
    .from("humor_flavors")
    .insert({ slug: `${original.slug}-copy`, description: original.description })
    .select("id")
    .single();
  if (!newFlavor) return;

  // Copy all steps
  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("order_by, humor_flavor_step_type_id, llm_model_id, llm_temperature, llm_input_type_id, llm_output_type_id, llm_system_prompt, llm_user_prompt, description")
    .eq("humor_flavor_id", id)
    .order("order_by");

  if (steps && steps.length > 0) {
    const copies = steps.map((s) => ({
      ...s,
      humor_flavor_id: newFlavor.id,
    }));
    await supabase.from("humor_flavor_steps").insert(copies);
  }

  revalidatePath("/");
}
