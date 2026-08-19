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
import { TestimonialCarousel } from "@/components/isl/TestimonialCarousel";
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
  const customWhy = settings?.como_trabajamos;
  const whyPoints = Array.isArray(customWhy) && customWhy.length > 0 ? customWhy.slice(0, 4) : POR_QUE_ISL;
  const silvia = agentes.find((agente) => /silvia/i.test(`${agente.nombre} ${agente.apellido ?? ""}`));
  const ivannia = agentes.find((agente) => /ivannia/i.test(`${agente.nombre} ${agente.apellido ?? ""}`));
  const fundadoras = [
    silvia ?? { id: "silvia", nombre: "Silvia", apellido: null, foto_url: null },
    ivannia ?? { id: "ivannia", nombre: "Ivannia", apellido: null, foto_url: null },
  ];

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-isl-white focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <SiteHeader variant="overlay" whatsapp={settings?.whatsapp_general} />
      <HomeHero slides={slides} />

      <main id="contenido">
        <section className="isl-section bg-isl-white">
          <Container>
            <SectionTitle
              subtitle="Selección"
              title="Selección curada de espacios excepcionales"
              className="max-w-2xl"
            />
            {seleccion.length > 0 ? (
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {seleccion.map((propiedad) => (
                  <ListingCard key={propiedad.id} propiedad={propiedad} enableCompare={true} />
                ))}
              </div>
            ) : (
              <EmptyState
                className="mt-12"
                title="Estamos preparando nuestra primera selección"
                description="Pronto vas a ver acá casas y departamentos que Silvia e Ivannia eligen con calma, en Viña del Mar y alrededores."
                ctaLabel="Quiero vender"
                ctaHref="/vender"
              />
            )}
          </Container>
        </section>

        <section className="isl-section bg-isl-offwhite">
          <Container>
            <SectionTitle subtitle="Buscar" title="Encuentra por comuna, tipo y UF" className="max-w-2xl" />
            <div className="mt-10">
              <QuickSearch />
            </div>
          </Container>
        </section>

        <section className="isl-section bg-isl-white">
          <Container className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <SectionTitle subtitle="La mirada ISL" title="Dos corredoras, un mismo criterio" />
              <div className="mt-8 space-y-5 text-base leading-7 text-isl-black/80">
                <p>
                  ISL nació en Viña del Mar con Silvia e Ivannia. No somos una vitrina anónima: somos dos personas que miran la casa, el barrio y a quienes van a vivirla.
                </p>
                <p>
                  Trabajamos con cercanía y sin teatro. Te decimos lo que vemos, te acompañamos en las visitas y cuidamos el ritmo de una decisión que no se toma a la ligera.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fundadoras.map((persona) => (
                <article key={persona.id} className="overflow-hidden rounded-sm bg-isl-offwhite">
                  <div className="aspect-[4/5] bg-[linear-gradient(145deg,#E8DCC8,#F7F7F5)]">
                    {persona.foto_url ? (
                      <img src={persona.foto_url} alt={persona.nombre} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-end p-5">
                        <span className="font-serif text-4xl text-isl-black/50">{persona.nombre}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="isl-section bg-isl-offwhite">
          <Container>
            <SectionTitle subtitle="Por qué ISL" title="Por qué trabajar con nosotras" className="max-w-2xl" />
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {whyPoints.map((punto) => (
                <article key={punto.titulo} className="border-t border-isl-black/15 pt-6">
                  <h3 className="font-serif text-2xl font-normal text-isl-black">{punto.titulo}</h3>
                  <p className="mt-3 text-sm leading-6 text-isl-black/70">{punto.texto}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="relative isolate overflow-hidden bg-isl-black">
          <div className="isl-hero-overlay absolute inset-0" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,168,124,0.28),transparent_40%),linear-gradient(135deg,#0A0A0A,#1c1814)]" aria-hidden="true" />
          <Container className="relative z-10 py-24 md:py-32">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">Vender</p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-normal text-isl-white md:text-5xl">¿Estás pensando en vender?</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-isl-white/80">
              Conversemos con calma. Te contamos cómo preparamos la propiedad y cómo acompañamos cada visita.
            </p>
            <div className="mt-8">
              <ButtonISL href="/vender" variant="gold">Quiero vender</ButtonISL>
            </div>
          </Container>
        </section>

        <section className="isl-section bg-isl-white">
          <Container>
            <SectionTitle subtitle="Guía ISL" title="Notas para comprar, vender y habitar mejor" className="max-w-2xl" />
            {guia.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {guia.map((articulo) => (
                  <ArticleCard key={articulo.id} articulo={articulo} />
                ))}
              </div>
            ) : (
              <EmptyState
                className="mt-12"
                title="La guía se está escribiendo"
                description="Pronto vas a encontrar acá notas claras sobre comprar, vender y elegir barrio en Viña del Mar."
                ctaLabel="Ver propiedades"
                ctaHref="/propiedades"
              />
            )}
          </Container>
        </section>

        {testimonios.length > 0 ? (
          <section className="isl-section bg-isl-offwhite">
            <Container>
              <SectionTitle subtitle="Voces" title="Lo que cuentan quienes ya caminaron con nosotras" className="mx-auto max-w-2xl text-center" />
              <div className="mt-12">
                <TestimonialCarousel testimonios={testimonios} />
              </div>
            </Container>
          </section>
        ) : null}

        <section className="isl-section bg-isl-white">
          <Container className="grid items-start gap-10 lg:grid-cols-2">
            <SectionTitle
              subtitle="Novedades"
              title="Entérate cuando aparezca una propiedad que vale la pena"
            />
            <LeadForm
              tipo="newsletter"
              hiddenFields={["nombre", "telefono", "mensaje"]}
              className="max-w-md"
            />
          </Container>
        </section>
      </main>

      <CompareBar />
      <SiteFooter email={settings?.email_general} whatsapp={settings?.whatsapp_general} />
    </>
  );
}
