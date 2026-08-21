"use server";

import { revalidatePath } from "next/cache";
import { isMissingRelation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AccionResultado = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { supabase: null, error: "Tu sesión se cerró. Entra de nuevo para continuar." } as const;
  }
  return { supabase, error: null } as const;
}

function friendlyError(error: { code?: string; message?: string } | null): string {
  if (isMissingRelation(error)) return "Todavía no está lista la tabla de ajustes. Hay que aplicar la migración en Supabase.";
  if (error?.code === "42501") return "No pudimos guardar. Cierra sesión y entra de nuevo.";
  return "No pudimos guardar. Revisa los datos e inténtalo de nuevo.";
}

export async function guardarGeneral(input: {
  home_headline: string | null;
  home_subheadline: string | null;
  email_general: string | null;
  whatsapp_general: string | null;
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("site_settings").upsert({
    id: 1,
    home_headline: input.home_headline?.trim() || null,
    home_subheadline: input.home_subheadline?.trim() || null,
    email_general: input.email_general?.trim() || null,
    whatsapp_general: input.whatsapp_general?.trim() || null,
  });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/ajustes");
  return { ok: true };
}

export async function guardarCalculadora(input: {
  uf_valor_manual: number | null;
  calc_comision_porcentaje: number | null;
  calc_gastos_escritura_uf: number | null;
  calc_pie_porcentaje: number | null;
  disclaimer_calculadora: string | null;
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("site_settings").upsert({
    id: 1,
    uf_valor_manual: input.uf_valor_manual ?? null,
    calc_comision_porcentaje: input.calc_comision_porcentaje ?? null,
    calc_gastos_escritura_uf: input.calc_gastos_escritura_uf ?? null,
    calc_pie_porcentaje: input.calc_pie_porcentaje ?? null,
    disclaimer_calculadora: input.disclaimer_calculadora?.trim() || null,
  });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/admin/ajustes");
  return { ok: true };
}

export async function guardarComoTrabajamos(input: {
  como_trabajamos: { titulo: string; texto: string }[];
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("site_settings").upsert({
    id: 1,
    como_trabajamos: input.como_trabajamos,
  });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/ajustes");
  return { ok: true };
}

export async function guardarCasoPreparacion(input: {
  id?: string;
  imagen_antes: string;
  imagen_despues: string;
  descripcion_corta: string | null;
  propiedad_id: string | null;
  publicado: boolean | null;
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  if (!input.imagen_antes?.trim()) {
    return { ok: false, error: "Falta la foto del antes." };
  }
  if (!input.imagen_despues?.trim()) {
    return { ok: false, error: "Falta la foto del después." };
  }

  const row = {
    imagen_antes: input.imagen_antes.trim(),
    imagen_despues: input.imagen_despues.trim(),
    descripcion_corta: input.descripcion_corta?.trim() || null,
    propiedad_id: input.propiedad_id || null,
    publicado: input.publicado ?? false,
  };

  if (input.id) {
    const { error } = await auth.supabase.from("casos_preparacion").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendlyError(error) };
    revalidatePath("/");
    revalidatePath("/admin/ajustes");
    return { ok: true };
  }

  const maxOrden = await getMaxOrden(auth.supabase);
  const { error } = await auth.supabase.from("casos_preparacion").insert({ ...row, orden: maxOrden + 1 });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/ajustes");
  return { ok: true };
}

export async function eliminarCasoPreparacion(id: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("casos_preparacion").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/ajustes");
  return { ok: true };
}

async function getMaxOrden(supabase: SupabaseClient): Promise<number> {
  try {
    const { data, error } = await supabase.from("casos_preparacion").select("orden").order("orden", { ascending: false }).limit(1);
    if (error || !data || data.length === 0) return 0;
    return (data[0].orden as number) ?? 0;
  } catch {
    return 0;
  }
}
