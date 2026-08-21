"use client";

import { useState } from "react";
import type { CasoPreparacion } from "@/types/isl";

type GaleriaAntesDespuesProps = {
  casos: CasoPreparacion[];
};

export function GaleriaAntesDespues({ casos }: GaleriaAntesDespuesProps) {
  const [selectedId, setSelectedId] = useState(casos[0]?.id);
  const selectedCaso = casos.find((c) => c.id === selectedId);

  if (casos.length === 0) return null;

  return (
    <div className="isl-fade-up space-y-8">
      {/* Selectores de Casos */}
      {casos.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 border-b border-isl-black/10 pb-6">
          {casos.map((caso, index) => (
            <button
              key={caso.id}
              onClick={() => setSelectedId(caso.id)}
              className={[
                "min-h-9 px-4 text-xs font-medium uppercase tracking-[0.12em] transition-colors",
                selectedId === caso.id
                  ? "bg-isl-black text-isl-white"
                  : "text-isl-black/60 hover:text-isl-black",
              ].join(" ")}
            >
              Caso {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Visor de un Caso */}
      {selectedCaso && (
        <div className="grid gap-8 md:grid-cols-2">
          <div className="group space-y-4">
            <div className="overflow-hidden rounded-sm bg-isl-champagne/20">
              <p className="p-2 text-center text-[11px] font-medium uppercase tracking-widest text-isl-gray">
                Antes de ISL
              </p>
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={selectedCaso.imagen_antes} 
                  alt="Propiedad antes de preparación" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          <div className="group space-y-4">
            <div className="overflow-hidden rounded-sm bg-isl-champagne/40">
              <p className="p-2 text-center text-[11px] font-medium uppercase tracking-widest text-isl-gold">
                Después de ISL
              </p>
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={selectedCaso.imagen_despues} 
                  alt="Propiedad después de preparación" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {selectedCaso.descripcion_corta && (
            <div className="col-span-full text-center">
              <p className="mx-auto max-w-2xl text-sm italic text-isl-black/70">
                "{selectedCaso.descripcion_corta}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
