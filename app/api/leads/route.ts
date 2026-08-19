import { getAgenteById } from "@/lib/agentes";
import { createLead, isLeadTipo } from "@/lib/leads";
import { notifyLeadByEmail } from "@/lib/lead-notify";
import { getSiteSettings } from "@/lib/settings";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : null;
  }
  return null;
}

function hasHoneypot(body: Record<string, unknown>): boolean {
  const traps = [body.website, body.honeypot, body.company];
  return traps.some((value) => typeof value === "string" && value.trim().length > 0);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "No pudimos leer el formulario." }, { status: 400 });
  }

  if (hasHoneypot(body)) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const tipoRaw = asString(body.tipo);
  if (!tipoRaw || !isLeadTipo(tipoRaw)) {
    return Response.json({ message: "El tipo de consulta no es válido." }, { status: 400 });
  }

  const created = await createLead({
    tipo: tipoRaw,
    nombre: asString(body.nombre) ?? "",
    email: asString(body.email) ?? null,
    telefono: asString(body.telefono) ?? null,
    mensaje: asString(body.mensaje) ?? null,
    comuna: asString(body.comuna) ?? null,
    tipo_propiedad: asString(body.tipo_propiedad) ?? null,
    m2: asNumber(body.m2),
    dormitorios: asNumber(body.dormitorios) !== null ? Math.round(asNumber(body.dormitorios) as number) : null,
    propiedad_id: asString(body.propiedad_id) ?? null,
    agente_id: asString(body.agente_id) ?? null,
    origen_url: asString(body.origen_url) ?? null,
  });

  if (!created.success || !created.lead) {
    return Response.json(
      { message: created.message ?? "No pudimos guardar tu consulta." },
      { status: created.missingTable ? 503 : 400 },
    );
  }

  try {
    const settings = await getSiteSettings();
    const agente = created.lead.agente_id ? await getAgenteById(created.lead.agente_id) : null;
    await notifyLeadByEmail(created.lead, settings, agente);
  } catch (error) {
    console.error("La notificación del lead falló después de guardar:", error);
  }

  return Response.json({ ok: true }, { status: 200 });
}
