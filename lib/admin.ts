import { createServerSupabase } from "@/lib/supabase/server";
import type { Agente, Barrio, HeroSlide, Lead, Propiedad, SiteSettings } from "@/types/isl";

export type PrimerosPasos = {
  perfilAgente: boolean;
  whatsappTitular: boolean;
  primeraPropiedad: boolean;
  destacadoPortada: boolean;
  unBarrio: boolean;
};

export type AdminResumen = {
  publicadas: number;
  borradores: number;
  consultasNuevas: number;
  pasos: PrimerosPasos;
};

function hasPhotos(propiedad: Pick<Propiedad, "imagenes">): boolean {
  return Array.isArray(propiedad.imagenes) && propiedad.imagenes.some((image) => Boolean(image?.url));
}

function perfilCompleto(agente: Agente): boolean {
  return Boolean(agente.foto_url?.trim() && agente.whatsapp?.trim() && agente.especialidad?.trim());
}

export async function getAdminResumen(): Promise<AdminResumen> {
  const empty: AdminResumen = {
    publicadas: 0,
    borradores: 0,
    consultasNuevas: 0,
    pasos: {
      perfilAgente: false,
      whatsappTitular: false,
      primeraPropiedad: false,
      destacadoPortada: false,
      unBarrio: false,
    },
  };

  try {
    const supabase = await createServerSupabase();
    const [propiedadesRes, leadsRes, agentesRes, settingsRes, heroRes, barriosRes] = await Promise.all([
      supabase.from("propiedades").select("id, estado, imagenes, en_hero, propiedad_principal"),
      supabase.from("leads").select("id, estado"),
      supabase.from("agentes").select("*"),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("hero_slides").select("id, activo"),
      supabase.from("barrios").select("id, publicado"),
    ]);

    const propiedades = (propiedadesRes.error || !propiedadesRes.data ? [] : propiedadesRes.data) as Pick<Propiedad, "id" | "estado" | "imagenes" | "en_hero" | "propiedad_principal">[];
    const leads = (leadsRes.error || !leadsRes.data ? [] : leadsRes.data) as Pick<Lead, "id" | "estado">[];
    const agentes = (agentesRes.error || !agentesRes.data ? [] : agentesRes.data) as Agente[];
    const settings = (settingsRes.error || !settingsRes.data ? null : settingsRes.data) as SiteSettings | null;
    const hero = (heroRes.error || !heroRes.data ? [] : heroRes.data) as Pick<HeroSlide, "id" | "activo">[];
    const barrios = (barriosRes.error || !barriosRes.data ? [] : barriosRes.data) as Pick<Barrio, "id" | "publicado">[];

    const publicadas = propiedades.filter((item) => item.estado === "publicada").length;
    const borradores = propiedades.filter((item) => item.estado === "borrador").length;
    const consultasNuevas = leads.filter((item) => item.estado === "nuevo").length;

    return {
      publicadas,
      borradores,
      consultasNuevas,
      pasos: {
        perfilAgente: agentes.some(perfilCompleto),
        whatsappTitular: Boolean(settings?.whatsapp_general?.trim() && settings?.home_headline?.trim()),
        primeraPropiedad: propiedades.some((item) => item.estado === "publicada" && hasPhotos(item)),
        destacadoPortada: hero.some((item) => item.activo) || propiedades.some((item) => item.en_hero || item.propiedad_principal),
        unBarrio: barrios.some((item) => item.publicado),
      },
    };
  } catch {
    return empty;
  }
}

export async function getAdminPropiedades(): Promise<Propiedad[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("propiedades").select("*, agente:agentes(*)").order("updated_at", { ascending: false });
    return error || !data ? [] : (data as Propiedad[]);
  } catch {
    return [];
  }
}

export async function getAdminLeads(): Promise<Lead[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    return error || !data ? [] : (data as Lead[]);
  } catch {
    return [];
  }
}

export async function getAdminPropiedadById(id: string): Promise<Propiedad | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("propiedades").select("*, agente:agentes(*)").eq("id", id).maybeSingle();
    return error || !data ? null : (data as Propiedad);
  } catch {
    return null;
  }
}

export async function getAdminAgentes(): Promise<Agente[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("agentes").select("*").order("orden", { ascending: true });
    return error || !data ? [] : (data as Agente[]);
  } catch {
    return [];
  }
}

export async function countConsultasNuevas(): Promise<number> {
  try {
    const supabase = await createServerSupabase();
    const { count, error } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("estado", "nuevo");
    return error || count == null ? 0 : count;
  } catch {
    return 0;
  }
}

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("hero_slides").select("*").order("orden", { ascending: true });
    return error || !data ? [] : (data as HeroSlide[]);
  } catch {
    return [];
  }
}
