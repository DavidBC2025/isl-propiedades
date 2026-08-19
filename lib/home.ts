import type { HeroSlide, Propiedad, SiteSettings } from "@/types/isl";
import { HOME_HEADLINE_FALLBACK, HOME_SUBHEADLINE_FALLBACK } from "@/lib/site";

export type HomeHeroSlide = {
  id: string;
  imageUrl?: string;
  videoUrl?: string;
  titulo: string;
  subtitulo?: string;
  ctaPrimario: { label: string; href: string };
  ctaSecundario: { label: string; href: string };
};

function portadaDe(propiedad: Propiedad | null | undefined): { imageUrl?: string; videoUrl?: string } {
  if (!propiedad) return {};
  const images = Array.isArray(propiedad.imagenes) ? propiedad.imagenes : [];
  const portada = images.find((image) => image.portada) ?? images[0];
  return {
    imageUrl: portada?.url,
    videoUrl: propiedad.video_url ?? undefined,
  };
}

const DEFAULT_PRIMARY = { label: "Ver propiedades", href: "/propiedades" };
const DEFAULT_SECONDARY = { label: "Quiero vender", href: "/vender" };

export function buildHomeHeroSlides(
  slides: HeroSlide[],
  propiedadPrincipal: Propiedad | null,
  settings: SiteSettings | null,
): HomeHeroSlide[] {
  const headline = settings?.home_headline?.trim() || HOME_HEADLINE_FALLBACK;
  const subheadline = settings?.home_subheadline?.trim() || HOME_SUBHEADLINE_FALLBACK;

  if (slides.length > 0) {
    return slides.map((slide) => {
      const fromProperty = portadaDe(slide.propiedad);
      const isVideo = slide.media_type === "video";
      return {
        id: slide.id,
        imageUrl: isVideo ? undefined : slide.media_url || fromProperty.imageUrl,
        videoUrl: isVideo ? slide.media_url || fromProperty.videoUrl : undefined,
        titulo: slide.titulo?.trim() || headline,
        subtitulo: slide.subtitulo?.trim() || subheadline,
        ctaPrimario: {
          label: slide.cta_primario_label?.trim() || DEFAULT_PRIMARY.label,
          href: slide.cta_primario_href?.trim() || DEFAULT_PRIMARY.href,
        },
        ctaSecundario: {
          label: slide.cta_secundario_label?.trim() || DEFAULT_SECONDARY.label,
          href: slide.cta_secundario_href?.trim() || DEFAULT_SECONDARY.href,
        },
      };
    });
  }

  if (propiedadPrincipal) {
    const media = portadaDe(propiedadPrincipal);
    return [{
      id: propiedadPrincipal.id,
      ...media,
      titulo: propiedadPrincipal.titulo || headline,
      subtitulo: subheadline,
      ctaPrimario: DEFAULT_PRIMARY,
      ctaSecundario: DEFAULT_SECONDARY,
    }];
  }

  return [{
    id: "marca",
    titulo: headline,
    subtitulo: subheadline,
    ctaPrimario: DEFAULT_PRIMARY,
    ctaSecundario: DEFAULT_SECONDARY,
  }];
}

export const POR_QUE_ISL = [
  {
    titulo: "Proceso claro",
    texto: "Te explicamos cada paso, sin letra chica ni prisa. Sabes qué sigue y por qué.",
  },
  {
    titulo: "Acompañamiento en cada visita",
    texto: "Silvia o Ivannia van contigo. No te dejan solo frente a una casa que aún no conoces.",
  },
  {
    titulo: "Conocimiento real del sector",
    texto: "Viña, Reñaca, Recreo, Concón y el interior. Calles, luz y ritmo de cada barrio.",
  },
  {
    titulo: "Comunicación directa por WhatsApp",
    texto: "Hablas con nosotras, no con un buzón genérico. Respuesta cercana y a tiempo.",
  },
];
