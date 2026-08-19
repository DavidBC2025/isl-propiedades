import { EmptyState } from "@/components/isl/EmptyState";

export default function AdminNoEncontrada() {
  return (
    <EmptyState
      title="Esta pantalla todavía no está"
      description="Puede que el enlace esté incompleto. Vuelve al panel y entra por el menú."
      ctaLabel="Ir al panel"
      ctaHref="/admin"
    />
  );
}
