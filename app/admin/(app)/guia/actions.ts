"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/format";
import { isMissingRelation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Articulo } from "@/types/isl";

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
  if (isMissingRelation(error)) return "Todavía no está lista la tabla de artículos. Hay que aplicar la migración en Supabase.";
  if (error?.code === "42501") return "No pudimos guardar. Cierra sesión y entra de nuevo.";
  if (error?.code === "23505") return "Ya hay un artículo con ese título. Cambia un poco el título y vuelve a guardar.";
  return "No pudimos guardar. Revisa los datos e inténtalo de nuevo.";
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createServerSupabase>>, titulo: string, excludeId?: string): Promise<string> {
  const base = slugify(titulo) || "articulo";
  let slug = base;
  let n = 2;

  while (n < 50) {
    const { data } = await supabase.from("articulos").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function guardarArticulo(input: {
  id?: string;
  titulo: string;
  slug?: string;
  extracto: string | null;
  contenido: string | null;
  categoria: "comprar" | "vender" | "invertir" | "barrio" | "tips" | null;
  etiquetas: string[] | null;
  imagen_destacada: string | null;
  seo_title: string | null;
  meta_description: string | null;
  estado: "publicado" | "borrador" | null;
  es_reporte: boolean | null;
  archivo_pdf_url: string | null;
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  if (!input.titulo?.trim()) {
    return { ok: false, error: "Falta el título del artículo." };
  }

  const slug = input.slug
    ? input.slug
    : input.id
      ? await uniqueSlug(auth.supabase, input.titulo, input.id)
      : await uniqueSlug(auth.supabase, input.titulo);

  const fechaPublicacion = input.estado === "publicado"
    ? (input.id ? undefined : new Date().toISOString())
    : null;

  const row = {
    slug,
    titulo: input.titulo.trim(),
    extracto: input.extracto?.trim() || null,
    contenido: input.contenido?.trim() || null,
    categoria: input.categoria,
    etiquetas: input.etiquetas || [],
    imagen_destacada: input.imagen_destacada || null,
    seo_title: input.seo_title?.trim() || null,
    meta_description: input.meta_description?.trim() || null,
    estado: input.estado ?? "borrador",
    fecha_publicacion: fechaPublicacion,
    es_reporte: input.es_reporte ?? false,
    archivo_pdf_url: input.archivo_pdf_url || null,
  };

  if (input.id) {
    const { error } = await auth.supabase.from("articulos").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendlyError(error) };
    revalidatePath("/");
    revalidatePath("/admin/guia");
    revalidatePath("/guia");
    return { ok: true, id: input.id };
  }

  const { data, error } = await auth.supabase.from("articulos").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/guia");
  revalidatePath("/guia");
  return { ok: true, id: data.id };
}

export async function eliminarArticulo(id: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("articulos").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/guia");
  revalidatePath("/guia");
  return { ok: true, id };
}