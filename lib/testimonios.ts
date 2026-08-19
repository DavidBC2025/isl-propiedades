import { supabase } from "@/lib/supabase";
import type { Testimonio } from "@/types/isl";

export async function getTestimoniosPublicados(): Promise<Testimonio[]> {
  try {
    const { data, error } = await supabase.from("testimonios").select("*, propiedad:propiedades(*)").eq("publicado", true).order("created_at", { ascending: false });
    return error || !data ? [] : (data as Testimonio[]);
  } catch {
    return [];
  }
}
