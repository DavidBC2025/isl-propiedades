"use server";

import { revalidatePath } from "next/cache";
import { isMissingRelation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";

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
  if (isMissingRelation(error)) return "Todavía no está lista la tabla de consultas. Hay que aplicar la migración en Supabase.";
  if (error?.code === "42501") return "No pudimos guardar. Cierra sesión y entra de nuevo.";
  return "No pudimos guardar. Inténtalo de nuevo.";
}

export async function cambiarEstadoLead(leadId: string, estado: "nuevo" | "contactado" | "cerrado"): Promise<AccionResultado> {
  const auth = await requireUser();
  if (!auth.supabase) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("leads").update({ estado }).eq("id", leadId);
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath("/admin/leads");
  return { ok: true };
}