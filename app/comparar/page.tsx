import type { Metadata } from "next";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { Container } from "@/components/isl/Container";
import { EmptyState } from "@/components/isl/EmptyState";
import { PriceTag } from "@/components/isl/PriceTag";
import { SiteFooter } from "@/components/isl/SiteFooter";
import { SiteHeader } from "@/components/isl/SiteHeader";
import { formatComuna, formatUF } from "@/lib/format";
import { getPropiedadesPorSlugs } from "@/lib/propiedades";
import { getSiteSettings } from "@/lib/settings";
import type { Propiedad } from "@/types/isl";

export const revalidate = 120;

type ComparePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const VISTA_LABEL: Record<NonNullable<Propiedad["vista"]>, string> = {
  mar: "Mar",
  cerro: "Cerro",
  ciudad: "Ciudad",
  jardin: "Jardín",
  sin_vista: "Sin vista",
};

function parseSlugs(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : value ?? "";
  return [...new Set(raw.split(",").map((slug) => slug.trim()).filter(Boolean))].slice(0, 3);
}

function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function cover(propiedad: Propiedad) {
  const images = Array.isArray(propiedad.imagenes) ? propiedad.imagenes : [];
  return images.find((image) => image.portada) ?? images[0];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Comparar propiedades",
    description: "Compara hasta tres propiedades de ISL, lado a lado y en UF.",
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const slugs = parseSlugs(params.slugs);
  const [settings, propiedades] = await Promise.all([
    getSiteSettings(),
    getPropiedadesPorSlugs(slugs),
  ]);

  const rows: { label: string; value: (propiedad: Propiedad) => string }[] = [
    { label: "Comuna", value: (propiedad) => formatComuna(propiedad.comuna) || "—" },
    { label: "Sector", value: (propiedad) => cell(propiedad.sector) },
    { label: "Dormitorios", value: (propiedad) => cell(propiedad.dormitorios) },
    { label: "Baños", value: (propiedad) => cell(propiedad.banos) },
    { label: "m² construidos", value: (propiedad) => propiedad.m2_construidos != null ? `${new Intl.NumberFormat("es-CL").format(propiedad.m2_construidos)} m²` : "—" },
    { label: "m² terreno", value: (propiedad) => propiedad.m2_terreno != null ? `${new Intl.NumberFormat("es-CL").format(propiedad.m2_terreno)} m²` : "—" },
    { label: "Gastos comunes", value: (propiedad) => propiedad.gastos_comunes_uf != null ? formatUF(propiedad.gastos_comunes_uf) : "—" },
    { label: "Orientación", value: (propiedad) => cell(propiedad.orientacion) },
    { label: "Vista", value: (propiedad) => propiedad.vista ? VISTA_LABEL[propiedad.vista] : "—" },
  ];

  return (
    <>
      <SiteHeader whatsapp={settings?.whatsapp_general} />
      <main>
        <Container className="isl-section">
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Comparar</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl font-normal text-isl-black md:text-5xl">Lado a lado, en UF</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-isl-black/70">
            Revisa comuna, metros y gastos comunes sin ir y volver entre fichas.
          </p>

          {propiedades.length < 2 ? (
            <EmptyState
              className="mt-12"
              title="Elige al menos dos propiedades para comparar"
              description="Vuelve al catálogo, marca hasta tres con «Comparar» y abre de nuevo esta vista."
              ctaLabel="Volver al catálogo"
              ctaHref="/propiedades"
            />
          ) : (
            <>
              <div className="mt-10 overflow-x-auto">
                <table className="min-w-[640px] w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="w-40 p-3 text-xs font-medium uppercase tracking-widest text-isl-gray"> </th>
                      {propiedades.map((propiedad) => {
                        const image = cover(propiedad);
                        return (
                          <th key={propiedad.id} className="p-3 align-top">
                            <div className="aspect-[4/5] max-h-56 overflow-hidden bg-isl-champagne/40">
                              {image?.url ? (
                                <img src={image.url} alt={image.alt || propiedad.titulo} className="size-full object-cover" />
                              ) : (
                                <div className="flex size-full items-end p-4 font-serif text-3xl text-isl-black/40">ISL</div>
                              )}
                            </div>
                            <p className="mt-4 font-serif text-2xl font-normal text-isl-black">{propiedad.titulo}</p>
                            <div className="mt-2">
                              <PriceTag value={propiedad.precio_uf} />
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label} className="border-t border-isl-black/10">
                        <th className="p-3 text-sm font-medium text-isl-black/60">{row.label}</th>
                        {propiedades.map((propiedad) => (
                          <td key={`${propiedad.id}-${row.label}`} className="p-3 text-sm text-isl-black">
                            {row.value(propiedad)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-10">
                <ButtonISL href="/propiedades" variant="outline">Volver al catálogo</ButtonISL>
              </div>
            </>
          )}
        </Container>
      </main>
      <SiteFooter email={settings?.email_general} whatsapp={settings?.whatsapp_general} />
    </>
  );
}
