import Link from "next/link";

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export function CatalogPagination({ page, totalPages, hrefForPage }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const previous = page > 1 ? hrefForPage(page - 1) : null;
  const next = page < totalPages ? hrefForPage(page + 1) : null;

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-isl-black/10 pt-6" aria-label="Paginación">
      {previous ? (
        <Link href={previous} className="inline-flex min-h-11 items-center text-sm uppercase tracking-[0.12em]">
          Anterior
        </Link>
      ) : (
        <span className="min-h-11 text-sm text-isl-gray">Anterior</span>
      )}
      <p className="text-sm text-isl-black/70">Página {page} de {totalPages}</p>
      {next ? (
        <Link href={next} className="inline-flex min-h-11 items-center text-sm uppercase tracking-[0.12em]">
          Siguiente
        </Link>
      ) : (
        <span className="min-h-11 text-sm text-isl-gray">Siguiente</span>
      )}
    </nav>
  );
}
