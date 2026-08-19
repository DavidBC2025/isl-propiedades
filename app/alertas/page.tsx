import type { Metadata } from "next";
import { AlertasForm } from "@/components/isl/AlertasForm";
import { Container } from "@/components/isl/Container";
import { SiteFooter } from "@/components/isl/SiteFooter";
import { SiteHeader } from "@/components/isl/SiteHeader";
import { parseCatalogoSearchParams } from "@/lib/catalogo";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 120;

type AlertasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Alertas de propiedades",
  description: "Te avisamos cuando aparezca una propiedad en Viña del Mar con el criterio que buscas.",
};

export default async function AlertasPage({ searchParams }: AlertasPageProps) {
  const params = parseCatalogoSearchParams(await searchParams);
  const settings = await getSiteSettings();

  return (
    <>
      <SiteHeader whatsapp={settings?.whatsapp_general} />
      <main>
        <Container className="isl-section grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Alertas</p>
            <h1 className="mt-3 font-serif text-4xl font-normal text-isl-black md:text-5xl">Avísame cuando aparezca algo así</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-isl-black/70">
              Deja tu correo y el criterio. Silvia e Ivannia te escriben si entra una propiedad que calza, sin ruido de más.
            </p>
          </div>
          <AlertasForm
            values={{
              comuna: params.comuna,
              operacion: params.operacion,
              tipo: params.tipo,
              precio_max_uf: params.precioMaxUf != null ? String(params.precioMaxUf) : undefined,
            }}
          />
        </Container>
      </main>
      <SiteFooter email={settings?.email_general} whatsapp={settings?.whatsapp_general} />
    </>
  );
}
