import type { Propiedad, PropiedadImagen } from "@/types/isl";

export function sortImagenes(imagenes: Propiedad["imagenes"] | null | undefined): PropiedadImagen[] {
  const list = Array.isArray(imagenes) ? imagenes.filter((image) => Boolean(image?.url)) : [];
  return [...list].sort((a, b) => {
    if (a.portada && !b.portada) return -1;
    if (!a.portada && b.portada) return 1;
    return (a.orden ?? 0) - (b.orden ?? 0);
  });
}

export function portadaImagen(imagenes: Propiedad["imagenes"] | null | undefined): PropiedadImagen | undefined {
  return sortImagenes(imagenes)[0];
}

export function seoDescription(text: string | null | undefined, fallback: string): string {
  const raw = (text ?? fallback).replace(/\s+/g, " ").trim();
  if (raw.length <= 155) return raw;
  return `${raw.slice(0, 152).trim()}…`;
}

export function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function osmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.012;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}
