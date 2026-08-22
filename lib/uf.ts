import { getSiteSettings } from "@/lib/settings";

export type UFFuente = "api" | "manual";

export interface ValorUF {
  valor: number;
  fuente: UFFuente;
  fecha: string;
}

export async function getValorUF(): Promise<ValorUF> {
  try {
    const response = await fetch("https://mindicador.cl/api/uf", {
      next: { revalidate: 3600 }, // 1 hora
    });
    if (!response.ok) throw new Error("API falló");

    const data = await response.json() as { serie: Array<{ valor: number; fecha: string }> };
    const hoy = data.serie[0];
    if (!hoy?.valor) throw new Error("Sin valor en API");

    return {
      valor: hoy.valor,
      fuente: "api",
      fecha: hoy.fecha,
    };
  } catch {
    // Fallback a valor manual configurado
    try {
      const settings = await getSiteSettings();
      if (settings?.uf_valor_manual) {
        return {
          valor: settings.uf_valor_manual,
          fuente: "manual",
          fecha: new Date().toISOString(),
        };
      }
    } catch {
      // Settings fallan, sigue a modo manual
    }

    // Último recurso: modo manual (valor 0 indica que el usuario debe ingresarlo)
    return {
      valor: 0,
      fuente: "manual",
      fecha: new Date().toISOString(),
    };
  }
}
