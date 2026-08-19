import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/types/isl";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    return error || !data ? null : (data as SiteSettings);
  } catch {
    return null;
  }
}
