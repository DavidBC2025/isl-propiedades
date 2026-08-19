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
  page?: number;
  pageSize?: number;
};

const PUBLIC_STATES = ["publicada", "reservada", "vendida"];
const WITH_AGENT = "*, agente:agentes(*)";

function applyPublicFilters<T extends { eq: (column: string, value: unknown) => T; gte: (column: string, value: unknown) => T; lte: (column: string, value: unknown) => T }>(query: T, filtros: PropiedadFiltros): T {
  let next = query;
  if (filtros.comuna) next = next.eq("comuna", filtros.comuna);
  if (filtros.operacion) next = next.eq("operacion", filtros.operacion);
  if (filtros.tipo) next = next.eq("tipo", filtros.tipo);
  if (filtros.precioMinUf !== undefined) next = next.gte("precio_uf", filtros.precioMinUf);
  if (filtros.precioMaxUf !== undefined) next = next.lte("precio_uf", filtros.precioMaxUf);
  if (filtros.dormitoriosMin !== undefined) next = next.gte("dormitorios", filtros.dormitoriosMin);
  return next;
}

export async function getPropiedadesPublicadas(filtros: PropiedadFiltros = {}): Promise<Propiedad[]> {
  try {
    let query = supabase.from("propiedades").select(WITH_AGENT).in("estado", PUBLIC_STATES).order("fecha_publicacion", { ascending: false });
    query = applyPublicFilters(query, filtros);
    if (filtros.pageSize !== undefined) {
      const page = Math.max(1, filtros.page ?? 1);
      const from = (page - 1) * filtros.pageSize;
      query = query.range(from, from + filtros.pageSize - 1);
    } else if (filtros.limit !== undefined) {
      query = query.limit(filtros.limit);
    }

    const { data, error } = await query;
    return error || !data ? [] : (data as Propiedad[]);
  } catch {
    return [];
  }
}

export async function countPropiedadesPublicadas(filtros: PropiedadFiltros = {}): Promise<number> {
  try {
    let query = supabase.from("propiedades").select("id", { count: "exact", head: true }).in("estado", PUBLIC_STATES);
    query = applyPublicFilters(query, filtros);
    const { count, error } = await query;
    return error || count == null ? 0 : count;
  } catch {
    return 0;
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

export async function getPropiedadesPorSlugs(slugs: string[]): Promise<Propiedad[]> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  try {
    const { data, error } = await supabase.from("propiedades").select(WITH_AGENT).in("slug", unique).in("estado", PUBLIC_STATES);
    if (error || !data) return [];
    const bySlug = new Map((data as Propiedad[]).map((propiedad) => [propiedad.slug, propiedad]));
    return unique.flatMap((slug) => {
      const propiedad = bySlug.get(slug);
      return propiedad ? [propiedad] : [];
    });
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
