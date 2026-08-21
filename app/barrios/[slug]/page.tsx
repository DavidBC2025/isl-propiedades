import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { ListingCard } from "@/components/isl/ListingCard";
import { EmptyState } from "@/components/isl/EmptyState";
import { HeroMedia } from "@/components/isl/HeroMedia";
import { getBarrioBySlug } from "@/lib/barrios";
import { getPropiedadesPublicadas } from "@/lib/propiedades";

type BarrioSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BarrioSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const barrio = await getBarrioBySlug(slug);

  if (!barrio) return {};

  return {
    title: `${barrio.seo_title || barrio.nombre} | ISL Propiedades`,
    description: barrio.meta_description || barrio.extracto,
  };
}

export default async function BarrioSlugPage({ params }: BarrioSlugPageProps) {
  const { slug } = await params;
  const barrio = await getBarrioBySlug(slug);

  if (!barrio) notFound();

  // Traemos todas las propiedades para filtrar por comuna de forma flexible
  const todasPropiedades = await getPropiedadesPublicadas({ pageSize: 1000 });
  
  const normalize = (text: string) => 
    text?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const propiedadesBarrio = todasPropiedades.filter(p => 
    normalize(p.comuna) === normalize(barrio.nombre)
  );

  return (
    <main className="pb-24">
      {/* Hero del Barrio */}
      <HeroMedia 
        imageUrl={barrio.hero_image || undefined} 
        className="h-[60vh] min-h-[400px] md:min-h-[60vh]"
      >
        <div className="flex w-full items-center justify-center bg-black/20">
          <h1 className="font-serif text-5xl font-normal text-white md:text-7xl">
            {barrio.nombre}
          </h1>
        </div>
      </HeroMedia>

      <Container className="mt-16">
        <div className="grid gap-16 lg:grid-cols-[1fr_20rem]">
          {/* Contenido Editorial */}
          <div className="space-y-12">
            <div className="prose prose-isl max-w-none">
              <p className="font-serif text-2xl leading-relaxed text-isl-black/80 md:text-3xl">
                {barrio.extracto}
              </p>
              <div className="mt-8 space-y-6 text-lg leading-relaxed text-isl-black/70">
                {barrio.contenido?.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Listado de Propiedades */}
            <section className="pt-12 border-t border-isl-black/10">
              <SectionTitle 
                title={`Vivir en ${barrio.nombre}`} 
                subtitle="PROPIEDADES DISPONIBLES"
                className="mb-12"
              />
              {propiedadesBarrio.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2">
                  {propiedadesBarrio.map((propiedad) => (
                    <ListingCard key={propiedad.id} propiedad={propiedad} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="Sin propiedades en este sector"
                  description={`Actualmente no tenemos propiedades publicadas en ${barrio.nombre}, pero podemos avisarte apenas entre una.`}
                  ctaLabel="Crear alerta de búsqueda"
                  ctaHref={`/alertas?comuna=${encodeURIComponent(barrio.nombre)}`}
                />
              )}
            </section>
          </div>

          {/* Sidebar: Tips del Barrio */}
          <aside>
            {barrio.tips && barrio.tips.length > 0 && (
              <div className="sticky top-32 rounded-sm bg-isl-offwhite p-8">
                <h3 className="mb-6 font-serif text-xl font-normal uppercase tracking-widest text-isl-black">
                  Mirada Local
                </h3>
                <ul className="space-y-4">
                  {barrio.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-isl-black/70">
                      <span className="text-isl-gold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </main>
  );
}
