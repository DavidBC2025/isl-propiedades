import { createAlerta } from "@/lib/alertas";
import type { Alerta } from "@/types/isl";

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

function parseOperacion(value: unknown): Alerta["operacion"] {
  return value === "venta" || value === "arriendo" ? value : null;
}

function parseTipo(value: unknown): Alerta["tipo"] {
  return value === "casa" || value === "departamento" || value === "parcela" ? value : null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "No pudimos leer el formulario." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const precio = asNumber(body.precio_max_uf ?? body.precio_max);
  const created = await createAlerta({
    email: asString(body.email) ?? "",
    comuna: asString(body.comuna) ?? null,
    operacion: parseOperacion(body.operacion),
    tipo: parseTipo(body.tipo),
    precio_max_uf: precio,
  });

  if (!created.success) {
    return Response.json(
      { message: created.message ?? "No pudimos guardar tu alerta." },
      { status: created.missingTable ? 503 : 400 },
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}
