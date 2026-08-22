import { notFound } from "next/navigation";
import { Container } from "@/components/isl/Container";
import { EmptyState } from "@/components/isl/EmptyState";

export { notFound };

export default function GuiaNotFound() {
  return (
    <main className="pb-24 pt-32">
      <Container>
        <EmptyState
          title="Artículo no encontrado"
          description="Este artículo puede haber sido eliminado o cambiado de URL."
          ctaLabel="Ver todos los artículos"
          ctaHref="/guia"
        />
      </Container>
    </main>
  );
}
