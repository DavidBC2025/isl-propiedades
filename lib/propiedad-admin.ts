import { slugify } from "@/lib/format";
import type { Propiedad, PropiedadImagen } from "@/types/isl";

export const COMUNAS_ISL = [
  "Viña del Mar",
  "Reñaca",
  "Recreo",
  "Concón",
  "Olmué",
  "Quilpué",
  "Peñablanca",
  "Villa Alemana",
] as const;

export const DRAFT_STORAGE_KEY = "isl:admin:propiedad-borrador";
export const LAST_OPERACION_KEY = "isl:admin:ultima-operacion";
export const LAST_COMUNA_KEY = "isl:admin:ultima-comuna";

export type PropiedadFormValues = {
  titulo: string;
  operacion: "venta" | "arriendo" | "";
  tipo: "casa" | "departamento" | "parcela" | "";
  precio_uf: string;
  comuna: string;
  sector: string;
  direccion_publica: string;
  lat: string;
  lng: string;
  dormitorios: string;
  banos: string;
  estacionamientos: string;
  m2_construidos: string;
  m2_terreno: string;
  gastos_comunes_uf: string;
  orientacion: string;
  vista: "" | "mar" | "cerro" | "ciudad" | "jardin" | "sin_vista";
  descripcion: string;
  caracteristicas: string;
  video_url: string;
  tour_url: string;
  imagenes: PropiedadImagen[];
  agente_id: string;
};

export type PropiedadGuardarInput = {
  id?: string;
  titulo: string;
  operacion: "venta" | "arriendo";
  tipo: "casa" | "departamento" | "parcela";
  precio_uf: number;
  comuna: string;
  sector: string | null;
  direccion_publica: string | null;
  lat: number | null;
  lng: number | null;
  dormitorios: number | null;
  banos: number | null;
  estacionamientos: number | null;
  m2_construidos: number | null;
  m2_terreno: number | null;
  gastos_comunes_uf: number | null;
  orientacion: string | null;
  vista: Propiedad["vista"];
  descripcion: string | null;
  caracteristicas: string[];
  video_url: string | null;
  tour_url: string | null;
  imagenes: PropiedadImagen[];
  agente_id: string | null;
  intent: "borrador" | "publicar" | "mantener";
};

export function emptyPropiedadForm(defaults?: Partial<Pick<PropiedadFormValues, "operacion" | "comuna" | "agente_id">>): PropiedadFormValues {
  return {
    titulo: "",
    operacion: defaults?.operacion ?? "",
    tipo: "",
    precio_uf: "",
    comuna: defaults?.comuna ?? "",
    sector: "",
    direccion_publica: "",
    lat: "",
    lng: "",
    dormitorios: "",
    banos: "",
    estacionamientos: "",
    m2_construidos: "",
    m2_terreno: "",
    gastos_comunes_uf: "",
    orientacion: "",
    vista: "",
    descripcion: "",
    caracteristicas: "",
    video_url: "",
    tour_url: "",
    imagenes: [],
    agente_id: defaults?.agente_id ?? "",
  };
}

function asText(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value);
}

export function propiedadToForm(propiedad: Propiedad): PropiedadFormValues {
  return {
    titulo: propiedad.titulo ?? "",
    operacion: propiedad.operacion ?? "",
    tipo: propiedad.tipo ?? "",
    precio_uf: asText(propiedad.precio_uf),
    comuna: propiedad.comuna ?? "",
    sector: propiedad.sector ?? "",
    direccion_publica: propiedad.direccion_publica ?? "",
    lat: asText(propiedad.lat),
    lng: asText(propiedad.lng),
    dormitorios: asText(propiedad.dormitorios),
    banos: asText(propiedad.banos),
    estacionamientos: asText(propiedad.estacionamientos),
    m2_construidos: asText(propiedad.m2_construidos),
    m2_terreno: asText(propiedad.m2_terreno),
    gastos_comunes_uf: asText(propiedad.gastos_comunes_uf),
    orientacion: propiedad.orientacion ?? "",
    vista: propiedad.vista ?? "",
    descripcion: propiedad.descripcion ?? "",
    caracteristicas: (Array.isArray(propiedad.caracteristicas) ? propiedad.caracteristicas : []).join("\n"),
    video_url: propiedad.video_url ?? "",
    tour_url: propiedad.tour_url ?? "",
    imagenes: Array.isArray(propiedad.imagenes) ? propiedad.imagenes.filter((image) => Boolean(image?.url)) : [],
    agente_id: propiedad.agente_id ?? "",
  };
}

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!trimmed) return null;
  const amount = Number(trimmed);
  return Number.isFinite(amount) ? amount : null;
}

export function imagenesFromUrls(urls: string[]): PropiedadImagen[] {
  return urls.filter(Boolean).map((url, index) => ({
    url,
    portada: index === 0,
    orden: index,
  }));
}

export function validarMinimos(values: PropiedadFormValues): string | null {
  if (!values.titulo.trim()) return "Falta el título.";
  if (parseOptionalNumber(values.precio_uf) == null) return "Falta el precio en UF.";
  if (!values.comuna.trim()) return "Falta la comuna.";
  if (values.operacion !== "venta" && values.operacion !== "arriendo") return "Elige si es venta o arriendo.";
  if (values.tipo !== "casa" && values.tipo !== "departamento" && values.tipo !== "parcela") return "Elige el tipo de propiedad.";
  return null;
}

export function formToGuardarInput(values: PropiedadFormValues, intent: PropiedadGuardarInput["intent"], id?: string): PropiedadGuardarInput | { error: string } {
  const minimo = validarMinimos(values);
  if (minimo) return { error: minimo };
  const precio_uf = parseOptionalNumber(values.precio_uf);
  if (precio_uf == null) return { error: "Falta el precio en UF." };

  return {
    id,
    titulo: values.titulo.trim(),
    operacion: values.operacion as "venta" | "arriendo",
    tipo: values.tipo as "casa" | "departamento" | "parcela",
    precio_uf,
    comuna: values.comuna.trim(),
    sector: values.sector.trim() || null,
    direccion_publica: values.direccion_publica.trim() || null,
    lat: parseOptionalNumber(values.lat),
    lng: parseOptionalNumber(values.lng),
    dormitorios: parseOptionalNumber(values.dormitorios),
    banos: parseOptionalNumber(values.banos),
    estacionamientos: parseOptionalNumber(values.estacionamientos),
    m2_construidos: parseOptionalNumber(values.m2_construidos),
    m2_terreno: parseOptionalNumber(values.m2_terreno),
    gastos_comunes_uf: parseOptionalNumber(values.gastos_comunes_uf),
    orientacion: values.orientacion.trim() || null,
    vista: values.vista || null,
    descripcion: values.descripcion.trim() || null,
    caracteristicas: values.caracteristicas.split(/\n+/).map((item) => item.trim()).filter(Boolean),
    video_url: values.video_url.trim() || null,
    tour_url: values.tour_url.trim() || null,
    imagenes: imagenesFromUrls(values.imagenes.map((image) => image.url)),
    agente_id: values.agente_id.trim() || null,
    intent,
  };
}

export function suggestedSlug(titulo: string): string {
  return slugify(titulo) || "propiedad";
}

export function textDraftFromValues(values: PropiedadFormValues): Omit<PropiedadFormValues, never> {
  return values;
}
