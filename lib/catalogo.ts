import type { Propiedad } from "@/types/isl";

export const CATALOG_PAGE_SIZE = 12;

export type CatalogoFiltros = {
  comuna?: string;
  operacion?: Exclude<Propiedad["operacion"], null>;
  tipo?: Exclude<Propiedad["tipo"], null>;
  precioMinUf?: number;
  precioMaxUf?: number;
  dormitorios?: number;
  page: number;
};

type SearchValue = string | string[] | undefined;

function first(value: SearchValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositiveNumber(value: SearchValue): number | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const amount = Number(raw);
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined;
}

function parsePage(value: SearchValue): number {
  const raw = first(value);
  const page = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function parseCatalogoSearchParams(searchParams: Record<string, SearchValue>): CatalogoFiltros {
  const operacion = first(searchParams.operacion);
  const tipo = first(searchParams.tipo);

  return {
    comuna: first(searchParams.comuna),
    operacion: operacion === "venta" || operacion === "arriendo" ? operacion : undefined,
    tipo: tipo === "casa" || tipo === "departamento" || tipo === "parcela" ? tipo : undefined,
    precioMinUf: parsePositiveNumber(searchParams.precio_min ?? searchParams.precio_min_uf),
    precioMaxUf: parsePositiveNumber(searchParams.precio_max ?? searchParams.precio_max_uf),
    dormitorios: parsePositiveNumber(searchParams.dormitorios),
    page: parsePage(searchParams.page),
  };
}

function toSearchParams(filtros: Omit<CatalogoFiltros, "page"> & { page?: number }): URLSearchParams {
  const params = new URLSearchParams();
  if (filtros.comuna) params.set("comuna", filtros.comuna);
  if (filtros.operacion) params.set("operacion", filtros.operacion);
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  if (filtros.precioMinUf !== undefined) params.set("precio_min_uf", String(filtros.precioMinUf));
  if (filtros.precioMaxUf !== undefined) params.set("precio_max_uf", String(filtros.precioMaxUf));
  if (filtros.dormitorios !== undefined) params.set("dormitorios", String(filtros.dormitorios));
  if (filtros.page && filtros.page > 1) params.set("page", String(filtros.page));
  return params;
}

export function catalogoHref(filtros: CatalogoFiltros, page = filtros.page): string {
  const params = toSearchParams({ ...filtros, page });
  const query = params.toString();
  return query ? `/propiedades?${query}` : "/propiedades";
}

export function alertasHref(filtros: CatalogoFiltros): string {
  const params = toSearchParams({ ...filtros, page: 1 });
  const query = params.toString();
  return query ? `/alertas?${query}` : "/alertas";
}
