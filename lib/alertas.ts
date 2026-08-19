import { supabase } from "@/lib/supabase";
import { isMissingRelation } from "@/lib/supabase-errors";
import type { Alerta } from "@/types/isl";

export type CreateAlertaInput = {
  email: string;
  comuna?: string | null;
  operacion?: Alerta["operacion"];
  tipo?: Alerta["tipo"];
  precio_max_uf?: number | null;
};

export type CreateAlertaResult = {
  success: boolean;
  alerta?: Alerta;
  missingTable?: boolean;
  message?: string;
};

export async function createAlerta(input: CreateAlertaInput): Promise<CreateAlertaResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { success: false, message: "Necesitamos un correo válido para avisarte." };
  }

  const token = crypto.randomUUID();
  const row = {
    email,
    comuna: input.comuna?.trim() || null,
    operacion: input.operacion ?? null,
    tipo: input.tipo ?? null,
    precio_max_uf: input.precio_max_uf ?? null,
    token,
    activa: true,
  };

  try {
    const { error } = await supabase.from("alertas").insert(row);
    if (error) {
      if (isMissingRelation(error)) {
        return { success: false, missingTable: true, message: "Las alertas aún no están disponibles. Intenta más tarde." };
      }
      return { success: false, message: "No pudimos guardar tu alerta. Intenta de nuevo." };
    }
    return {
      success: true,
      alerta: { ...row, id: token, created_at: new Date().toISOString() },
    };
  } catch {
    return { success: false, message: "No pudimos guardar tu alerta. Intenta de nuevo." };
  }
}

export async function bajaAlertaPorToken(token: string): Promise<boolean> {
  const value = token.trim();
  if (!value) return false;

  try {
    const { data, error } = await supabase.rpc("baja_alerta", { p_token: value });
    if (error) {
      if (isMissingRelation(error)) return false;
      console.error("No se pudo dar de baja la alerta:", error.message);
      return false;
    }
    return data === true;
  } catch (error) {
    console.error("No se pudo dar de baja la alerta:", error);
    return false;
  }
}
