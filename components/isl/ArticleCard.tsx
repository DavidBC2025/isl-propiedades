import Link from "next/link";
import type { Articulo } from "@/types/isl";

const CATEGORIA_LABEL: Record<NonNullable<Articulo["categoria"]>, string> = {
  comprar: "Comprar",
  vender: "Vender",
  invertir: "Invertir",
  barrio: "Barrio",
  tips: "Tips",
};

type ArticleCardProps = {
  articulo: Articulo;
};

export function ArticleCard({ articulo }: ArticleCardProps) {
  return (
    <Link href={`/guia/${articulo.slug}`} className="group block overflow-hidden rounded-sm bg-isl-offwhite">
      <div className="aspect-[16/10] bg-isl-champagne/40">
        {articulo.imagen_destacada ? (
          <img src={articulo.imagen_destacada} alt="" className="size-full object-cover transition duration-500 motion-safe:group-hover:scale-[1.03]" />
        ) : (
          <div className="flex size-full items-end bg-[linear-gradient(145deg,#E8DCC8,#F7F7F5)] p-5">
            <span className="font-serif text-3xl text-isl-black/45">ISL</span>
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        {articulo.categoria ? (
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">{CATEGORIA_LABEL[articulo.categoria]}</p>
        ) : null}
        <h3 className="font-serif text-2xl font-normal leading-tight text-isl-black">{articulo.titulo}</h3>
        {articulo.extracto ? <p className="text-sm leading-6 text-isl-black/70">{articulo.extracto}</p> : null}
      </div>
    </Link>
  );
}
