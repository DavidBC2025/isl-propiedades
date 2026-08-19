"use client";

import { useState } from "react";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { formatUF } from "@/lib/format";
import { portadaImagen } from "@/lib/ficha";
import { generateFichaPDF } from "@/lib/pdf-ficha";
import { COMPARE_NOTICE, useComparador } from "@/lib/useComparador";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Agente, Propiedad } from "@/types/isl";

type FichaAccionesProps = {
  propiedad: Propiedad;
  agente: Agente | null;
};

export function FichaAcciones({ propiedad, agente }: FichaAccionesProps) {
  const { isSelected, toggle, notice } = useComparador();
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const selected = isSelected(propiedad.slug);
  const cover = portadaImagen(propiedad.imagenes);
  const compareMessage = notice ?? null;

  async function onPdf() {
    setBusy(true);
    setPdfStatus(null);
    try {
      await generateFichaPDF(propiedad, agente);
      setPdfStatus("Listo, descargamos la ficha.");
    } catch (error) {
      console.error("No se pudo generar la ficha PDF:", error);
      setPdfStatus("No pudimos armar el PDF. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  function onCompare() {
    toggle(propiedad.slug, {
      slug: propiedad.slug,
      titulo: propiedad.titulo,
      imagen: cover?.url ?? null,
      precio_uf: propiedad.precio_uf,
    });
  }

  async function onCopy() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("Link copiado.");
    } catch {
      setCopyStatus("No se pudo copiar. Copia la dirección desde el navegador.");
    }
  }

  function onWhatsApp() {
    const href = buildWhatsAppLink("", `${propiedad.titulo} · ${formatUF(propiedad.precio_uf)} · ${window.location.href}`);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <ButtonISL type="button" variant="primary" onClick={onPdf} disabled={busy}>
          {busy ? "Preparando PDF…" : "Descargar ficha PDF"}
        </ButtonISL>
        <ButtonISL type="button" variant={selected ? "gold" : "outline"} onClick={onCompare}>
          {selected ? "Quitar de comparar" : "Agregar a comparar"}
        </ButtonISL>
        <ButtonISL type="button" variant="outline" onClick={onWhatsApp}>Compartir por WhatsApp</ButtonISL>
        <ButtonISL type="button" variant="ghost" onClick={onCopy}>Copiar link</ButtonISL>
      </div>
      {compareMessage ? <p role="status" className="text-sm text-isl-black/70">{compareMessage === COMPARE_NOTICE ? COMPARE_NOTICE : compareMessage}</p> : null}
      {pdfStatus ? <p role="status" className="text-sm text-isl-black/70">{pdfStatus}</p> : null}
      {copyStatus ? <p role="status" className="text-sm text-isl-black/70">{copyStatus}</p> : null}
    </div>
  );
}
