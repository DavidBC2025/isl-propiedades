"use client";

import { useRouter } from "next/navigation";
import type { Barrio } from "@/types/isl";

type MapaBarriosProps = {
  barrios: (Barrio & { count: number })[];
};

export function MapaBarrios({ barrios }: MapaBarriosProps) {
  const router = useRouter();

  // Definición de las zonas del mapa
  // Basado en una silueta aproximada de la V Región costa e interior
  const zonas = [
    { id: "concon", label: "Concón", d: "M 200,50 L 250,60 L 240,110 L 190,100 Z", slug: "concon" },
    { id: "renaca", label: "Reñaca", d: "M 190,100 L 240,110 L 230,160 L 180,150 Z", slug: "renaca" },
    { id: "vina", label: "Viña del Mar", d: "M 180,150 L 230,160 L 220,210 L 170,200 Z", slug: "vina-del-mar" },
    { id: "recreo", label: "Recreo", d: "M 170,200 L 220,210 L 210,260 L 160,250 Z", slug: "recreo" },
    { id: "quilpue", label: "Quilpué", d: "M 240,110 L 320,130 L 310,180 L 230,160 Z", slug: "quilpue" },
    { id: "v-alemana", label: "Villa Alemana", d: "M 320,130 L 380,140 L 370,190 L 310,180 Z", slug: "villa-alemana" },
    { id: "penablanca", label: "Peñablanca", d: "M 380,140 L 430,150 L 420,200 L 370,190 Z", slug: "penablanca" },
    { id: "olmue", label: "Olmué", d: "M 430,150 L 500,160 L 490,210 L 420,200 Z", slug: "olmue" },
  ];

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-sm bg-isl-champagne/10 md:aspect-[3/1]">
      <svg
        viewBox="0 0 600 300"
        className="h-full w-full fill-isl-black/5 stroke-isl-black/20"
        aria-label="Mapa de barrios interactivo"
      >
        {zonas.map((zona) => {
          const barrioData = barrios.find(b => b.slug === zona.slug);
          if (!barrioData) return null;

          return (
            <g
              key={zona.id}
              className="cursor-pointer group transition-all duration-300 motion-safe:hover:scale-[1.01]"
              onClick={() => router.push(`/barrios/${zona.slug}`)}
            >
              <path
                d={zona.d}
                className="transition-colors group-hover:fill-isl-gold/20 motion-reduce:transition-none"
              />
              {/* Tooltip simple en SVG o texto flotante */}
              <text
                x={getCenter(zona.d).x}
                y={getCenter(zona.d).y}
                textAnchor="middle"
                className="pointer-events-none fill-isl-black font-serif text-[10px] font-medium uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100"
              >
                {zona.label} ({barrioData.count})
              </text>
              {/* Etiqueta fija más pequeña */}
              <text
                x={getCenter(zona.d).x}
                y={getCenter(zona.d).y}
                textAnchor="middle"
                className="pointer-events-none fill-isl-black/40 font-sans text-[8px] font-medium group-hover:opacity-0"
              >
                {zona.label}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Indicador de ayuda */}
      <div className="absolute bottom-4 left-4 text-[10px] font-medium uppercase tracking-widest text-isl-gray">
        Explora las zonas haciendo click
      </div>
    </div>
  );
}

// Función auxiliar para aproximar el centro de un path simple (trapecio)
function getCenter(d: string) {
  const points = d.match(/-?\d+/g)?.map(Number) || [];
  if (points.length < 8) return { x: 0, y: 0 };
  
  const x = (points[0] + points[2] + points[4] + points[6]) / 4;
  const y = (points[1] + points[3] + points[5] + points[7]) / 4;
  
  return { x, y };
}
