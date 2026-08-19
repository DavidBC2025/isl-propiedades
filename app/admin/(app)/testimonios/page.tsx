import { EmptyState } from "@/components/isl/EmptyState";

export const dynamic = "force-dynamic";

export default function AdminTestimoniosPage() {
  return (
    <EmptyState
      title="Voces de clientas y clientes"
      description="Acá vas a cargar testimonios reales. Lo armamos un poco más adelante."
      ctaLabel="Volver al panel"
      ctaHref="/admin"
    />
  );
}
