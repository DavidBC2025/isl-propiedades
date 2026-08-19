import { supabase } from "@/lib/supabase";
import type { Agente } from "@/types/isl";

export async function getAgentesActivos(): Promise<Agente[]> {
  try {
    const { data, error } = await supabase.from("agentes").select("*").eq("activo", true).order("orden", { ascending: true });
    return error || !data ? [] : (data as Agente[]);
  } catch {
    return [];
  }
}
