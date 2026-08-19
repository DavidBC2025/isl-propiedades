import { supabase } from "@/lib/supabase";
import type { Propiedad } from "@/types/isl";

export type PropiedadFiltros = {
  comuna?: string;
  operacion?: Propiedad["operacion"];
  tipo?: Propiedad["tipo"];
  precioMinUf?: number;
  precioMaxUf?: number;
  dormitoriosMin?: number;
  limit?: number;
};

const PUBLIC_STATES = ["publicada", "reservada", "vendida"];
const WITH_AGENT = "*, agente:agentes(*)";

export async function getPropiedadesPublicadas(filtros: PropiedadFiltros = {}): Promise<Propiedad[]> {
  try {
    let query = supabase.from("propiedades").select(WITH_AGENT).in("estado", PUBLIC_STATES).order("fecha_publicacion", { ascending: false });
    if (filtros.comuna) query = query.eq("comuna", filtros.comuna);
    if (filtros.operacion) query = query.eq("operacion", filtros.operacion);
    if (filtros.tipo) query = query.eq("tipo", filtros.tipo);
    if (filtros.precioMinUf !== undefined) query = query.gte("precio_uf", filtros.precioMinUf);
    if (filtros.precioMaxUf !== undefined) query = query.lte("precio_uf", filtros.precioMaxUf);
    if (filtros.dormitoriosMin !== undefined) query = query.gte("dormitorios", filtros.dormitoriosMin);
    if (filtros.limit !== undefined) query = query.limit(filtros.limit);

    const { data, error } = await query;
    return error || !data ? [] : (data as Propiedad[]);
  } catch {
    return [];
  }
}

export async function getPropiedadBySlug(slug: string): Promise<Propiedad | null> {
  try {
    const { data, error } = await supabase.from("propiedades").select(WITH_AGENT).eq("slug", slug).in("estado", PUBLIC_STATES).maybeSingle();
    return error || !data ? null : (data as Propiedad);
  } catch {
    return null;
  }
}

export async function getPropiedadesSimilares(propiedad: Pick<Propiedad, "id" | "comuna" | "tipo">, limit = 3): Promise<Propiedad[]> {
  try {
    let query = supabase.from("propiedades").select(WITH_AGENT).in("estado", PUBLIC_STATES).neq("id", propiedad.id).limit(limit);
    if (propiedad.comuna) query = query.eq("comuna", propiedad.comuna);
    if (propiedad.tipo) query = query.eq("tipo", propiedad.tipo);
    const { data, error } = await query;
    return error || !data ? [] : (data as Propiedad[]);
  } catch {
    return [];
  }
}

export async function getPropiedadPrincipal(): Promise<Propiedad | null> {
  try {
    const { data, error } = await supabase.from("propiedades").select(WITH_AGENT).eq("propiedad_principal", true).in("estado", PUBLIC_STATES).maybeSingle();
    return error || !data ? null : (data as Propiedad);
  } catch {
    return null;
  }
}
