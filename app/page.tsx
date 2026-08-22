import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/isl/Container";
import { getPropiedadesPublicadas } from "@/lib/propiedades";
import { getBarriosPublicados } from "@/lib/barrios";
import { formatUF } from "@/lib/format";

export const metadata: Metadata = {
  title: "ISL Propiedades | Corretaje Boutique & Inversiones en Viña del Mar",
  description: "Plataforma inmobiliaria de alta gama en Viña del Mar, Concón y la Región de Valparaíso. Gestión exclusiva, tasaciones y propiedades de lujo.",
};

export default async function HomePage() {
  const [propiedades, barrios] = await Promise.all([
    getPropiedadesPublicadas({ pageSize: 6 }),
    getBarriosPublicados(),
  ]);

  return (
    <div className="bg-isl-white text-isl-black selection:bg-isl-gold selection:text-white">
      {/* 1. HERO / SLIDESHOW DE IMPACTO (Pantalla completa inicial) */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-isl-black">
        {/* Imagen de fondo con escala y fundido suave */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: `url('/images/hero-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-isl-black via-isl-black/40 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white animate-fade-in">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-isl-gold mb-4">
            Corretaje Boutique • Viña del Mar
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-normal tracking-tight mb-6 leading-tight">
            Exclusividad y Legado Inmobiliario
          </h1>
          <p className="font-light text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 tracking-wide">
            Especialistas en propiedades residenciales de alta gama, gestión de activos y asesoría patrimonial personalizada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/propiedades"
              className="w-full sm:w-auto bg-isl-gold text-white px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-isl-black transition-all duration-300"
            >
              Explorar Propiedades
            </Link>
            <Link 
              href="/tasacion"
              className="w-full sm:w-auto border border-white/40 text-white px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:border-isl-gold hover:text-isl-gold transition-all duration-300"
            >
              Solicitar Tasación
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN: ESTADÍSTICAS Y TRAYECTORIA (Efecto Parallax visual) */}
      <section className="relative py-32 bg-fixed bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url('/images/stats-bg.jpg')` }}>
        <div className="absolute inset-0 bg-isl-black/75 backdrop-blur-[2px]" />
        
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-isl-gold mb-3">Por qué elegirnos</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white font-normal">Excelencia Comprobada</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-white">
            <div className="p-8 border-b md:border-b-0 md:border-r border-white/10">
              <p className="font-serif text-5xl md:text-6xl text-isl-gold mb-2 font-light">+ UF 500k</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">En gestión y ventas exclusivas</p>
            </div>
            <div className="p-8 border-b md:border-b-0 md:border-r border-white/10">
              <p className="font-serif text-5xl md:text-6xl text-isl-gold mb-2 font-light">100%</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Compromiso y asesoría directa</p>
            </div>
            <div className="p-8">
              <p className="font-serif text-5xl md:text-6xl text-isl-gold mb-2 font-light">V Región</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Viña del Mar, Concón e Interior</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. SECCIÓN: PROPIEDADES DESTACADAS (Carrusel / Grilla fluida) */}
      <section className="py-32 bg-isl-offwhite">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-isl-gold mb-2">Portafolio</p>
              <h2 className="font-serif text-4xl md:text-5xl text-isl-black font-normal">Propiedades Destacadas</h2>
            </div>
            <Link 
              href="/propiedades"
              className="mt-6 md:mt-0 text-xs font-medium uppercase tracking-[0.2em] text-isl-black hover:text-isl-gold transition-colors inline-flex items-center gap-2"
            >
              Ver todo el catálogo <span className="text-lg">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {propiedades.map((p) => (
              <Link 
                key={p.id} 
                href={`/propiedades/${p.slug}`}
                className="group block bg-isl-white border border-isl-black/5 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden bg-isl-champagne/20 relative">
                  {p.imagenes?.[0]?.url ? (
                    <img
                      src={p.imagenes[0].url}
                      alt={p.titulo}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-isl-black/30 font-serif">Sin imagen</div>
                  )}
                  <div className="absolute top-4 left-4 bg-isl-black/80 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-medium">
                    {p.operacion}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-widest text-isl-gold mb-1">{p.comuna}</p>
                  <h3 className="font-serif text-xl text-isl-black mb-3 line-clamp-1 group-hover:text-isl-gold transition-colors">
                    {p.titulo}
                  </h3>
                  <p className="font-serif text-lg font-medium text-isl-black">
                    {formatUF(p.precio_uf)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. SECCIÓN: SERVICIOS Y BARRIOS (Recorrido narrativo) */}
      <section className="py-32 bg-isl-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-isl-gold mb-3">Experiencia Local</p>
            <h2 className="font-serif text-4xl md:text-5xl text-isl-black font-normal mb-6">Nuestros Barrios</h2>
            <p className="text-isl-black/70 font-serif text-lg">
              Conoce las ubicaciones más cotizadas de la región y descubre dónde se encuentra tu próximo hogar o inversión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {barrios.slice(0, 4).map((b) => (
              <Link 
                key={b.id}
                href={`/barrios/${b.slug}`}
                className="group relative h-96 overflow-hidden rounded-sm flex items-end p-8"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${b.hero_image || "/images/hero-bg.jpg"}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-isl-black via-isl-black/30 to-transparent" />
                
                <div className="relative z-10 text-white">
                  <h3 className="font-serif text-2xl mb-2 group-hover:text-isl-gold transition-colors">{b.nombre}</h3>
                  <p className="text-xs text-white/70 uppercase tracking-widest">Explorar Zona →</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}