import { supabase } from "@/lib/supabase";
import type { CasoPreparacion } from "@/types/isl";

export async function getCasosPreparacionPublicados(): Promise<CasoPreparacion[]> {
  try {
    const { data, error } = await supabase.from("casos_preparacion").select("*, propiedad:propiedades(*)").eq("publicado", true).order("orden", { ascending: true });
    return error || !data ? [] : (data as CasoPreparacion[]);
  } catch {
    return [];
  }
}
