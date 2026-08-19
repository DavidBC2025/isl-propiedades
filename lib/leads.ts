import { supabase } from "@/lib/supabase";
import { isMissingRelation } from "@/lib/supabase-errors";
import type { Lead, LeadTipo } from "@/types/isl";

export type LeadPayload = Pick<Lead, "nombre" | "email" | "telefono" | "mensaje" | "comuna" | "tipo_propiedad" | "m2" | "dormitorios" | "propiedad_id" | "agente_id" | "origen_url"> & {
  tipo: LeadTipo;
  payload?: Record<string, unknown>;
};

export type CreateLeadResult = {
  success: boolean;
  lead?: Lead;
  missingTable?: boolean;
  message?: string;
};

const LEAD_TIPOS: LeadTipo[] = ["contacto", "tasacion", "vender", "visita", "alerta", "newsletter", "guia"];

function optionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function optionalUuid(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed) ? trimmed : null;
}

export function isLeadTipo(value: unknown): value is LeadTipo {
  return typeof value === "string" && LEAD_TIPOS.includes(value as LeadTipo);
}

export async function createLead(payload: LeadPayload): Promise<CreateLeadResult> {
  const nombre = payload.nombre?.trim();
  if (!nombre) {
    return { success: false, message: "Necesitamos al menos tu nombre para guardar la consulta." };
  }

  const id = crypto.randomUUID();
  const row = {
    id,
    tipo: payload.tipo,
    nombre,
    email: optionalText(payload.email),
    telefono: optionalText(payload.telefono),
    mensaje: optionalText(payload.mensaje),
    comuna: optionalText(payload.comuna),
    tipo_propiedad: optionalText(payload.tipo_propiedad),
    m2: payload.m2 ?? null,
    dormitorios: payload.dormitorios ?? null,
    propiedad_id: optionalUuid(payload.propiedad_id),
    agente_id: optionalUuid(payload.agente_id),
    origen_url: optionalText(payload.origen_url),
    estado: "nuevo" as const,
    notificado: false,
    payload: payload.payload ?? {},
  };

  try {
    const { error } = await supabase.from("leads").insert(row);
    if (error) {
      if (isMissingRelation(error)) {
        return { success: false, missingTable: true, message: "La tabla de consultas aún no está disponible. Intenta más tarde." };
      }
      return { success: false, message: "No pudimos guardar tu consulta. Intenta de nuevo." };
    }

    return {
      success: true,
      lead: {
        ...row,
        notificado_en: null,
        created_at: new Date().toISOString(),
      },
    };
  } catch {
    return { success: false, message: "No pudimos guardar tu consulta. Intenta de nuevo." };
  }
}

export async function markLeadNotificado(leadId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc("marcar_lead_notificado", { p_id: leadId });
    if (error) {
      console.error("No se pudo marcar el lead como notificado:", error.message);
    }
  } catch (error) {
    console.error("No se pudo marcar el lead como notificado:", error);
  }
}
