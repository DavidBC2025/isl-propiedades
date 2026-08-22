"use client";

import { useState, useMemo } from "react";
import { formatUF } from "@/lib/format";
import type { SiteSettings } from "@/types/isl";

type CalculadoraClientProps = {
  ufInicial: number | null;
  ufFuente: "api" | "manual" | null;
  ufFecha: string | null;
  settings: SiteSettings | null;
};

export default function CalculadoraClient({ ufInicial, ufFuente, ufFecha, settings }: CalculadoraClientProps) {
  const [precioUFInput, setPrecioUFInput] = useState("");
  const [ufManualInput, setUfManualInput] = useState("");

  const precioUF = precioUFInput ? Number(precioUFInput) : null;
  const ufValor = ufInicial ?? (ufManualInput ? Number(ufManualInput) : null);

  const resultados = useMemo(() => {
    if (!precioUF || !ufValor) return null;

    const comisionPorc = settings?.calc_comision_porcentaje ?? 3.0;
    const gastosEscrituraUF = settings?.calc_gastos_escritura_uf ?? 5.0;
    const piePorc = settings?.calc_pie_porcentaje ?? 10.0;

    const comisionUF = (precioUF * comisionPorc) / 100;
    const gastosEscrituraCLP = ufValor * gastosEscrituraUF;
    const pieUF = (precioUF * piePorc) / 100;
    const pieCLP = pieUF * ufValor;

    return {
      comisionUF,
      comisionCLP: comisionUF * ufValor,
      gastosEscrituraUF: gastosEscrituraUF,
      gastosEscrituraCLP,
      pieUF,
      pieCLP,
      totalUF: comisionUF + gastosEscrituraUF + pieUF,
      totalCLP: (comisionUF + gastosEscrituraUF + pieUF) * ufValor,
    };
  }, [precioUF, ufValor, settings]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Valor UF */}
      <div className="rounded-sm border border-isl-black/10 bg-isl-offwhite p-6">
        <h3 className="mb-4 font-serif text-lg text-isl-black">Valor de la UF</h3>
        {ufValor && ufFuente !== null ? (
          <p className="text-sm text-isl-black/70">
            {ufFuente === "api" ? "Valor UF de hoy" : "Valor UF configurado manualmente"}:{" "}
            <span className="font-medium">
              {ufValor.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
            </span>
            {ufFecha ? ` (actualizado ${new Date(ufFecha).toLocaleDateString("es-CL")})` : null}
          </p>
        ) : (
          <div className="flex items-end gap-4">
            <label className="block flex-1">
              <span className="text-xs text-isl-black/60">Ingresa el valor de la UF manualmente</span>
              <input
                type="number"
                min="0"
                step="1"
                value={ufManualInput}
                onChange={(e) => setUfManualInput(e.target.value)}
                className="mt-1 block w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base text-isl-black"
                placeholder="Ej: 38000"
              />
            </label>
          </div>
        )}
      </div>

      {/* Precio de la propiedad */}
      <div className="rounded-sm border border-isl-black/10 bg-isl-offwhite p-6">
        <h3 className="mb-4 font-serif text-lg text-isl-black">Precio de la propiedad</h3>
        <label className="block">
          <span className="text-xs text-isl-black/60">Precio en UF</span>
          <input
            type="number"
            min="0"
            step="1"
            value={precioUFInput}
            onChange={(e) => setPrecioUFInput(e.target.value)}
            className="mt-1 block w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base text-isl-black"
            placeholder="Ej: 3500"
            disabled={!ufValor}
          />
        </label>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="space-y-6 rounded-sm border border-isl-black/10 bg-isl-white p-6">
          <h3 className="font-serif text-lg text-isl-black">Resultado estimado</h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-isl-black/60">Comisión de corretaje</p>
              <p className="font-medium text-isl-black">{formatUF(resultados.comisionUF)}</p>
              <p className="text-xs text-isl-black/50">(UF {resultados.comisionUF.toFixed(2)})</p>
            </div>

            <div>
              <p className="text-sm text-isl-black/60">Gastos de escritura</p>
              <p className="font-medium text-isl-black">{formatUF(resultados.gastosEscrituraUF)}</p>
              <p className="text-xs text-isl-black/50">
                (CLP {resultados.gastosEscrituraCLP.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })})
              </p>
            </div>

            <div>
              <p className="text-sm text-isl-black/60">Pie sugerido</p>
              <p className="font-medium text-isl-black">{formatUF(resultados.pieUF)}</p>
              <p className="text-xs text-isl-black/50">
                (CLP {resultados.pieCLP.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })})
              </p>
            </div>

            <div className="border-t border-isl-black/10 pt-4">
              <p className="text-sm text-isl-black/60">Total estimado (costos indirectos)</p>
              <p className="font-medium text-isl-black">{formatUF(resultados.totalUF)}</p>
              <p className="text-xs text-isl-black/50">
                (CLP referencial: {resultados.totalCLP.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })})
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}