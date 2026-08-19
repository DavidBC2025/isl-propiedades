"use client";

import { AgentCard } from "@/components/isl/AgentCard";
import { FichaAcciones } from "@/components/isl/FichaAcciones";
import { FichaGaleria } from "@/components/isl/FichaGaleria";
import { LeadForm } from "@/components/isl/LeadForm";
import { PriceTag } from "@/components/isl/PriceTag";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { formatComuna } from "@/lib/format";
import { isHttpUrl, osmEmbedUrl } from "@/lib/ficha";
import type { Agente, Propiedad } from "@/types/isl";

type FichaPropiedadDetalleProps = {
  propiedad: Propiedad;
  agente: Agente | null;
  similaresHref?: string;
};

function operationLabel(operacion: Propiedad["operacion"]): string {
  return operacion === "arriendo" ? "Arriendo" : "Venta";
}

export function FichaPropiedadDetalle({ propiedad, agente, similaresHref = "#similares" }: FichaPropiedadDetalleProps) {
  const caracteristicas = Array.isArray(propiedad.caracteristicas) ? propiedad.caracteristicas.filter(Boolean) : [];
  const hasCoords = typeof propiedad.lat === "number" && Number.isFinite(propiedad.lat) && typeof propiedad.lng === "number" && Number.isFinite(propiedad.lng);
  const specs = [
    propiedad.dormitorios != null ? { label: "Dormitorios", value: String(propiedad.dormitorios) } : null,
    propiedad.banos != null ? { label: "Baños", value: String(propiedad.banos) } : null,
    propiedad.m2_construidos != null ? { label: "m² construidos", value: new Intl.NumberFormat("es-CL").format(propiedad.m2_construidos) } : null,
    propiedad.m2_terreno != null ? { label: "m² terreno", value: new Intl.NumberFormat("es-CL").format(propiedad.m2_terreno) } : null,
    propiedad.estacionamientos != null ? { label: "Estacionamientos", value: String(propiedad.estacionamientos) } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
  const vendida = propiedad.estado === "vendida";
  const reservada = propiedad.estado === "reservada";
  const lugar = [formatComuna(propiedad.comuna), propiedad.sector].filter(Boolean).join(" · ");

  return (
    <article className="space-y-12">
      <FichaGaleria propiedad={propiedad} />

      {isHttpUrl(propiedad.tour_url) ? (
        <div>
          <ButtonISL href={propiedad.tour_url} variant="gold">Ver tour virtual</ButtonISL>
        </div>
      ) : null}

      <header className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-sm bg-isl-black px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-isl-white">
            {operationLabel(propiedad.operacion)}
          </span>
          {reservada ? (
            <span className="rounded-sm bg-isl-gold px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-isl-black">Reservada</span>
          ) : null}
          {vendida ? (
            <span className="rounded-sm bg-isl-gold px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-isl-black">Vendida</span>
          ) : null}
        </div>
        <h1 className="font-serif text-4xl font-normal leading-tight text-isl-black md:text-5xl">{propiedad.titulo}</h1>
        {lugar ? <p className="text-sm uppercase tracking-[0.12em] text-isl-gray">{lugar}</p> : null}
        <PriceTag value={propiedad.precio_uf} size="lg" />
        {specs.length > 0 ? (
          <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-isl-black/10 pt-5">
            {specs.map((spec) => (
              <div key={spec.label}>
                <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-isl-gray">{spec.label}</dt>
                <dd className="mt-1 text-lg tabular-nums text-isl-black">{spec.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>

      <FichaAcciones propiedad={propiedad} agente={agente} />

      {propiedad.descripcion?.trim() ? (
        <section>
          <h2 className="font-serif text-3xl font-normal text-isl-black">La propiedad</h2>
          <p className="mt-4 whitespace-pre-line text-base leading-7 text-isl-black/80">{propiedad.descripcion}</p>
        </section>
      ) : null}

      {caracteristicas.length > 0 ? (
        <section>
          <h2 className="font-serif text-3xl font-normal text-isl-black">Características</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {caracteristicas.map((item) => (
              <li key={item} className="rounded-sm bg-isl-offwhite px-3 py-2 text-sm text-isl-black">{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasCoords || propiedad.direccion_publica ? (
        <section>
          <h2 className="font-serif text-3xl font-normal text-isl-black">Ubicación</h2>
          {hasCoords ? (
            <div className="mt-5 overflow-hidden rounded-sm border border-isl-black/10">
              <iframe
                title={`Mapa de ${propiedad.titulo}`}
                className="h-72 w-full border-0"
                src={osmEmbedUrl(propiedad.lat as number, propiedad.lng as number)}
                loading="lazy"
              />
            </div>
          ) : null}
          {propiedad.direccion_publica ? (
            <p className="mt-3 text-sm text-isl-black/70">{propiedad.direccion_publica}</p>
          ) : null}
        </section>
      ) : null}

      {agente ? (
        <section>
          <h2 className="font-serif text-3xl font-normal text-isl-black">Agente a cargo</h2>
          <div className="mt-6 max-w-sm">
            <AgentCard agente={agente} />
          </div>
        </section>
      ) : null}

      <section>
        {vendida ? (
          <div className="border border-isl-black/10 bg-isl-offwhite px-6 py-10">
            <h2 className="font-serif text-3xl font-normal text-isl-black">Esta propiedad ya fue vendida</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-isl-black/70">
              La dejamos acá como parte del portafolio. Si buscas algo parecido, mira las propiedades similares más abajo.
            </p>
            <div className="mt-6">
              <ButtonISL href={similaresHref} variant="outline">Ver propiedades similares</ButtonISL>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-normal text-isl-black">
                {reservada ? "Esta propiedad está en proceso de reserva" : "Agendar una visita"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-isl-black/70">
                {reservada
                  ? "Si te interesa, escríbenos igual. Te contamos cómo va el proceso y si se libera, te avisamos."
                  : "Cuéntanos quién eres y coordinamos una visita con calma."}
              </p>
            </div>
            <LeadForm
              tipo="visita"
              propiedadId={propiedad.id}
              agenteId={agente?.id}
              submitLabel={reservada ? "Quiero que me contacten" : "Pedir una visita"}
            />
          </div>
        )}
      </section>
    </article>
  );
}
