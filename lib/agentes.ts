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

export async function getAgenteById(id: string): Promise<Agente | null> {
  try {
    const { data, error } = await supabase.from("agentes").select("*").eq("id", id).eq("activo", true).maybeSingle();
    return error || !data ? null : (data as Agente);
  } catch {
    return null;
  }
}
