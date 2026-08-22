import { notFound } from "next/navigation";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { LeadForm } from "@/components/isl/LeadForm";
import { ArticleCard } from "@/components/isl/ArticleCard";
import { getArticuloBySlug } from "@/lib/articulos";
import type { Articulo } from "@/types/isl";

type GuiaSlugProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: GuiaSlugProps) {
  const { slug } = await params;
  const articulo = await getArticuloBySlug(slug);
  if (!articulo) return {};

  return {
    title: `${articulo.seo_title || articulo.titulo} | ISL Propiedades`,
    description: articulo.meta_description || articulo.extracto || undefined,
    openGraph: {
      title: `${articulo.seo_title || articulo.titulo} | ISL Propiedades`,
      description: articulo.meta_description || articulo.extracto || undefined,
      type: "article",
      ...(articulo.imagen_destacada ? { images: [articulo.imagen_destacada] } : {}),
      ...(articulo.fecha_publicacion ? { publishedTime: new Date(articulo.fecha_publicacion).toISOString() } : {}),
    },
  };
}

async function getArticulosRelacionados(articulo: Articulo, limit = 3): Promise<Articulo[]> {
  try {
    const { getArticulosPublicados } = await import("@/lib/articulos");
    const todos = await getArticulosPublicados();
    return todos
      .filter((a) => a.id !== articulo.id && a.categoria === articulo.categoria)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export default async function GuiaSlugPage({ params }: GuiaSlugProps) {
  const { slug } = await params;
  const articulo = await getArticuloBySlug(slug);

  if (!articulo) notFound();

  const relacionados = await getArticulosRelacionados(articulo);
  const categoriaLabel = {
    comprar: "Comprar",
    vender: "Vender",
    invertir: "Invertir",
    barrio: "Barrio",
    tips: "Tips",
  }[articulo.categoria ?? "tips"];

  // JSON-LD Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articulo.titulo,
    description: articulo.extracto || articulo.meta_description || undefined,
    image: articulo.imagen_destacada || undefined,
    datePublished: articulo.fecha_publicacion ? new Date(articulo.fecha_publicacion).toISOString() : undefined,
    author: {
      "@type": "Organization",
      name: "ISL Propiedades",
    },
  };

  return (
    <article className="pb-24 pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        {/* Hero del Artículo */}
        <header className="mb-16 text-center">
          {articulo.categoria ? (
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">
              {categoriaLabel}
            </p>
          ) : null}
          <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl">
            {articulo.titulo}
          </h1>
          {articulo.fecha_publicacion ? (
            <p className="text-sm text-isl-gray">
              Publicado el {new Date(articulo.fecha_publicacion).toLocaleDateString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          ) : null}
        </header>

        {/* Imagen destacada */}
        {articulo.imagen_destacada ? (
          <div className="mb-16 overflow-hidden rounded-sm">
            <img
              src={articulo.imagen_destacada}
              alt={articulo.titulo}
              className="w-full object-cover"
            />
          </div>
        ) : null}

        {/* Extracto */}
        {articulo.extracto ? (
          <p className="mx-auto mb-12 max-w-3xl font-serif text-xl italic leading-relaxed text-isl-black/80 md:text-2xl">
            "{articulo.extracto}"
          </p>
        ) : null}

        {/* Contenido */}
        <div className="prose mx-auto max-w-3xl">
          {articulo.contenido?.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Descarga de reporte */}
        {articulo.es_reporte && articulo.archivo_pdf_url ? (
          <aside className="my-16 rounded-sm border border-isl-black/10 bg-isl-offwhite p-8 md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 font-serif text-3xl font-normal text-isl-black">
                Descarga el reporte completo
              </h2>
              <p className="mb-6 max-w-xl text-sm leading-relaxed text-isl-black/70 mx-auto">
                Deja tu correo y accede al reporte en PDF para profundizar en el análisis del mercado.
              </p>
              <div className="mx-auto max-w-md">
                <LeadForm
                  tipo="guia"
                  hiddenFields={["mensaje", "telefono"]}
                  submitLabel="Descargar PDF"
                                  onSuccess={() => {
                    if (articulo.archivo_pdf_url) {
                      window.open(articulo.archivo_pdf_url, "_blank");
                    }
                  }}
                />
              </div>
              <p className="mt-6 text-xs text-isl-black/50">
                También puedes                 <a href={articulo.archivo_pdf_url ?? "#"} target="_blank" rel="noreferrer" className="underline">acceder al PDF directamente</a>.
              </p>
            </div>
          </aside>
        ) : null}

        {/* Artículos relacionados */}
        {relacionados.length > 0 ? (
          <section className="mt-24">
            <SectionTitle
              title="Artículos relacionados"
              subtitle="MÁS EN DETALLE"
              className="mb-12 text-center"
            />
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((art) => (
                <ArticleCard key={art.id} articulo={art} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </article>
  );
}