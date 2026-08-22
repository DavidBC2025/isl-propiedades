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
    <main className="pb-32 pt-36 bg-isl-white">
      <Container>
        {/* Cabecera con animación de entrada suave */}
        <div className="mx-auto max-w-3xl text-center mb-20 animate-fade-in">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-isl-gold">
            Guía Exclusiva
          </p>
          <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl tracking-tight">
            Nuestros Barrios
          </h1>
          <p className="font-serif text-xl leading-relaxed text-isl-black/80 md:text-2xl font-light">
            Conoce la identidad, servicios y estilo de vida de cada zona donde trabajamos. Desde el borde costero hasta la tranquilidad del interior.
          </p>
        </div>

        {/* Mapa Interactivo con transición envolvente */}
        <section className="mb-28 transition-all duration-700 hover:opacity-100">
          <MapaBarrios barrios={barriosConConteo} />
        </section>

        {/* Grilla de Tarjetas con efectos de alta gama (Zoom suave y difuminado) */}
        <section>
          <SectionTitle 
            title="Explora las Zonas" 
            subtitle="DETALLE POR BARRIO"
            className="mb-12"
          />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {barrios.map((barrio, index) => (
              <Link 
                key={barrio.id} 
                href={`/barrios/${barrio.slug}`}
                className="group block overflow-hidden rounded-sm bg-isl-offwhite border border-isl-black/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-isl-gold/40"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[16/9] overflow-hidden bg-isl-champagne/20 relative">
                  {barrio.hero_image ? (
                    <img 
                      src={barrio.hero_image} 
                      alt={barrio.nombre} 
                      className="size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-isl-champagne/40">
                      <span className="font-serif text-2xl text-isl-black/20">{barrio.nombre}</span>
                    </div>
                  )}
                  {/* Capa sutil de iluminación en hover */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="p-8">
                  <h3 className="mb-3 font-serif text-2xl font-normal text-isl-black group-hover:text-isl-gold transition-colors duration-300">
                    {barrio.nombre}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-isl-black/70 font-light mb-6">
                    {barrio.extracto}
                  </p>
                  <span className="inline-flex items-center text-[11px] font-medium uppercase tracking-[0.2em] text-isl-gold group-hover:translate-x-1 transition-transform duration-300">
                    Ver guía del barrio <span className="ml-2">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {barrios.length === 0 && (
            <div className="py-16 text-center border border-dashed border-isl-black/10 rounded-sm">
              <p className="text-isl-black/50 italic font-serif">Estamos preparando nuestras guías de barrios.</p>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
