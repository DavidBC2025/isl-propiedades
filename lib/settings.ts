import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/types/isl";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return null;
    const settings = data as SiteSettings;
    if (!settings.logo) {
      const { data: files } = await supabase.storage.from("contenidos").list("branding", { search: "logo.png" });
      if (files && files.some((f) => f.name === "logo.png")) {
        settings.logo = supabase.storage.from("contenidos").getPublicUrl("branding/logo.png").data.publicUrl;
      }
    }
    return settings;
  } catch {
    return null;
  }
}
