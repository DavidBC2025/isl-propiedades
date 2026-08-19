import { formatComuna, formatUF } from "@/lib/format";
import { portadaImagen } from "@/lib/ficha";
import type { Propiedad } from "@/types/isl";

export type SocialImageFormat = "cuadrado" | "historia";

function loadCorsImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No pudimos usar la foto para armar la imagen. Revisa que esté subida y vuelve a intentar."));
    image.src = url;
  });
}

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (context.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }

  if (lines.length < maxLines && current) {
    if (context.measureText(current).width <= maxWidth || lines.length === 0) {
      lines.push(current);
    } else {
      lines.push(`${current.slice(0, Math.max(1, current.length - 3))}…`);
    }
  }

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = last.endsWith("…") ? last : `${last}…`;
  }

  return lines.slice(0, maxLines);
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No pudimos armar la imagen. Intenta de nuevo."));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

export async function generateSocialImage(propiedad: Propiedad, formato: SocialImageFormat): Promise<Blob> {
  const width = 1080;
  const height = formato === "historia" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No pudimos armar la imagen. Intenta de nuevo.");
  }

  context.fillStyle = "#0A0A0A";
  context.fillRect(0, 0, width, height);

  const cover = portadaImagen(propiedad.imagenes);
  if (!cover?.url) {
    throw new Error("Sube al menos una foto primero.");
  }

  const image = await loadCorsImage(cover.url);
  const scale = Math.max(width / Math.max(image.naturalWidth, 1), height / Math.max(image.naturalHeight, 1));
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);

  const gradient = context.createLinearGradient(0, height * 0.42, 0, height);
  gradient.addColorStop(0, "rgba(10, 10, 10, 0)");
  gradient.addColorStop(0.45, "rgba(10, 10, 10, 0.5)");
  gradient.addColorStop(1, "rgba(10, 10, 10, 0.92)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const padding = formato === "historia" ? 80 : 72;
  const maxWidth = width - padding * 2;
  context.fillStyle = "#FFFFFF";
  context.font = '500 68px "Cormorant Garamond", Georgia, serif';
  const titleLines = wrapLines(context, propiedad.titulo || "Propiedad", maxWidth, formato === "historia" ? 4 : 3);
  let y = height - (formato === "historia" ? 430 : 320);
  titleLines.forEach((line) => {
    context.fillText(line, padding, y);
    y += 78;
  });

  context.fillStyle = "#C6A87C";
  context.font = "500 44px Inter, Arial, sans-serif";
  context.fillText(formatUF(propiedad.precio_uf), padding, y + 12);

  const comuna = formatComuna(propiedad.comuna) || propiedad.comuna;
  if (comuna) {
    context.fillStyle = "#E8DCC8";
    context.font = "400 30px Inter, Arial, sans-serif";
    context.fillText(comuna, padding, y + 58);
  }

  context.fillStyle = "#C6A87C";
  context.font = '500 36px "Cormorant Garamond", Georgia, serif';
  context.fillText("ISL Propiedades", padding, height - 72);

  try {
    return await canvasToJpeg(canvas);
  } catch {
    throw new Error("No pudimos descargar la imagen. El navegador bloqueó la foto. Intenta de nuevo o usa otra portada.");
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
