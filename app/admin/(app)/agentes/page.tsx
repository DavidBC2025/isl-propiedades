import { EmptyState } from "@/components/isl/EmptyState";

export const dynamic = "force-dynamic";

export default function AdminAgentesPage() {
  return (
    <EmptyState
      title="El equipo"
      description="Acá vas a completar foto, WhatsApp y especialidad. Lo armamos en el siguiente paso."
      ctaLabel="Volver al panel"
      ctaHref="/admin"
    />
  );
}
