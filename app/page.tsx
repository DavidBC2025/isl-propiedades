import type { Metadata } from "next";
import { ArticleCard } from "@/components/isl/ArticleCard";
import { Container } from "@/components/isl/Container";
import { EmptyState } from "@/components/isl/EmptyState";
import { HomeHero } from "@/components/isl/HomeHero";
import { LeadForm } from "@/components/isl/LeadForm";
import { CompareBar } from "@/components/isl/CompareBar";
import { ListingCard } from "@/components/isl/ListingCard";
import { QuickSearch } from "@/components/isl/QuickSearch";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { SiteFooter } from "@/components/isl/SiteFooter";
import { SiteHeader } from "@/components/isl/SiteHeader";
import { TestimoniosCarousel } from "@/components/isl/TestimoniosCarousel";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { getAgentesActivos } from "@/lib/agentes";
import { getArticulosPublicados } from "@/lib/articulos";
import { buildHomeHeroSlides, POR_QUE_ISL } from "@/lib/home";
import { getPropiedadPrincipal, getPropiedadesPublicadas } from "@/lib/propiedades";
import { getSiteSettings } from "@/lib/settings";
import { HOME_DESCRIPTION_FALLBACK } from "@/lib/site";
import { getTestimoniosPublicados } from "@/lib/testimonios";
import type { Propiedad, SiteSettings } from "@/types/isl";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = settings?.home_subheadline?.trim() || HOME_DESCRIPTION_FALLBACK;

  return {
    title: {
      absolute: "ISL Propiedades | Corredora boutique en Viña del Mar",
    },
    description,
  };
}

export default async function Home() {
  const [settings, propiedadPrincipal, propiedades, articulos, testimonios, agentes] = await Promise.all([
    getSiteSettings(),
    getPropiedadPrincipal(),
    getAllPublishedProperties(),
    getArticulosPublicados(),
    getTestimoniosPublicados(),
    getAgentesActivos(),
  ]);

  const seleccion = propiedades.slice(0, 6);
  const guia = articulos.slice(0, 3);
  const { slides, coverCount } = buildPropertyPhotoSlides([propiedadPrincipal, ...propiedades], settings);

  const propertyImages = seleccion.flatMap((propiedad) => (
    Array.isArray(propiedad.imagenes) ? propiedad.imagenes : []
  ));
  const searchImage = slides.find((slide) => slide.imageUrl)?.imageUrl;
  const whyImage = propertyImages.find((imagen) => imagen.portada)?.url ?? propertyImages[0]?.url;
  const insightsImage = guia.find((articulo) => articulo.imagen_destacada)?.imagen_destacada ?? undefined;

  return (
    <>
      <SiteHeader variant="overlay" whatsapp={settings?.whatsapp_general} logo={settings?.logo} />

      <main>
        {/* Hero */}
        <HomeHero slides={slides} coverCount={coverCount} />

        {/* Selección */}
        <section className="isl-section bg-[#F3F0EA]">
          <Container>
            <SectionTitle
              title="Propiedades destacadas"
              subtitle="SELECCIÓN ISL"
              accentWord="Propiedades"
              className="mb-12"
            />
            {seleccion.length === 0 ? (
              <EmptyState
                title="Aún no hay propiedades publicadas"
                description="Estamos preparando nuestro portafolio. Vuelve pronto o suscríbete para enterarte cuando publiquemos."
                ctaLabel="Quiero enterarme"
                ctaHref="/alertas"
              />
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {seleccion.map((propiedad) => (
                  <ListingCard key={propiedad.id} propiedad={propiedad} enableCompare />
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* Buscador */}
        <section className="isl-section relative isolate overflow-hidden bg-[#101010] text-isl-white">
          <EditorialBackdrop imageUrl={searchImage} />
          <Container className="relative z-10">
            <SectionTitle
              title="Encuentra tu propiedad"
              subtitle="BÚSQUEDA RÁPIDA"
              className="mb-12 text-center [&_h2]:text-isl-white [&_p]:text-isl-gold"
            />
            <QuickSearch dark />
          </Container>
        </section>

        {/* Mirada ISL */}
        <section className="isl-section bg-[#F3F0EA]">
          <Container>
            <div className="mx-auto max-w-3xl">
              <SectionTitle
                title="La Mirada ISL"
                subtitle="NUESTRA IDENTIDAD"
                accentWord="ISL"
                className="mb-16 text-center"
              />
              <div className="grid gap-12 md:grid-cols-2">
                {agentes.map((agente) => (
                  <div key={agente.id} className="space-y-4 rounded-sm border border-isl-black/10 bg-white p-4 shadow-lg">
                    {agente.foto_url ? (
                      <img
                        src={agente.foto_url}
                        alt={agente.nombre}
                        className="aspect-[4/5] w-full object-cover bg-isl-champagne/20"
                      />
                    ) : (
                      <div className="aspect-square w-full bg-isl-champagne/20 flex items-center justify-center">
                        <span className="font-serif text-2xl text-isl-black/40">
                          {agente.nombre.split(" ")[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif text-2xl text-isl-black">
                        {agente.nombre} {agente.apellido || ""}
                      </h3>
                      <p className="text-sm text-isl-black/70">
                        {agente.rol || agente.especialidad || "Corredora"}
                      </p>
                    </div>
                  </div>
                ))}
                {agentes.length === 0 && (
                  <div className="col-span-full text-center">
                    <EmptyState
                      title="Nuestro equipo"
                      description="Estamos preparando los perfiles de nuestro equipo."
                    />
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* Por qué ISL */}
        <section className="isl-section relative isolate overflow-hidden bg-[#101010] text-isl-white">
          <EditorialBackdrop imageUrl={whyImage} />
          <Container className="relative z-10">
            <div className="mx-auto max-w-3xl">
              <SectionTitle
                title="Por qué ISL"
                subtitle="NUESTRO DIFERENCIAL"
                accentWord="ISL"
                className="mb-16 text-center [&_h2]:text-isl-white [&_p]:text-isl-gold"
              />
              <div className="space-y-8 text-center">
                {POR_QUE_ISL.map((item, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-serif text-2xl text-isl-white">{item.titulo}</h3>
                    <p className="text-sm leading-relaxed text-isl-white/80">{item.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Vender */}
        <section className="isl-section bg-[#F3F0EA]">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <SectionTitle
                title="Conversemos"
                subtitle="¿QUIERES VENDER?"
                accentWord="Conversemos"
                className="mb-12 [&_p]:text-isl-gold"
              />
              <LeadForm tipo="vender" submitLabel="Quiero vender mi propiedad" />
            </div>
          </Container>
        </section>

        {/* Guía */}
        <section className="isl-section relative isolate overflow-hidden bg-isl-black text-isl-white">
          <EditorialBackdrop imageUrl={insightsImage} />
          <Container className="relative z-10">
            <SectionTitle
              title="Guía ISL"
              subtitle="INSIGHTS DEL MERCADO"
              className="mb-12 [&_h2]:text-isl-white [&_p]:text-isl-gold"
            />
            {guia.length === 0 ? (
              <EmptyState
                title="Aún no hay artículos publicados"
                description="Estamos preparando contenido exclusivo sobre el mercado inmobiliario en Viña del Mar."
                dark
              />
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {guia.map((articulo) => (
                  <ArticleCard key={articulo.id} articulo={articulo} />
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* Testimonios */}
        {testimonios.length > 0 && (
          <section className="isl-section">
            <Container>
              <SectionTitle
                title="Testimonios"
                subtitle="LO QUE DICEN NUESTROS CLIENTES"
                className="mb-12"
              />
              <TestimoniosCarousel testimonios={testimonios} />
            </Container>
          </section>
        )}

        {/* Newsletter */}
        <section className="isl-section bg-[#F3F0EA]">
          <Container>
            <div className="mx-auto max-w-md">
              <SectionTitle
                title="Newsletter"
                subtitle="ENTÉRATE DE LAS NOVEDADES"
                className="mb-12 text-center [&_p]:text-isl-gold"
              />
              <LeadForm tipo="newsletter" />
            </div>
          </Container>
        </section>
      </main>

      <CompareBar />
      <SiteFooter email={settings?.email_general} whatsapp={settings?.whatsapp_general} logo={settings?.logo} />
    </>
  );
}

function isStaticPropertyPhoto(imageUrl: string): boolean {
  const path = imageUrl.split(/[?#]/, 1)[0] ?? "";
  return /\.(?:jpe?g|png|webp)$/i.test(path);
}

async function getAllPublishedProperties(): Promise<Propiedad[]> {
  const pageSize = 1000;
  const properties: Propiedad[] = [];
  let page = 1;
  let currentPage: Propiedad[];

  do {
    currentPage = await getPropiedadesPublicadas({ pageSize, page });
    properties.push(...currentPage);
    page += 1;
  } while (currentPage.length === pageSize);

  return properties;
}

function buildPropertyPhotoSlides(
  properties: (Propiedad | null)[],
  settings: SiteSettings | null,
) {
  const uniqueProperties = [...new Map(
    properties.flatMap((property) => property ? [[property.id, property] as const] : []),
  ).values()];
  const seenImageUrls = new Set<string>();
  const covers: { property: Propiedad; imageUrl: string }[] = [];
  const gallery: { property: Propiedad; imageUrl: string }[] = [];

  for (const property of uniqueProperties) {
    const images = Array.isArray(property.imagenes)
      ? property.imagenes.filter((image) => isStaticPropertyPhoto(image.url))
      : [];
    const cover = images.find((image) => image.portada) ?? images[0];

    if (cover && !seenImageUrls.has(cover.url)) {
      seenImageUrls.add(cover.url);
      covers.push({ property, imageUrl: cover.url });
    }

    for (const image of images) {
      if (seenImageUrls.has(image.url)) continue;
      seenImageUrls.add(image.url);
      gallery.push({ property, imageUrl: image.url });
    }
  }

  for (let index = gallery.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [gallery[index], gallery[randomIndex]] = [gallery[randomIndex], gallery[index]];
  }

  const slides = [...covers, ...gallery].flatMap(({ property, imageUrl }, index) => {
    const slide = buildHomeHeroSlides([], property, settings)[0];
    return slide
      ? [{ ...slide, id: `${property.id}-${index}`, imageUrl, videoUrl: undefined }]
      : [];
  });

  return { slides, coverCount: covers.length };
}

function EditorialBackdrop({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {imageUrl ? <img src={imageUrl} alt="" className="size-full object-cover" /> : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-black/55" />
    </div>
  );
}