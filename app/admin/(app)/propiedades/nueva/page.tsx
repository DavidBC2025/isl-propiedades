import { EmptyState } from "@/components/isl/EmptyState";

export const dynamic = "force-dynamic";

export default function NuevaPropiedadPendientePage() {
  return (
    <EmptyState
      title="Acá vas a cargar la propiedad"
      description="En el siguiente paso armamos el formulario con fotos, video y todos los datos. El botón ya quedó listo."
      ctaLabel="Volver a la cartera"
      ctaHref="/admin/propiedades"
    />
  );
}
