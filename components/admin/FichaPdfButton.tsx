"use client";

import { useState } from "react";
import { generateFichaPDF } from "@/lib/pdf-ficha";
import type { Agente, Propiedad } from "@/types/isl";

type FichaPdfButtonProps = {
  propiedad: Propiedad;
  agente: Agente | null;
  onDone?: (message: string) => void;
  className?: string;
  children?: string;
};

export function FichaPdfButton({ propiedad, agente, onDone, className, children = "Descargar ficha PDF" }: FichaPdfButtonProps) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      await generateFichaPDF(propiedad, agente);
      onDone?.("Listo, descargamos la ficha.");
    } catch (error) {
      console.error("No se pudo generar la ficha PDF:", error);
      onDone?.("No pudimos armar el PDF. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={className} onClick={() => void onClick()} disabled={busy}>
      {busy ? "Preparando PDF…" : children}
    </button>
  );
}
