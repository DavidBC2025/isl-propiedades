"use client";

const MAX_IMAGE_SIDE = 2000;
const THUMBNAIL_WIDTH = 400;

export function isHeicFile(file: File): boolean {
  return file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/i.test(file.name);
}

function fileNameWithExtension(fileName: string, extension: "webp" | "jpg" | "png"): string {
  const nameWithoutExtension = fileName.replace(/\.[^.]+$/, "") || "foto";
  return `${nameWithoutExtension}.${extension}`;
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const jpeg = Array.isArray(converted) ? converted[0] : converted;

  return new File([jpeg], fileNameWithExtension(file.name, "jpg"), { type: "image/jpeg" });
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("No se pudo preparar la foto."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function canvasToFile(canvas: HTMLCanvasElement, baseName: string, quality = 0.8, isPng = false): Promise<File> {
  if (isPng) {
    const pngBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
    if (!pngBlob) throw new Error("No se pudo preparar la foto.");
    return new File([pngBlob], fileNameWithExtension(baseName, "png"), { type: "image/png" });
  }

  const makeBlob = (type: "image/webp" | "image/png") => new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
  const webp = await makeBlob("image/webp");
  // Nunca caer a JPEG si se requiere soporte de transparencia; caer a PNG
  const blob = webp?.type === "image/webp" ? webp : await makeBlob("image/png");

  if (!blob) {
    throw new Error("No se pudo preparar la foto.");
  }

  const extension = blob.type === "image/webp" ? "webp" : "png";
  return new File([blob], fileNameWithExtension(baseName, extension), { type: blob.type });
}

export async function optimizeImageForUpload(file: File): Promise<File> {
  const isPng = file.type === "image/png" || /\.png$/i.test(file.name);

  // Si es un archivo PNG (como logos con transparencia), conservamos el archivo original intacto
  // evitando re-rasterizaciones, pérdida de canal alfa o agregados de fondo blanco
  if (isPng) {
    return file;
  }

  let source = file;

  if (isHeicFile(file)) {
    try {
      source = await convertHeicToJpeg(file);
    } catch {
      return file;
    }
  }

  try {
    const image = await loadImage(source);
    const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = largestSide > MAX_IMAGE_SIDE ? MAX_IMAGE_SIDE / largestSide : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const ctx = canvas.getContext("2d", { alpha: true });
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvasToFile(canvas, source.name, 0.8, isPng);
  } catch {
    return source;
  }
}

export async function createImageThumbnail(file: File): Promise<File | null> {
  try {
    const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
    const image = await loadImage(file);
    const scale = Math.min(1, THUMBNAIL_WIDTH / image.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvasToFile(canvas, `miniatura-${file.name}`, 0.8, isPng);
  } catch {
    return null;
  }
}
