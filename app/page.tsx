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
import { getHeroSlides } from "@/lib/hero";
import { getPropiedadPrincipal, getPropiedadesPublicadas } from "@/lib/propiedades";
import { getSiteSettings } from "@/lib/settings";
import { HOME_DESCRIPTION_FALLBACK } from "@/lib/site";
import { getTestimoniosPublicados } from "@/lib/testimonios";

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
  const [settings, heroSlides, propiedadPrincipal, propiedades, articulos, testimonios, agentes] = await Promise.all([
    getSiteSettings(),
    getHeroSlides(),
    getPropiedadPrincipal(),
    getPropiedadesPublicadas({ limit: 6 }),
    getArticulosPublicados(),
    getTestimoniosPublicados(),
    getAgentesActivos(),
  ]);

  const slides = buildHomeHeroSlides(heroSlides, propiedadPrincipal, settings);
  const seleccion = propiedades.slice(0, 6);
  const guia = articulos.slice(0, 3);

  return (
    <>
      <SiteHeader variant="overlay" whatsapp={settings?.whatsapp_general} logo={settings?.logo} />

      <main>
        {/* Hero */}
        <HomeHero slides={slides} />

        {/* Selección */}
        <section className="isl-section">
          <Container>
            <SectionTitle
              title="Selección ISL"
              subtitle="PROPIEDADES DESTACADAS"
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
        <section className="isl-section bg-isl-offwhite">
          <Container>
            <SectionTitle
              title="Encuentra tu propiedad"
              subtitle="BÚSQUEDA RÁPIDA"
              className="mb-12 text-center"
            />
            <QuickSearch />
          </Container>
        </section>

        {/* Mirada ISL */}
        <section className="isl-section">
          <Container>
            <div className="mx-auto max-w-3xl">
              <SectionTitle
                title="La Mirada ISL"
                subtitle="NUESTRA IDENTIDAD"
                className="mb-16 text-center"
              />
              <div className="grid gap-12 md:grid-cols-2">
                {agentes.map((agente) => (
                  <div key={agente.id} className="space-y-4">
                    {agente.foto_url ? (
                      <img
                        src={agente.foto_url}
                        alt={agente.nombre}
                        className="aspect-square w-full object-cover bg-isl-champagne/20"
                      />
                    ) : (
                      <div className="aspect-square w-full bg-isl-champagne/20 flex items-center justify-center">
                        <span className="font-serif text-2xl text-isl-black/20">
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
        <section className="isl-section bg-isl-offwhite">
          <Container>
            <div className="mx-auto max-w-3xl">
              <SectionTitle
                title="Por qué ISL"
                subtitle="NUESTRO DIFERENCIAL"
                className="mb-16 text-center"
              />
              <div className="space-y-8 text-center">
                {POR_QUE_ISL.map((item, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-serif text-2xl text-isl-black">{item.titulo}</h3>
                    <p className="text-sm leading-relaxed text-isl-black/70">{item.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Vender */}
        <section className="isl-section">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <SectionTitle
                title="¿Quieres vender?"
                subtitle="CONVERSEMOS"
                className="mb-12"
              />
              <LeadForm tipo="vender" submitLabel="Quiero vender mi propiedad" />
            </div>
          </Container>
        </section>

        {/* Guía */}
        <section className="isl-section bg-isl-offwhite">
          <Container>
            <SectionTitle
              title="Guía ISL"
              subtitle="INSIGHTS DEL MERCADO"
              className="mb-12"
            />
            {guia.length === 0 ? (
              <EmptyState
                title="Aún no hay artículos publicados"
                description="Estamos preparando contenido exclusivo sobre el mercado inmobiliario en Viña del Mar."
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
        <section className="isl-section bg-isl-offwhite">
          <Container>
            <div className="mx-auto max-w-md">
              <SectionTitle
                title="Newsletter"
                subtitle="ENTÉRATE DE LAS NOVEDADES"
                className="mb-12 text-center"
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