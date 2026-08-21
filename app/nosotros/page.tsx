import type { Metadata } from "next";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { AgentCard } from "@/components/isl/AgentCard";
import { getAgentesActivos } from "@/lib/agentes";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Nosotros | ISL Propiedades",
  description: "Conoce a Silvia e Ivannia, fundadoras de ISL Propiedades, y nuestra forma única de trabajar en Viña del Mar y alrededores.",
};

export default async function NosotrosPage() {
  const [agentes, settings] = await Promise.all([
    getAgentesActivos(),
    getSiteSettings(),
  ]);

  const comoTrabajamos = settings?.como_trabajamos ?? [];

  return (
    <main className="pb-24 pt-32">
      {/* La Mirada ISL */}
      <section className="mb-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">
              Nuestra Mirada
            </p>
            <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl">
              Corretaje con propósito y cercanía.
            </h1>
            <div className="space-y-6 font-serif text-xl leading-relaxed text-isl-black/80 md:text-2xl">
              <p>
                ISL Propiedades nace de la convicción de que una transacción inmobiliaria es, ante todo, un proyecto de vida. Silvia e Ivannia fundamos esta corredora boutique en Viña del Mar para ofrecer un servicio donde la comunicación directa y el cuidado por los detalles marcan la diferencia.
              </p>
              <p>
                No buscamos el volumen masivo de operaciones, sino la excelencia en cada una de ellas. Nos enfocamos en propiedades seleccionadas en el Gran Valparaíso, aplicando una mirada editorial y una preparación rigurosa para que cada casa o departamento luzca su mejor versión.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* El Equipo */}
      <section className="mb-24 bg-isl-offwhite py-24">
        <Container>
          <SectionTitle 
            title="El Equipo" 
            subtitle="QUIÉNES ESTÁN DETRÁS DE ISL"
            className="mb-16 text-center"
          />
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {agentes.map((agente) => (
              <AgentCard key={agente.id} agente={agente} />
            ))}
            {agentes.length === 0 && (
              <p className="col-span-full text-center text-isl-black/60 italic">
                Estamos cargando los perfiles de nuestro equipo.
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Cómo trabajamos */}
      {comoTrabajamos.length > 0 && (
        <section>
          <Container>
            <SectionTitle 
              title="Cómo trabajamos" 
              subtitle="NUESTRO PROCESO PASO A PASO"
              className="mb-16 text-center"
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {comoTrabajamos.map((paso, index) => (
                <article 
                  key={index} 
                  className="isl-fade-up border border-isl-black/10 bg-isl-white p-8 transition-colors hover:border-isl-gold/30"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="mb-6 block font-serif text-4xl text-isl-gold/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-4 font-serif text-2xl font-normal text-isl-black">
                    {paso.titulo}
                  </h3>
                  <p className="text-sm leading-relaxed text-isl-black/70">
                    {paso.texto}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
