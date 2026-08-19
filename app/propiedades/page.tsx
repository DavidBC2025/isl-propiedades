import type { Metadata } from "next";
import { CatalogPagination } from "@/components/isl/CatalogPagination";
import { CompareBar } from "@/components/isl/CompareBar";
import { Container } from "@/components/isl/Container";
import { EmptyState } from "@/components/isl/EmptyState";
import { ListingCard } from "@/components/isl/ListingCard";
import { QuickSearch } from "@/components/isl/QuickSearch";
import { SiteFooter } from "@/components/isl/SiteFooter";
import { SiteHeader } from "@/components/isl/SiteHeader";
import { alertasHref, CATALOG_PAGE_SIZE, catalogoHref, parseCatalogoSearchParams } from "@/lib/catalogo";
import { countPropiedadesPublicadas, getPropiedadesPublicadas } from "@/lib/propiedades";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 120;

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Propiedades",
    description: "Casas y departamentos en Viña del Mar y alrededores, elegidos por Silvia e Ivannia.",
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = parseCatalogoSearchParams(await searchParams);
  const filtros = {
    comuna: params.comuna,
    operacion: params.operacion,
    tipo: params.tipo,
    precioMinUf: params.precioMinUf,
    precioMaxUf: params.precioMaxUf,
    dormitoriosMin: params.dormitorios,
  };

  const [settings, total] = await Promise.all([
    getSiteSettings(),
    countPropiedadesPublicadas(filtros),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page), total === 0 ? 1 : totalPages);
  const propiedades = await getPropiedadesPublicadas({ ...filtros, page, pageSize: CATALOG_PAGE_SIZE });

  return (
    <>
      <SiteHeader whatsapp={settings?.whatsapp_general} />
      <main className="pb-8">
        <Container className="isl-section">
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Catálogo</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl font-normal text-isl-black md:text-5xl">Propiedades en Viña del Mar y alrededores</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-isl-black/70">
            Filtra por comuna, operación y UF. Si algo te llama, márcalo para comparar hasta tres propiedades.
          </p>

          <div className="mt-10">
            <QuickSearch
              showDormitorios
              values={{
                comuna: params.comuna,
                operacion: params.operacion ?? undefined,
                tipo: params.tipo ?? undefined,
                precio_min_uf: params.precioMinUf != null ? String(params.precioMinUf) : undefined,
                precio_max_uf: params.precioMaxUf != null ? String(params.precioMaxUf) : undefined,
                dormitorios: params.dormitorios != null ? String(params.dormitorios) : undefined,
              }}
            />
          </div>

          {propiedades.length > 0 ? (
            <>
              <p className="mt-10 text-sm text-isl-black/60">
                {total === 1 ? "1 propiedad" : `${total} propiedades`}
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {propiedades.map((propiedad) => (
                  <ListingCard key={propiedad.id} propiedad={propiedad} enableCompare={true} />
                ))}
              </div>
              <CatalogPagination page={page} totalPages={totalPages} hrefForPage={(nextPage) => catalogoHref(params, nextPage)} />
            </>
          ) : (
            <EmptyState
              className="mt-12"
              title="No encontramos propiedades con esos filtros"
              description="Prueba aflojando comuna, tipo o el rango en UF. Si quieres, te avisamos cuando aparezca algo así."
              ctaLabel="Avísame cuando aparezca algo así"
              ctaHref={alertasHref(params)}
            />
          )}
        </Container>
      </main>
      <CompareBar />
      <SiteFooter email={settings?.email_general} whatsapp={settings?.whatsapp_general} />
    </>
  );
}
