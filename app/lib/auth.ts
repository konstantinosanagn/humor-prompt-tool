import { createClient } from "@/app/lib/supabase/server";

export async function getCurrentUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
