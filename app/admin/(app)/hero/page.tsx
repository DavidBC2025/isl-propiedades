import { EmptyState } from "@/components/isl/EmptyState";

export const dynamic = "force-dynamic";

export default function AdminHeroPage() {
  return (
    <EmptyState
      title="Los destacados de portada"
      description="Acá vas a elegir qué se ve primero cuando alguien entra al sitio. Lo armamos en el siguiente paso."
      ctaLabel="Volver al panel"
      ctaHref="/admin"
    />
  );
}
