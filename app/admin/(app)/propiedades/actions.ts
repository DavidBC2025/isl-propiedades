"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/format";
import type { PropiedadGuardarInput } from "@/lib/propiedad-admin";
import { isMissingRelation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Propiedad, PropiedadImagen } from "@/types/isl";

export type AccionResultado = { ok: true; id?: string; titulo?: string } | { ok: false; error: string };

function revalidatePropiedad(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/propiedades");
  revalidatePath("/");
  revalidatePath("/propiedades");
  if (slug) revalidatePath(`/propiedades/${slug}`);
}

async function requireUser() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { supabase: null, error: "Tu sesión se cerró. Entra de nuevo para continuar." } as const;
  }
  return { supabase, error: null } as const;
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createServerSupabase>>, titulo: string, excludeId?: string): Promise<string> {
  const base = slugify(titulo) || "propiedad";
  let slug = base;
  let n = 2;

  while (n < 50) {
    const { data } = await supabase.from("propiedades").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }

  return `${base}-${Date.now().toString(36)}`;
}

function rowFromInput(input: PropiedadGuardarInput, slug: string, estado: Propiedad["estado"], fechaPublicacion: string | null) {
  const imagenes: PropiedadImagen[] = input.imagenes.map((image, index) => ({
    url: image.url,
    alt: image.alt,
    portada: index === 0,
    orden: index,
  }));

  return {
    slug,
    titulo: input.titulo,
    operacion: input.operacion,
    tipo: input.tipo,
    precio_uf: input.precio_uf,
    comuna: input.comuna,
    sector: input.sector,
    direccion_publica: input.direccion_publica,
    lat: input.lat,
    lng: input.lng,
    dormitorios: input.dormitorios,
    banos: input.banos,
    estacionamientos: input.estacionamientos,
    m2_construidos: input.m2_construidos,
    m2_terreno: input.m2_terreno,
    gastos_comunes_uf: input.gastos_comunes_uf,
    orientacion: input.orientacion,
    vista: input.vista,
    descripcion: input.descripcion,
    caracteristicas: input.caracteristicas,
    video_url: input.video_url,
    tour_url: input.tour_url,
    imagenes,
    estado,
    agente_id: input.agente_id,
    fecha_publicacion: fechaPublicacion,
  };
}

function friendlyError(error: { code?: string; message?: string } | null): string {
  if (isMissingRelation(error)) return "Todavía no está lista la tabla de propiedades. Hay que aplicar la migración en Supabase.";
  if (error?.code === "42501") return "No pudimos guardar. Cierra sesión y entra de nuevo.";
  if (error?.code === "23505") return "Ya hay una propiedad con un nombre muy parecido. Cambia un poco el título y vuelve a guardar.";
  return "No pudimos guardar. Revisa los datos e inténtalo de nuevo.";
}

export async function guardarPropiedad(input: PropiedadGuardarInput): Promise<AccionResultado> {
  const minimoFaltante = !input.titulo?.trim() || input.precio_uf == null || !input.comuna?.trim() || !input.operacion || !input.tipo;
  if (minimoFaltante) {
    return { ok: false, error: "Para guardar hacen falta título, precio en UF, comuna, si es venta o arriendo, y el tipo." };
  }

  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const current = input.id
    ? await auth.supabase.from("propiedades").select("id, slug, estado, fecha_publicacion").eq("id", input.id).maybeSingle()
    : { data: null, error: null };

  if (current.error) return { ok: false, error: friendlyError(current.error) };

  const slug = input.id && current.data?.slug
    ? current.data.slug
    : await uniqueSlug(auth.supabase, input.titulo);

  let estado: Propiedad["estado"] = "borrador";
  if (input.intent === "publicar") estado = "publicada";
  else if (input.intent === "mantener") estado = (current.data?.estado as Propiedad["estado"]) ?? "borrador";
  else estado = "borrador";

  const fechaPublicacion = estado === "publicada"
    ? (current.data?.fecha_publicacion ?? new Date().toISOString())
    : (current.data?.fecha_publicacion ?? null);

  const row = rowFromInput(input, slug, estado, fechaPublicacion);

  if (input.id) {
    const { error } = await auth.supabase.from("propiedades").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendlyError(error) };
    revalidatePropiedad(slug);
    const aviso = input.intent === "publicar" ? "publicada" : input.intent === "borrador" ? "borrador" : "guardada";
    redirect(`/admin/propiedades/${input.id}/editar?aviso=${aviso}`);
  }

  const { data, error } = await auth.supabase.from("propiedades").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: friendlyError(error) };
  revalidatePropiedad(slug);
  const aviso = input.intent === "publicar" ? "publicada" : "borrador";
  redirect(`/admin/propiedades/${data.id}/editar?aviso=${aviso}`);
}

export async function cambiarEstadoPropiedad(id: string, estado: "publicada" | "despublicada"): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { data: current, error: loadError } = await auth.supabase.from("propiedades").select("id, slug, fecha_publicacion").eq("id", id).maybeSingle();
  if (loadError || !current) return { ok: false, error: "No encontramos esa propiedad." };

  const patch: Record<string, unknown> = { estado };
  if (estado === "publicada" && !current.fecha_publicacion) {
    patch.fecha_publicacion = new Date().toISOString();
  }

  const { error } = await auth.supabase.from("propiedades").update(patch).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePropiedad(current.slug);
  return { ok: true, id };
}

export async function duplicarPropiedad(id: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { data, error } = await auth.supabase.from("propiedades").select("*").eq("id", id).maybeSingle();
  if (error || !data) return { ok: false, error: "No encontramos esa propiedad para copiarla." };

  const original = data as Propiedad;
  const titulo = `${original.titulo} (copia)`;
  const slug = await uniqueSlug(auth.supabase, titulo);

  const { id: _id, created_at: _created, updated_at: _updated, agente: _agente, ...rest } = original as Propiedad & { agente?: unknown };
  void _id;
  void _created;
  void _updated;
  void _agente;

  const copy = {
    ...rest,
    titulo,
    slug,
    estado: "borrador" as const,
    imagenes: [],
    propiedad_principal: false,
    en_hero: false,
    hero_orden: null,
    fecha_publicacion: null,
  };

  const { error: insertError } = await auth.supabase.from("propiedades").insert(copy);
  if (insertError) return { ok: false, error: friendlyError(insertError) };
  revalidatePropiedad();
  return { ok: true, titulo };
}

export async function eliminarPropiedad(id: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { data } = await auth.supabase.from("propiedades").select("slug").eq("id", id).maybeSingle();
  const { error } = await auth.supabase.from("propiedades").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePropiedad(data?.slug);
  return { ok: true, id };
}
