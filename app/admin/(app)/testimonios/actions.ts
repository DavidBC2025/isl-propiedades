"use server";

import { revalidatePath } from "next/cache";
import { isMissingRelation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Testimonio } from "@/types/isl";

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
  if (isMissingRelation(error)) return "Todavía no está lista la tabla de testimonios. Hay que aplicar la migración en Supabase.";
  if (error?.code === "42501") return "No pudimos guardar. Cierra sesión y entra de nuevo.";
  return "No pudimos guardar. Revisa los datos e inténtalo de nuevo.";
}

export async function guardarTestimonio(input: {
  id?: string;
  nombre: string;
  rol_ciudad: string | null;
  texto: string;
  foto_url: string | null;
  propiedad_id: string | null;
  destacado: boolean | null;
  publicado: boolean | null;
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  if (!input.nombre?.trim()) {
    return { ok: false, error: "Falta el nombre de la persona." };
  }

  if (!input.texto?.trim()) {
    return { ok: false, error: "Falta el testimonio." };
  }

  const row = {
    nombre: input.nombre.trim(),
    rol_ciudad: input.rol_ciudad?.trim() || null,
    texto: input.texto.trim(),
    foto_url: input.foto_url || null,
    propiedad_id: input.propiedad_id || null,
    destacado: input.destacado ?? false,
    publicado: input.publicado ?? false,
  };

  if (input.id) {
    const { error } = await auth.supabase.from("testimonios").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendlyError(error) };
    revalidatePath("/");
    revalidatePath("/admin/testimonios");
    return { ok: true, id: input.id };
  }

  const { data, error } = await auth.supabase.from("testimonios").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/testimonios");
  return { ok: true, id: data.id };
}

export async function eliminarTestimonio(id: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("testimonios").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/testimonios");
  return { ok: true, id };
}