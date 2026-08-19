import { supabase } from "@/lib/supabase";
import type { HeroSlide } from "@/types/isl";

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const { data, error } = await supabase.from("hero_slides").select("*, propiedad:propiedades(*)").eq("activo", true).order("orden", { ascending: true });
    return error || !data ? [] : (data as HeroSlide[]);
  } catch {
    return [];
  }
}
