export type Timestamp = string;

export type PropiedadImagen = {
  url: string;
  alt?: string;
  portada?: boolean;
  orden?: number;
};

export type Agente = {
  id: string;
  slug: string;
  nombre: string;
  apellido: string | null;
  rol: string | null;
  bio: string | null;
  foto_url: string | null;
  email: string | null;
  whatsapp: string | null;
  especialidad: string | null;
  orden: number | null;
  activo: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
};

export type Propiedad = {
  id: string;
  slug: string;
  titulo: string;
  operacion: "venta" | "arriendo" | null;
  tipo: "casa" | "departamento" | "parcela" | null;
  precio_uf: number | null;
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
  vista: "mar" | "cerro" | "ciudad" | "jardin" | "sin_vista" | null;
  descripcion: string | null;
  caracteristicas: string[];
  video_url: string | null;
  tour_url: string | null;
  imagenes: PropiedadImagen[];
  estado: "borrador" | "publicada" | "reservada" | "vendida" | "despublicada" | null;
  propiedad_principal: boolean | null;
  en_hero: boolean | null;
  hero_orden: number | null;
  agente_id: string | null;
  fecha_publicacion: Timestamp | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  agente?: Agente | null;
};

export type HeroSlide = {
  id: string;
  propiedad_id: string | null;
  media_type: "image" | "video" | null;
  media_url: string | null;
  titulo: string | null;
  subtitulo: string | null;
  cta_primario_label: string | null;
  cta_primario_href: string | null;
  cta_secundario_label: string | null;
  cta_secundario_href: string | null;
  orden: number | null;
  activo: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
  propiedad?: Propiedad | null;
};

export type CasoPreparacion = {
  id: string;
  propiedad_id: string | null;
  imagen_antes: string;
  imagen_despues: string;
  descripcion_corta: string | null;
  publicado: boolean | null;
  orden: number | null;
  created_at: Timestamp | null;
  propiedad?: Propiedad | null;
};

export type Articulo = {
  id: string;
  slug: string;
  titulo: string;
  extracto: string | null;
  contenido: string | null;
  categoria: "comprar" | "vender" | "invertir" | "barrio" | "tips" | null;
  etiquetas: string[] | null;
  imagen_destacada: string | null;
  seo_title: string | null;
  meta_description: string | null;
  estado: "publicado" | "borrador" | null;
  es_reporte: boolean | null;
  archivo_pdf_url: string | null;
  fecha_publicacion: Timestamp | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
};

export type Testimonio = {
  id: string;
  nombre: string;
  rol_ciudad: string | null;
  texto: string;
  foto_url: string | null;
  propiedad_id: string | null;
  destacado: boolean | null;
  publicado: boolean | null;
  created_at: Timestamp | null;
  propiedad?: Propiedad | null;
};

export type LeadTipo = "contacto" | "tasacion" | "vender" | "visita" | "alerta" | "newsletter" | "guia";
export type LeadEstado = "nuevo" | "contactado" | "cerrado";

export type Lead = {
  id: string;
  tipo: LeadTipo | null;
  nombre: string;
  email: string | null;
  telefono: string | null;
  mensaje: string | null;
  comuna: string | null;
  tipo_propiedad: string | null;
  m2: number | null;
  dormitorios: number | null;
  propiedad_id: string | null;
  agente_id: string | null;
  origen_url: string | null;
  estado: LeadEstado | null;
  notificado: boolean | null;
  notificado_en: Timestamp | null;
  payload: Record<string, unknown> | null;
  created_at: Timestamp | null;
};

export type Barrio = {
  id: string;
  slug: string;
  nombre: string;
  hero_image: string | null;
  extracto: string | null;
  contenido: string | null;
  tips: string[];
  seo_title: string | null;
  meta_description: string | null;
  publicado: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
};

export type Alerta = {
  id: string;
  email: string;
  comuna: string | null;
  operacion: "venta" | "arriendo" | null;
  tipo: "casa" | "departamento" | "parcela" | null;
  precio_max_uf: number | null;
  token: string | null;
  activa: boolean | null;
  created_at: Timestamp | null;
};

export type ComoTrabajamosItem = {
  titulo: string;
  texto: string;
};

export type SiteSettings = {
  id: number;
  home_headline: string | null;
  home_subheadline: string | null;
  email_general: string | null;
  whatsapp_general: string | null;
  uf_valor_manual: number | null;
  uf_actualizado_en: Timestamp | null;
  calc_comision_porcentaje: number | null;
  calc_gastos_escritura_uf: number | null;
  calc_pie_porcentaje: number | null;
  disclaimer_calculadora: string | null;
  como_trabajamos: ComoTrabajamosItem[];
  updated_at: Timestamp | null;
};
