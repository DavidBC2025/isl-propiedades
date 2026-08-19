import { formatUF } from "@/lib/format";
import { portadaImagen } from "@/lib/ficha";
import type { Agente, Propiedad } from "@/types/isl";

function blobToJpegDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxWidth = 1600;
        const scale = Math.min(1, maxWidth / Math.max(image.width, 1));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
          return;
        }
        context.fillStyle = "#F7F7F5";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    image.src = objectUrl;
  });
}

async function loadCoverJpeg(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/") && blob.type !== "application/octet-stream") return null;
    return await blobToJpegDataUrl(blob);
  } catch {
    return null;
  }
}

export async function generateFichaPDF(propiedad: Propiedad, agente: Agente | null): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(198, 168, 124);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ISL PROPIEDADES", margin, 12);
  y = 28;

  const cover = portadaImagen(propiedad.imagenes);
  if (cover?.url) {
    try {
      const jpeg = await loadCoverJpeg(cover.url);
      if (jpeg) {
        const photoHeight = 78;
        doc.addImage(jpeg, "JPEG", margin, y, contentWidth, photoHeight);
        y += photoHeight + 10;
      }
    } catch (error) {
      console.error("La foto de portada no se pudo incluir en el PDF:", error);
    }
  }

  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(propiedad.titulo || "Propiedad ISL", contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(198, 168, 124);
  doc.text(formatUF(propiedad.precio_uf), margin, y);
  y += 8;

  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const lugar = [propiedad.comuna, propiedad.sector].filter(Boolean).join(" · ");
  if (lugar) {
    doc.text(lugar, margin, y);
    y += 8;
  }

  const specs = [
    propiedad.dormitorios != null ? `${propiedad.dormitorios} dormitorios` : null,
    propiedad.banos != null ? `${propiedad.banos} baños` : null,
    propiedad.m2_construidos != null ? `${new Intl.NumberFormat("es-CL").format(propiedad.m2_construidos)} m² construidos` : null,
    propiedad.m2_terreno != null ? `${new Intl.NumberFormat("es-CL").format(propiedad.m2_terreno)} m² terreno` : null,
  ].filter((item): item is string => Boolean(item));

  if (specs.length > 0) {
    y += 2;
    doc.setTextColor(10, 10, 10);
    doc.text(specs.join("  ·  "), margin, y);
    y += 10;
  }

  const features = (Array.isArray(propiedad.caracteristicas) ? propiedad.caracteristicas : []).filter(Boolean).slice(0, 4);
  if (features.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Características", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    features.forEach((feature) => {
      doc.text(`• ${feature}`, margin, y);
      y += 6;
    });
    y += 4;
  }

  if (agente) {
    const fullName = [agente.nombre, agente.apellido].filter(Boolean).join(" ");
    doc.setFont("helvetica", "bold");
    doc.text("Agente", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(fullName, margin, y);
    y += 6;
    if (agente.whatsapp) {
      doc.text(`WhatsApp: ${agente.whatsapp}`, margin, y);
      y += 6;
    }
    if (agente.email) {
      doc.text(agente.email, margin, y);
      y += 6;
    }
  }

  y = Math.max(y + 8, 268);
  doc.setDrawColor(232, 220, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const fichaUrl = `${window.location.origin}/propiedades/${propiedad.slug}`;
  const urlLines = doc.splitTextToSize(fichaUrl, contentWidth);
  doc.text("Ficha online:", margin, y);
  y += 5;
  doc.setTextColor(10, 10, 10);
  doc.text(urlLines, margin, y);

  doc.save(`ficha-${propiedad.slug}.pdf`);
}
