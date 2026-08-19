import { EmptyState } from "@/components/isl/EmptyState";

export const dynamic = "force-dynamic";

export default function AdminBarriosPage() {
  return (
    <EmptyState
      title="Barrios"
      description="Acá vas a publicar Reñaca, Recreo y el resto. Lo armamos un poco más adelante."
      ctaLabel="Volver al panel"
      ctaHref="/admin"
    />
  );
}
