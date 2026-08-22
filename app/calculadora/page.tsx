import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { getValorUF } from "@/lib/uf";
import { getSiteSettings } from "@/lib/settings";
import type { SiteSettings } from "@/types/isl";
import CalculadoraClient from "./client";

export const metadata: Metadata = {
  title: "Calculadora ISL | ISL Propiedades",
  description: "Calculadora de referencia UF/CLP para estimar comisiones, gastos de escritura y pie sugerido en tu compra de propiedad en Viña del Mar.",
};

export default async function CalculadoraPage() {
  let ufInfo: { valor: number; fuente: "api" | "manual"; fecha: string } | null = null;
  let settings: SiteSettings | null = null;

  try {
    ufInfo = await getValorUF();
  } catch {
    ufInfo = null;
  }

  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }

  return (
    <main className="pb-24 pt-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">
            Calculadora
          </p>
          <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl">
            Estimación de costos
          </h1>
          <p className="font-serif text-xl leading-relaxed text-isl-black/80 md:text-2xl">
            Usa esta herramienta para orientarte sobre comisiones, gastos de escritura y pie sugerido.
            Todos los valores son referenciales: la cotización real parte de conocer tu propiedad.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-isl-black/60">Cargando calculadora…</div>}>
          <CalculadoraClient
            ufInicial={ufInfo?.valor ?? null}
            ufFuente={ufInfo?.fuente ?? null}
            ufFecha={ufInfo?.fecha ?? null}
            settings={settings}
          />
        </Suspense>

        {settings?.disclaimer_calculadora ? (
          <p className="mt-12 text-center text-xs leading-relaxed text-isl-black/60">
            {settings.disclaimer_calculadora}
          </p>
        ) : (
          <p className="mt-12 text-center text-xs leading-relaxed text-isl-black/60">
            * Esta calculadora es solo una referencia. Los valores reales dependen de cada operación,
            propiedad y momento del mercado. Siempre consulta con un profesional antes de tomar una decisión.
          </p>
        )}
      </Container>
    </main>
  );
}