import { supabase } from "@/lib/supabase";
import type { Articulo } from "@/types/isl";

export async function getArticulosPublicados(): Promise<Articulo[]> {
  try {
    const { data, error } = await supabase.from("articulos").select("*").eq("estado", "publicado").order("fecha_publicacion", { ascending: false });
    return error || !data ? [] : (data as Articulo[]);
  } catch {
    return [];
  }
}

export async function getArticuloBySlug(slug: string): Promise<Articulo | null> {
  try {
    const { data, error } = await supabase.from("articulos").select("*").eq("slug", slug).eq("estado", "publicado").maybeSingle();
    return error || !data ? null : (data as Articulo);
  } catch {
    return null;
  }
}
