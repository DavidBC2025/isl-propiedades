import type { Metadata } from "next";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { ArticleCard } from "@/components/isl/ArticleCard";
import { EmptyState } from "@/components/isl/EmptyState";
import { getArticulosPublicados } from "@/lib/articulos";
import type { Articulo } from "@/types/isl";

export const metadata: Metadata = {
  title: "Guía ISL | ISL Propiedades",
  description: "Artículos y reportes sobre compra, venta e inversión inmobiliaria en Viña del Mar y el Gran Valparaíso.",
};

const CATEGORIA_LABEL: Record<NonNullable<Articulo["categoria"]>, string> = {
  comprar: "Comprar",
  vender: "Vender",
  invertir: "Invertir",
  barrio: "Barrio",
  tips: "Tips",
};

const CATEGORIAS = Object.keys(CATEGORIA_LABEL) as NonNullable<Articulo["categoria"]>[];

export default async function GuiaPage() {
  const articulos = await getArticulosPublicados();
  const categorias = [...new Set(articulos.map((a) => a.categoria).filter(Boolean))] as NonNullable<Articulo["categoria"]>[];

  // Si no hay categorías en los datos, usamos todas las posibles
  const categoriasActivas = categorias.length > 0 ? categorias : CATEGORIAS;

  return (
    <main className="pb-24 pt-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">
            Guía Local
          </p>
          <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl">
            Nuestra Guía Inmobiliaria
          </h1>
          <p className="font-serif text-xl leading-relaxed text-isl-black/80 md:text-2xl">
            Insights, consejos y reportes del mercado inmobiliario en Viña del Mar y el Gran Valparaíso.
          </p>
        </div>

        {articulos.length === 0 ? (
          <EmptyState
            title="Aún no hay artículos publicados"
            description="Estamos preparando contenido exclusivo para ti. Vuelve pronto o suscríbete para enterarte cuando publicamos."
            ctaLabel="Quiero enterarme"
            ctaHref="/alertas"
          />
        ) : (
          <>
            {/* Filtros de categoría */}
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              {categoriasActivas.map((cat) => (
                <span
                  key={cat}
                  className="rounded-sm bg-isl-offwhite px-4 py-2 text-xs font-medium uppercase tracking-widest text-isl-black/60"
                >
                  {CATEGORIA_LABEL[cat] ?? cat}
                </span>
              ))}
            </div>

            {/* Grilla de Artículos */}
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {articulos.map((articulo) => (
                <ArticleCard key={articulo.id} articulo={articulo} />
              ))}
            </div>
          </>
        )}
      </Container>
    </main>
  );
}