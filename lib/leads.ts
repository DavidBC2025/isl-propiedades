import type { Lead, LeadTipo } from "@/types/isl";

export type LeadPayload = Pick<Lead, "nombre" | "email" | "telefono" | "mensaje" | "comuna" | "tipo_propiedad" | "m2" | "dormitorios" | "propiedad_id" | "agente_id" | "origen_url"> & {
  tipo: LeadTipo;
  payload?: Record<string, unknown>;
};

export type CreateLeadResult = {
  success: boolean;
  lead?: Lead;
};

// La creación y las notificaciones se implementan juntas en el Prompt 7.
export async function createLead(_payload: LeadPayload): Promise<CreateLeadResult> {
  return { success: false };
}
