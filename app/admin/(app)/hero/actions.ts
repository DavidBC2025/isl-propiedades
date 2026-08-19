"use server";

import { revalidatePath } from "next/cache";
import { isMissingRelation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { HeroSlide, Propiedad } from "@/types/isl";

export type AccionResultado = { ok: true; id?: string } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { supabase: null, error: "Tu sesión se cerró. Entra de nuevo para continuar." } as const;
  }
  return { supabase, error: null } as const;
}

function friendlyError(error: { code?: string; message?: string } | null): string {
  if (isMissingRelation(error)) return "Todavía no está lista la tabla de hero. Hay que aplicar la migración en Supabase.";
  if (error?.code === "42501") return "No pudimos guardar. Cierra sesión y entra de nuevo.";
  return "No pudimos guardar. Revisa los datos e inténtalo de nuevo.";
}

export async function guardarHeroSlide(input: {
  id?: string;
  media_type: "image" | "video" | null;
  media_url: string | null;
  titulo: string | null;
  subtitulo: string | null;
  cta_primario_label: string | null;
  cta_primario_href: string | null;
  cta_secundario_label: string | null;
  cta_secundario_href: string | null;
  orden: number | null;
  activo: boolean | null;
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const activosCount = await countActivos(auth.supabase, input.id);
  if (input.activo && activosCount >= 5) {
    return { ok: false, error: "Ya tienes 5 destacados activos, desactiva uno primero para activar este." };
  }

  const row = {
    media_type: input.media_type,
    media_url: input.media_url,
    titulo: input.titulo,
    subtitulo: input.subtitulo,
    cta_primario_label: input.cta_primario_label,
    cta_primario_href: input.cta_primario_href,
    cta_secundario_label: input.cta_secundario_label,
    cta_secundario_href: input.cta_secundario_href,
    orden: input.orden,
    activo: input.activo,
  };

  if (input.id) {
    const { error } = await auth.supabase.from("hero_slides").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendlyError(error) };
    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true, id: input.id };
  }

  const maxOrden = await getMaxOrden(auth.supabase);
  const { data, error } = await auth.supabase.from("hero_slides").insert({ ...row, orden: maxOrden + 1 }).select("id").single();
  if (error || !data) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { ok: true, id: data.id };
}

export async function eliminarHeroSlide(id: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("hero_slides").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { ok: true, id };
}

export async function reordenarHeroSlides(ids: string[]): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const updates = ids.map((id, index) => auth.supabase!.from("hero_slides").update({ orden: index }).eq("id", id));
  const results = await Promise.all(updates);
  const anyError = results.some((result) => result.error);
  if (anyError) return { ok: false, error: "No pudimos reordenar. Inténtalo de nuevo." };
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { ok: true };
}

export async function crearHeroDesdePropiedad(propiedadId: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const activosCount = await countActivos(auth.supabase);
  if (activosCount >= 5) {
    return { ok: false, error: "Ya tienes 5 destacados activos, desactiva uno primero para activar este." };
  }

  const { data: propiedad, error: propError } = await auth.supabase.from("propiedades").select("*").eq("id", propiedadId).maybeSingle();
  if (propError || !propiedad) return { ok: false, error: "No encontramos esa propiedad." };

  const prop = propiedad as Propiedad;
  const cover = Array.isArray(prop.imagenes) ? prop.imagenes.find((img) => img.portada) || prop.imagenes[0] : null;
  const media_url = cover?.url || null;

  const maxOrden = await getMaxOrden(auth.supabase);
  const { data, error } = await auth.supabase.from("hero_slides").insert({
    propiedad_id: propiedadId,
    media_type: media_url ? "image" : null,
    media_url,
    titulo: prop.titulo || null,
    subtitulo: `${prop.operacion === "arriendo" ? "Arriendo" : "Venta"} en ${prop.comuna}`,
    cta_primario_label: "Ver propiedad",
    cta_primario_href: `/propiedades/${prop.slug}`,
    orden: maxOrden + 1,
    activo: true,
  }).select("id").single();

  if (error || !data) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/hero");
  revalidatePath("/admin/propiedades");
  return { ok: true, id: data.id };
}

async function countActivos(supabase: Awaited<ReturnType<typeof createServerSupabase>>, excludeId?: string): Promise<number> {
  try {
    let query = supabase.from("hero_slides").select("id", { count: "exact", head: true }).eq("activo", true);
    if (excludeId) query = query.neq("id", excludeId);
    const { count, error } = await query;
    return error || count == null ? 0 : count;
  } catch {
    return 0;
  }
}

async function getMaxOrden(supabase: Awaited<ReturnType<typeof createServerSupabase>>): Promise<number> {
  try {
    const { data, error } = await supabase.from("hero_slides").select("orden").order("orden", { ascending: false }).limit(1);
    if (error || !data || data.length === 0) return 0;
    return (data[0].orden as number) ?? 0;
  } catch {
    return 0;
  }
}