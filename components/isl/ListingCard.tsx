import Link from "next/link";
import { PriceTag } from "@/components/isl/PriceTag";
import { formatComuna } from "@/lib/format";
import type { Propiedad } from "@/types/isl";

type ListingCardProps = {
  propiedad: Propiedad;
  className?: string;
};

function operationLabel(operacion: Propiedad["operacion"]): string {
  return operacion === "arriendo" ? "Arriendo" : "Venta";
}

function statusLabel(estado: Propiedad["estado"]): string | null {
  if (estado === "reservada") return "Reservada";
  if (estado === "vendida") return "Vendida";
  return null;
}

export function ListingCard({ propiedad, className }: ListingCardProps) {
  const images = Array.isArray(propiedad.imagenes) ? propiedad.imagenes : [];
  const portada = images.find((image) => image.portada) ?? images[0];
  const dimensions = propiedad.m2_construidos ?? propiedad.m2_terreno;
  const status = statusLabel(propiedad.estado);

  return (
    <Link href={`/propiedades/${propiedad.slug}`} className={["group block", className].filter(Boolean).join(" ")}>
      <article className="overflow-hidden rounded-sm bg-isl-offwhite">
        <div className="relative aspect-[4/5] overflow-hidden bg-isl-champagne/40">
          {portada?.url ? (
            <img src={portada.url} alt={portada.alt || propiedad.titulo} className="size-full object-cover transition duration-500 motion-safe:group-hover:scale-[1.03]" />
          ) : (
            <div className="flex size-full items-end bg-[linear-gradient(145deg,#E8DCC8,#F7F7F5)] p-5" aria-label="Propiedad sin fotografía">
              <span className="font-serif text-3xl text-isl-black/45">ISL</span>
            </div>
          )}
          <div className="absolute inset-0 bg-isl-black/0 transition duration-300 motion-safe:group-hover:bg-isl-black/45" aria-hidden="true" />
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-sm bg-isl-white/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-isl-black">{operationLabel(propiedad.operacion)}</span>
            {status ? <span className="rounded-sm bg-isl-gold px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-isl-black">{status}</span> : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition duration-300 motion-safe:group-hover:translate-y-0 motion-safe:group-hover:opacity-100">
            <PriceTag value={propiedad.precio_uf} dark />
            <p className="mt-2 text-sm text-isl-white">{formatComuna(propiedad.comuna)}</p>
          </div>
        </div>
        <div className="space-y-3 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">{formatComuna(propiedad.comuna)}</p>
          <h3 className="font-serif text-2xl font-normal leading-tight text-isl-black">{propiedad.titulo}</h3>
          <PriceTag value={propiedad.precio_uf} />
          <p className="text-sm text-isl-black/65">
            {[
              propiedad.dormitorios ? `${propiedad.dormitorios} dorm.` : null,
              propiedad.banos ? `${propiedad.banos} baños` : null,
              dimensions ? `${new Intl.NumberFormat("es-CL").format(dimensions)} m²` : null,
            ].filter(Boolean).join(" · ") || "Detalles próximamente"}
          </p>
        </div>
      </article>
    </Link>
  );
}
