import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompareBar } from "@/components/isl/CompareBar";
import { Container } from "@/components/isl/Container";
import { FichaPropiedadDetalle } from "@/components/isl/FichaPropiedadDetalle";
import { ListingCard } from "@/components/isl/ListingCard";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { SiteFooter } from "@/components/isl/SiteFooter";
import { SiteHeader } from "@/components/isl/SiteHeader";
import { getAgentesActivos } from "@/lib/agentes";
import { formatComuna } from "@/lib/format";
import { portadaImagen, seoDescription } from "@/lib/ficha";
import { getPropiedadBySlug, getPropiedadesSimilares } from "@/lib/propiedades";
import { getSiteSettings } from "@/lib/settings";
import { getPublicSiteUrl } from "@/lib/site";
import type { Propiedad } from "@/types/isl";

export const revalidate = 120;

type FichaPageProps = {
  params: Promise<{ slug: string }>;
};

const PUBLIC_STATES = ["publicada", "reservada", "vendida"] as const;

function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function listingJsonLd(propiedad: Propiedad, url: string) {
  const cover = portadaImagen(propiedad.imagenes);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: propiedad.titulo,
    description: seoDescription(propiedad.descripcion, propiedad.titulo),
    url,
    address: {
      "@type": "PostalAddress",
      addressLocality: propiedad.comuna,
      addressRegion: "Valparaíso",
      addressCountry: "CL",
    },
  };
  if (cover?.url) data.image = cover.url;
  if (typeof propiedad.lat === "number" && typeof propiedad.lng === "number") {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: propiedad.lat,
      longitude: propiedad.lng,
    };
  }
  return data;
}

function breadcrumbJsonLd(propiedad: Propiedad, url: string, origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: origin },
      { "@type": "ListItem", position: 2, name: "Propiedades", item: `${origin}/propiedades` },
      { "@type": "ListItem", position: 3, name: formatComuna(propiedad.comuna) || propiedad.comuna, item: `${origin}/propiedades?comuna=${encodeURIComponent(propiedad.comuna)}` },
      { "@type": "ListItem", position: 4, name: propiedad.titulo, item: url },
    ],
  };
}

export async function generateMetadata({ params }: FichaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const propiedad = await getPropiedadBySlug(slug);
  if (!propiedad) {
    return { title: { absolute: "Propiedad no encontrada | ISL Propiedades" } };
  }

  const origin = getPublicSiteUrl();
  const url = `${origin}/propiedades/${propiedad.slug}`;
  const cover = portadaImagen(propiedad.imagenes);
  const description = seoDescription(
    propiedad.descripcion,
    `${propiedad.titulo} en ${propiedad.comuna}. Corredora boutique ISL en Viña del Mar.`,
  );

  return {
    title: { absolute: `${propiedad.titulo} | ISL Propiedades` },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${propiedad.titulo} | ISL Propiedades`,
      description,
      url,
      locale: "es_CL",
      type: "article",
      images: cover?.url ? [{ url: cover.url, alt: cover.alt || propiedad.titulo }] : undefined,
    },
  };
}

export default async function FichaPropiedadPage({ params }: FichaPageProps) {
  const { slug } = await params;
  const [propiedad, settings, agentes] = await Promise.all([
    getPropiedadBySlug(slug),
    getSiteSettings(),
    getAgentesActivos(),
  ]);

  if (!propiedad || !PUBLIC_STATES.includes(propiedad.estado as typeof PUBLIC_STATES[number])) {
    notFound();
  }

  const agente = propiedad.agente ?? agentes[0] ?? null;
  const similares = await getPropiedadesSimilares(propiedad, 4);
  const origin = getPublicSiteUrl();
  const url = `${origin}/propiedades/${propiedad.slug}`;
  const comunaLabel = formatComuna(propiedad.comuna) || propiedad.comuna;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(listingJsonLd(propiedad, url)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(propiedad, url, origin)) }} />
      <SiteHeader whatsapp={settings?.whatsapp_general} />
      <main>
        <Container className="pt-8">
          <nav aria-label="Migas de pan" className="text-sm text-isl-black/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="min-h-11 inline-flex items-center underline-offset-4 hover:underline">Inicio</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/propiedades" className="min-h-11 inline-flex items-center underline-offset-4 hover:underline">Propiedades</Link></li>
              <li aria-hidden>/</li>
              <li><Link href={`/propiedades?comuna=${encodeURIComponent(propiedad.comuna)}`} className="min-h-11 inline-flex items-center underline-offset-4 hover:underline">{comunaLabel}</Link></li>
              <li aria-hidden>/</li>
              <li className="text-isl-black">{propiedad.titulo}</li>
            </ol>
          </nav>
        </Container>

        <Container className="py-10">
          <FichaPropiedadDetalle propiedad={propiedad} agente={agente} similaresHref={similares.length > 0 ? "#similares" : "/propiedades"} />
        </Container>

        {similares.length > 0 ? (
          <section id="similares" className="isl-section bg-isl-offwhite">
            <Container>
              <SectionTitle subtitle="Similares" title="Otras propiedades que podrían servirte" className="max-w-2xl" />
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {similares.map((item) => (
                  <ListingCard key={item.id} propiedad={item} enableCompare={true} />
                ))}
              </div>
            </Container>
          </section>
        ) : null}
      </main>
      <CompareBar />
      <SiteFooter email={settings?.email_general} whatsapp={settings?.whatsapp_general} />
    </>
  );
}
