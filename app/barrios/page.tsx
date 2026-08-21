import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { MapaBarrios } from "@/components/isl/MapaBarrios";
import { getBarriosPublicados } from "@/lib/barrios";
import { getPropiedadesPublicadas } from "@/lib/propiedades";

export const metadata: Metadata = {
  title: "Guía de Barrios | ISL Propiedades",
  description: "Explora los mejores barrios para vivir en Viña del Mar, Concón y el interior. Una guía local para encontrar tu lugar ideal.",
};

export default async function BarriosPage() {
  const [barrios, propiedades] = await Promise.all([
    getBarriosPublicados(),
    getPropiedadesPublicadas({ pageSize: 1000 }), // Traemos todas para contar
  ]);

  // Enriquecemos los barrios con el contador de propiedades
  const barriosConConteo = barrios.map(barrio => ({
    ...barrio,
    count: propiedades.filter(p => 
      p.comuna?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
      barrio.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    ).length
  }));

  return (
    <main className="pb-24 pt-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">
            Guía Local
          </p>
          <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl">
            Nuestros Barrios
          </h1>
          <p className="font-serif text-xl leading-relaxed text-isl-black/80 md:text-2xl">
            Conoce la identidad, servicios y estilo de vida de cada zona donde trabajamos. Desde el borde costero hasta la tranquilidad del interior.
          </p>
        </div>

        {/* Mapa Interactivo */}
        <section className="mb-24">
          <MapaBarrios barrios={barriosConConteo} />
        </section>

        {/* Grilla de Tarjetas */}
        <section>
          <SectionTitle 
            title="Explora las Zonas" 
            subtitle="DETALLE POR BARRIO"
            className="mb-12"
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {barrios.map((barrio) => (
              <Link 
                key={barrio.id} 
                href={`/barrios/${barrio.slug}`}
                className="group block overflow-hidden rounded-sm bg-isl-offwhite transition-all hover:shadow-md"
              >
                <div className="aspect-[16/9] overflow-hidden bg-isl-champagne/20">
                  {barrio.hero_image ? (
                    <img 
                      src={barrio.hero_image} 
                      alt={barrio.nombre} 
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-isl-champagne/40">
                      <span className="font-serif text-2xl text-isl-black/20">{barrio.nombre}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="mb-2 font-serif text-2xl font-normal text-isl-black group-hover:text-isl-gold">
                    {barrio.nombre}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-isl-black/70">
                    {barrio.extracto}
                  </p>
                  <span className="mt-4 inline-block text-[10px] font-medium uppercase tracking-widest text-isl-gold">
                    Ver guía del barrio →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {barrios.length === 0 && (
            <div className="py-12 text-center border border-dashed border-isl-black/10 rounded-sm">
              <p className="text-isl-black/50 italic">Estamos preparando nuestras guías de barrios.</p>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
