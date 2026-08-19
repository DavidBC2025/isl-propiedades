import { EmptyState } from "@/components/isl/EmptyState";

export const dynamic = "force-dynamic";

export default function AdminGuiaPage() {
  return (
    <EmptyState
      title="La guía"
      description="Acá vas a escribir y publicar las notas. Lo armamos un poco más adelante."
      ctaLabel="Volver al panel"
      ctaHref="/admin"
    />
  );
}
