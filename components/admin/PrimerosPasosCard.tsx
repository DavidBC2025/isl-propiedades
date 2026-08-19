"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PrimerosPasos } from "@/lib/admin";

const STORAGE_KEY = "isl:admin:primeros-pasos-oculto";

const STEPS: { key: keyof PrimerosPasos; title: string; href: string }[] = [
  { key: "perfilAgente", title: "Completa tu perfil (foto, WhatsApp y en qué te especializas)", href: "/admin/agentes" },
  { key: "whatsappTitular", title: "Configura el WhatsApp y el titular del sitio", href: "/admin/ajustes" },
  { key: "primeraPropiedad", title: "Publica tu primera propiedad con fotos", href: "/admin/propiedades/nueva" },
  { key: "destacadoPortada", title: "Elige esa propiedad como destacado de portada", href: "/admin/hero" },
  { key: "unBarrio", title: "Publica al menos un barrio", href: "/admin/barrios" },
];

export function PrimerosPasosCard({ pasos }: { pasos: PrimerosPasos }) {
  const pending = STEPS.filter((step) => !pasos[step.key]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (pending.length === 0) return null;

  function minimize() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setHidden(true);
  }

  function restore() {
    window.localStorage.removeItem(STORAGE_KEY);
    setHidden(false);
  }

  if (hidden) {
    return (
      <button type="button" onClick={restore} className="text-sm underline-offset-4 hover:underline">
        Mostrar primeros pasos
      </button>
    );
  }

  return (
    <section className="border border-isl-black/10 bg-isl-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Primeros pasos</p>
          <h2 className="mt-2 font-serif text-3xl font-normal text-isl-black">Esto es lo primero que va a ver alguien que entra a tu sitio</h2>
        </div>
        <button type="button" onClick={minimize} className="min-h-11 text-sm text-isl-black/60 underline-offset-4 hover:underline">
          Ocultar
        </button>
      </div>
      <ol className="mt-6 space-y-3">
        {STEPS.map((step) => {
          const done = pasos[step.key];
          return (
            <li key={step.key}>
              <Link
                href={step.href}
                className="flex min-h-11 items-start gap-3 rounded-sm px-2 py-2 hover:bg-isl-offwhite"
              >
                <span
                  className={[
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm text-xs",
                    done ? "bg-isl-gold text-isl-black" : "border border-isl-black/20 text-isl-gray",
                  ].join(" ")}
                  aria-hidden
                >
                  {done ? "✓" : ""}
                </span>
                <span className={done ? "text-sm text-isl-black/55 line-through" : "text-sm text-isl-black"}>
                  {step.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
