import { EmptyState } from "@/components/isl/EmptyState";

export const dynamic = "force-dynamic";

export default function AdminAjustesPage() {
  return (
    <EmptyState
      title="Ajustes del sitio"
      description="Acá vas a dejar el WhatsApp general y el titular de la portada. Lo armamos en Consultas y ajustes."
      ctaLabel="Volver al panel"
      ctaHref="/admin"
    />
  );
}
