export const ADMIN_NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/propiedades", label: "Propiedades" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/agentes", label: "Agentes" },
  { href: "/admin/barrios", label: "Barrios" },
  { href: "/admin/guia", label: "Guía" },
  { href: "/admin/testimonios", label: "Testimonios" },
  { href: "/admin/leads", label: "Consultas", badgeKey: "consultas" as const },
  { href: "/admin/ajustes", label: "Ajustes" },
] as const;

export const ESTADO_PROPIEDAD: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  reservada: "Reservada",
  vendida: "Vendida",
  despublicada: "Oculta",
};

export const TIPO_CONSULTA: Record<string, string> = {
  contacto: "Contacto",
  tasacion: "Tasación",
  vender: "Quiere vender",
  visita: "Visita",
  alerta: "Alerta",
  newsletter: "Novedades",
  guia: "Guía",
};

export const ESTADO_CONSULTA: Record<string, string> = {
  nuevo: "Nueva",
  contactado: "Ya hablamos",
  cerrado: "Cerrada",
};
