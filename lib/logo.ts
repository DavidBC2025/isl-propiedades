export const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
export const PNG_MAGIC_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function validarArchivoLogo(file: File | null): { ok: true } | { ok: false; error: string } {
  if (!file || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Por favor selecciona un archivo PNG para subir." };
  }

  const isPngMime = file.type === "image/png";
  const isPngExt = file.name.toLowerCase().endsWith(".png");
  if (!isPngMime && !isPngExt) {
    return { ok: false, error: "El archivo seleccionado no es un PNG válido. Solo se permiten imágenes en formato PNG (.png)." };
  }

  if (file.size > MAX_LOGO_SIZE) {
    return { ok: false, error: "El archivo supera el límite de 2 MB. Por favor elige una imagen más liviana." };
  }

  return { ok: true };
}

export function validarBytesPng(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  return PNG_MAGIC_BYTES.every((magic, idx) => bytes[idx] === magic);
}
