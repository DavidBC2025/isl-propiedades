"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/format";
import { isMissingRelation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Barrio } from "@/types/isl";

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
  if (isMissingRelation(error)) return "Todavía no está lista la tabla de barrios. Hay que aplicar la migración en Supabase.";
  if (error?.code === "42501") return "No pudimos guardar. Cierra sesión y entra de nuevo.";
  if (error?.code === "23505") return "Ya hay un barrio con ese nombre. Cambia un poco el nombre y vuelve a guardar.";
  return "No pudimos guardar. Revisa los datos e inténtalo de nuevo.";
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createServerSupabase>>, nombre: string, excludeId?: string): Promise<string> {
  const base = slugify(nombre) || "barrio";
  let slug = base;
  let n = 2;

  while (n < 50) {
    const { data } = await supabase.from("barrios").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function guardarBarrio(input: {
  id?: string;
  nombre: string;
  hero_image: string | null;
  extracto: string | null;
  contenido: string | null;
  tips: string[];
  seo_title: string | null;
  meta_description: string | null;
  publicado: boolean | null;
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  if (!input.nombre?.trim()) {
    return { ok: false, error: "Falta el nombre del barrio." };
  }

  const slug = input.id
    ? await uniqueSlug(auth.supabase, input.nombre, input.id)
    : await uniqueSlug(auth.supabase, input.nombre);

  const row = {
    slug,
    nombre: input.nombre.trim(),
    hero_image: input.hero_image || null,
    extracto: input.extracto?.trim() || null,
    contenido: input.contenido?.trim() || null,
    tips: input.tips || [],
    seo_title: input.seo_title?.trim() || null,
    meta_description: input.meta_description?.trim() || null,
    publicado: input.publicado ?? false,
  };

  if (input.id) {
    const { error } = await auth.supabase.from("barrios").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendlyError(error) };
    revalidatePath("/");
    revalidatePath("/admin/barrios");
    revalidatePath("/barrios");
    return { ok: true, id: input.id };
  }

  const { data, error } = await auth.supabase.from("barrios").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/barrios");
  revalidatePath("/barrios");
  return { ok: true, id: data.id };
}

export async function eliminarBarrio(id: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("barrios").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/barrios");
  revalidatePath("/barrios");
  return { ok: true, id };
}