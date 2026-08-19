"use client";

import { useState } from "react";
import { downloadBlob, generateSocialImage, type SocialImageFormat } from "@/lib/social-image";
import { portadaImagen } from "@/lib/ficha";
import type { Propiedad } from "@/types/isl";

type ImagenRedesButtonProps = {
  propiedad: Propiedad;
  onDone?: (message: string) => void;
  className?: string;
};

export function ImagenRedesButton({ propiedad, onDone, className }: ImagenRedesButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const hasPhoto = Boolean(portadaImagen(propiedad.imagenes)?.url);

  async function generate(formato: SocialImageFormat) {
    setBusy(true);
    try {
      const blob = await generateSocialImage(propiedad, formato);
      downloadBlob(blob, `isl-${propiedad.slug}-${formato}.jpg`);
      setOpen(false);
      onDone?.("Listo, descargamos la imagen.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos armar la imagen. Intenta de nuevo.";
      onDone?.(message);
    } finally {
      setBusy(false);
    }
  }

  if (!hasPhoto) {
    return (
      <button type="button" disabled className={className} title="Sube al menos una foto primero">
        Generar imagen para redes
      </button>
    );
  }

  return (
    <div className="relative">
      <button type="button" className={className} onClick={() => setOpen((value) => !value)}>
        Generar imagen para redes
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-sm border border-isl-black/10 bg-isl-white p-2 shadow-lg">
          <p className="px-2 py-1 text-xs text-isl-black/60">Elige el formato</p>
          <button type="button" disabled={busy} onClick={() => void generate("cuadrado")} className="block min-h-11 w-full px-2 text-left text-sm hover:bg-isl-offwhite disabled:opacity-50">
            Cuadrado (feed)
          </button>
          <button type="button" disabled={busy} onClick={() => void generate("historia")} className="block min-h-11 w-full px-2 text-left text-sm hover:bg-isl-offwhite disabled:opacity-50">
            Historia
          </button>
        </div>
      ) : null}
    </div>
  );
}
