"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { getValorUF, type ValorUF } from "@/lib/uf";
import { getSiteSettings } from "@/lib/settings";

export default function CalculadoraPage() {
  const [ufData, setUfData] = useState<ValorUF | null>(null);
  const [ufManual, setUfManual] = useState("");
  const [precioUF, setPrecioUF] = useState("");
  const [modo, setModo] = useState<"uf_a_clp" | "clp_a_uf">("uf_a_clp");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function cargarDatos() {
      const [uf, sett] = await Promise.all([getValorUF(), getSiteSettings()]);
      setUfData(uf);
      setSettings(sett);
      if (uf.valor > 0) {
        setUfManual(uf.valor.toString());
      }
    }
    cargarDatos();
  }, []);

  const precioUFNum = parseFloat(precioUF) || 0;
  const ufValorNum = ufManual ? parseFloat(ufManual) : (ufData?.valor || 0);

  const resultadoCLP = modo === "uf_a_clp" ? precioUFNum * ufValorNum : precioUFNum / ufValorNum;
  const resultado = modo === "uf_a_clp" ? resultadoCLP : resultadoCLP;

  // Estimaciones desde settings
  const comisionUF = settings?.calc_comision_porcentaje ? (precioUFNum * settings.calc_comision_porcentaje) / 100 : 0;
  const gastosEscrituraUF = settings?.calc_gastos_escritura_uf || 0;
  const pieUF = settings?.calc_pie_porcentaje ? (precioUFNum * settings.calc_pie_porcentaje) / 100 : 0;

  const formatearCLP = (valor: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const formatearUF = (valor: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  return (
    <main className="pb-24 pt-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">
            Herramientas
          </p>
          <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl">
            Calculadora Inmobiliaria
          </h1>
          <p className="font-serif text-xl leading-relaxed text-isl-black/80 md:text-2xl">
            Convierte valores y estima costos de tu próxima inversión.
          </p>
        </div>

        <div className="mx-auto max-w-2xl space-y-8">
          {/* Valor UF del día */}
          <div className="rounded-sm border border-isl-black/10 bg-isl-offwhite p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl text-isl-black">Valor UF</h2>
              {ufData && (
                <span className="text-xs text-isl-gray">
                  {ufData.fuente === "api" ? "Valor UF de hoy" : "Valor UF configurado manualmente"}
                </span>
              )}
            </div>
            {ufData?.valor && ufData.valor > 0 ? (
              <div className="text-3xl font-bold text-isl-black">
                {formatearCLP(ufData.valor)}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-isl-black/70">
                  No pudimos obtener el valor del día. Ingresa el valor manualmente:
                </p>
                <input
                  type="number"
                  value={ufManual}
                  onChange={(e) => setUfManual(e.target.value)}
                  placeholder="Ej: 38000"
                  className="w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base"
                />
              </div>
            )}
          </div>

          {/* Conversor */}
          <div className="rounded-sm border border-isl-black/10 bg-isl-offwhite p-6">
            <h2 className="mb-6 font-serif text-xl text-isl-black">Conversor UF ↔ CLP</h2>
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setModo("uf_a_clp")}
                className={`flex-1 rounded-sm px-4 py-2 text-xs font-medium uppercase tracking-widest ${
                  modo === "uf_a_clp" ? "bg-isl-black text-isl-white" : "bg-isl-white text-isl-black"
                }`}
              >
                UF a CLP
              </button>
              <button
                type="button"
                onClick={() => setModo("clp_a_uf")}
                className={`flex-1 rounded-sm px-4 py-2 text-xs font-medium uppercase tracking-widest ${
                  modo === "clp_a_uf" ? "bg-isl-black text-isl-white" : "bg-isl-white text-isl-black"
                }`}
              >
                CLP a UF
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-isl-black">
                  {modo === "uf_a_clp" ? "Valor en UF" : "Valor en CLP"}
                </label>
                <input
                  type="number"
                  value={precioUF}
                  onChange={(e) => setPrecioUF(e.target.value)}
                  placeholder={modo === "uf_a_clp" ? "Ej: 1000" : "Ej: 38000000"}
                  className="w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base"
                />
              </div>
              {precioUF && ufValorNum > 0 && (
                <div className="rounded-sm bg-isl-black/5 p-4">
                  <p className="mb-1 text-sm text-isl-black/70">Resultado:</p>
                  <p className="text-2xl font-bold text-isl-black">
                    {modo === "uf_a_clp" ? formatearCLP(resultado) : formatearUF(resultado) + " UF"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Estimaciones */}
          <div className="rounded-sm border border-isl-black/10 bg-isl-offwhite p-6">
            <h2 className="mb-6 font-serif text-xl text-isl-black">Estimación de costos</h2>
            <div className="mb-4">
              <label className="mb-2 block text-sm text-isl-black">Precio de la propiedad (UF)</label>
              <input
                type="number"
                value={precioUF}
                onChange={(e) => setPrecioUF(e.target.value)}
                placeholder="Ej: 1000"
                className="w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base"
              />
            </div>
            {precioUF && settings && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-isl-black/70">Comisión ({settings.calc_comision_porcentaje || 0}%)</span>
                  <span className="font-medium text-isl-black">{formatearUF(comisionUF)} UF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-isl-black/70">Gastos de escritura</span>
                  <span className="font-medium text-isl-black">{formatearUF(gastosEscrituraUF)} UF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-isl-black/70">Pie sugerido ({settings.calc_pie_porcentaje || 0}%)</span>
                  <span className="font-medium text-isl-black">{formatearUF(pieUF)} UF</span>
                </div>
                <div className="mt-4 border-t border-isl-black/10 pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-isl-black">Total costos adicionales</span>
                    <span className="font-bold text-isl-black">{formatearUF(comisionUF + gastosEscrituraUF)} UF</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          {settings?.disclaimer_calculadora && (
            <div className="rounded-sm border border-isl-gold/30 bg-isl-champagne/30 p-4">
              <p className="text-xs leading-relaxed text-isl-black/80">
                {settings.disclaimer_calculadora}
              </p>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
