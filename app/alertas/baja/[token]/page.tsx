import type { Metadata } from "next";
import { Container } from "@/components/isl/Container";
import { EmptyState } from "@/components/isl/EmptyState";
import { SiteFooter } from "@/components/isl/SiteFooter";
import { SiteHeader } from "@/components/isl/SiteHeader";
import { bajaAlertaPorToken } from "@/lib/alertas";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type BajaPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Baja de alerta",
  robots: { index: false, follow: false },
};

export default async function BajaAlertaPage({ params }: BajaPageProps) {
  const { token } = await params;
  const [settings, found] = await Promise.all([
    getSiteSettings(),
    bajaAlertaPorToken(token),
  ]);

  return (
    <>
      <SiteHeader whatsapp={settings?.whatsapp_general} />
      <main>
        <Container className="isl-section">
          {found ? (
            <EmptyState
              title="Ya no te vamos a escribir por esta alerta"
              description="Listo, la dejamos inactiva. Si más adelante quieres volver a enterarte, puedes suscribirte de nuevo desde el catálogo."
              ctaLabel="Ver propiedades"
              ctaHref="/propiedades"
            />
          ) : (
            <EmptyState
              title="Este enlace ya no es válido"
              description="Puede que ya te hayas dado de baja o que el enlace esté incompleto. Si quieres una alerta nueva, vuelve al catálogo."
              ctaLabel="Ir al catálogo"
              ctaHref="/propiedades"
            />
          )}
        </Container>
      </main>
      <SiteFooter email={settings?.email_general} whatsapp={settings?.whatsapp_general} />
    </>
  );
}
