import { supabase } from "@/lib/supabase";
import type { Barrio } from "@/types/isl";

export async function getBarriosPublicados(): Promise<Barrio[]> {
  try {
    const { data, error } = await supabase.from("barrios").select("*").eq("publicado", true).order("nombre", { ascending: true });
    return error || !data ? [] : (data as Barrio[]);
  } catch {
    return [];
  }
}

export async function getBarrioBySlug(slug: string): Promise<Barrio | null> {
  try {
    const { data, error } = await supabase.from("barrios").select("*").eq("slug", slug).eq("publicado", true).maybeSingle();
    return error || !data ? null : (data as Barrio);
  } catch {
    return null;
  }
}
