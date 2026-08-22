import { cache } from "react";

/**
 * Obtiene el valor actual de la UF.
 * - Primero intenta obtenerlo desde la API pública de mindicador.cl (con revalidación de 1 hora).
 * - Si la API falla, usa el valor manual configurado en site_settings (uf_valor_manual).
 * - Si ninguna está disponible, lanza un error para que la UI lo maneje.
 */
export async function getValorUF(): Promise<{ valor: number; fuente: "api" | "manual"; fecha: string }> {
  // Intento 1: API pública de mindicador.cl
  try {
    const res = await fetch("https://mindicador.cl/api/uf", { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const valor = Number(data?.serie?.[0]?.valor);
      const fecha = data?.serie?.[0]?.fecha ?? new Date().toISOString();
      if (Number.isFinite(valor) && valor > 0) {
        return { valor, fuente: "api", fecha };
      }
    }
  } catch {
    // Falló la API, intentamos con el valor manual
  }

  // Intento 2: Valor manual desde site_settings
  try {
    const { getSiteSettings } = await import("@/lib/settings");
    const settings = await getSiteSettings();
    if (settings?.uf_valor_manual && settings.uf_valor_manual > 0) {
      return {
        valor: settings.uf_valor_manual,
        fuente: "manual",
        fecha: settings.uf_actualizado_en ?? new Date().toISOString(),
      };
    }
  } catch {
    // No hay valor manual disponible
  }

  // Si nada funciona, retornamos un error
  throw new Error("No se pudo obtener el valor de la UF");
}

/**
 * Versión cacheada para uso en componentes Server
 */
export const getCachedValorUF = cache(getValorUF);