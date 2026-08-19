"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/format";
import { isMissingRelation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Agente } from "@/types/isl";

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
  if (isMissingRelation(error)) return "Todavía no está lista la tabla de agentes. Hay que aplicar la migración en Supabase.";
  if (error?.code === "42501") return "No pudimos guardar. Cierra sesión y entra de nuevo.";
  if (error?.code === "23505") return "Ya hay un agente con un nombre muy parecido. Cambia un poco el nombre y vuelve a guardar.";
  return "No pudimos guardar. Revisa los datos e inténtalo de nuevo.";
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createServerSupabase>>, nombre: string, apellido: string, excludeId?: string): Promise<string> {
  const base = slugify(`${nombre} ${apellido}`) || "agente";
  let slug = base;
  let n = 2;

  while (n < 50) {
    const { data } = await supabase.from("agentes").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }

  return `${base}-${Date.now().toString(36)}`;
}

async function getMaxOrden(supabase: Awaited<ReturnType<typeof createServerSupabase>>): Promise<number> {
  try {
    const { data, error } = await supabase.from("agentes").select("orden").order("orden", { ascending: false }).limit(1);
    if (error || !data || data.length === 0) return 0;
    return (data[0].orden as number) ?? 0;
  } catch {
    return 0;
  }
}

export async function guardarAgente(input: {
  id?: string;
  nombre: string;
  apellido: string | null;
  rol: string | null;
  bio: string | null;
  foto_url: string | null;
  email: string | null;
  whatsapp: string | null;
  especialidad: string | null;
  activo: boolean | null;
}): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  if (!input.nombre?.trim()) {
    return { ok: false, error: "Falta el nombre del agente." };
  }

  const slug = input.id
    ? await uniqueSlug(auth.supabase, input.nombre, input.apellido || "", input.id)
    : await uniqueSlug(auth.supabase, input.nombre, input.apellido || "");

  const maxOrden = await getMaxOrden(auth.supabase);
  const row = {
    slug,
    nombre: input.nombre.trim(),
    apellido: input.apellido?.trim() || null,
    rol: input.rol?.trim() || null,
    bio: input.bio?.trim() || null,
    foto_url: input.foto_url || null,
    email: input.email?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    especialidad: input.especialidad?.trim() || null,
    activo: input.activo ?? true,
    orden: input.id ? undefined : maxOrden + 1,
  };

  if (input.id) {
    const { error } = await auth.supabase.from("agentes").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendlyError(error) };
    revalidatePath("/");
    revalidatePath("/admin/agentes");
    return { ok: true, id: input.id };
  }

  const { data, error } = await auth.supabase.from("agentes").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/agentes");
  return { ok: true, id: data.id };
}

export async function eliminarAgente(id: string): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("agentes").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/");
  revalidatePath("/admin/agentes");
  return { ok: true, id };
}