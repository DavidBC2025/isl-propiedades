import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/isl/Container";
import { getPropiedadesPublicadas } from "@/lib/propiedades";
import { getBarriosPublicados } from "@/lib/barrios";
import { formatUF } from "@/lib/format";
import { HeroSlider } from "@/components/isl/HeroSlider";

export const metadata: Metadata = {
  title: "ISL Propiedades | Corretaje Boutique & Inversiones en Viña del Mar",
  description: "Plataforma inmobiliaria de alta gama en Viña del Mar, Concón y la Región de Valparaíso.",
};

export default async function HomePage() {
  const [propiedades, barrios] = await Promise.all([
    getPropiedadesPublicadas({ pageSize: 3 }),
    getBarriosPublicados(),
  ]);

  return (
    <div className="bg-isl-black text-isl-white selection:bg-isl-gold selection:text-white overflow-hidden">
      
      {/* 1. HERO SLIDESHOW */}
      <HeroSlider propiedades={propiedades} />

      {/* 2. PROPIEDADES DESTACADAS */}
      <section className="relative py-32 bg-[#050505] text-white border-t border-white/5 transition-colors duration-700">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-isl-gold mb-2">Portafolio</p>
              <h2 className="font-serif text-4xl md:text-5xl font-normal">Propiedades Destacadas</h2>
            </div>
            <Link 
              href="/propiedades"
              className="mt-6 md:mt-0 text-xs font-medium uppercase tracking-[0.2em] text-white/70 hover:text-isl-gold transition-colors inline-flex items-center gap-2 group"
            >
              Ver Propiedades <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {propiedades.map((p) => (
              <Link 
                key={p.id} 
                href={`/propiedades/${p.slug}`}
                className="group block relative aspect-[4/5] overflow-hidden bg-zinc-900 shadow-xl"
              >
                {/* Imagen de fondo */}
                {p.imagenes?.[0]?.url ? (
                  <img 
                    src={p.imagenes[0].url} 
                    alt={p.titulo} 
                    className="absolute inset-0 size-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-800" />
                )}

                {/* ESTADO NORMAL: Gradiente negro abajo, título y precio visibles */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 transition-opacity duration-500 group-hover:opacity-0">
                  <h3 className="font-serif text-2xl text-white mb-2 line-clamp-1 shadow-black drop-shadow-md">
                    {p.titulo}
                  </h3>
                  <p className="font-sans text-lg font-light text-white shadow-black drop-shadow-md">
                    {formatUF(p.precio_uf)}
                  </p>
                </div>

                {/* ESTADO HOVER: Capa blanca transparente (permite ver la foto atrás) */}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-center text-center p-8 z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-isl-gold mb-4 border border-isl-gold px-3 py-1 bg-white/80">
                    {p.operacion}
                  </p>
                  <h3 className="font-serif text-2xl text-black mb-1 line-clamp-2 drop-shadow-sm">
                    {p.titulo}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-black/70 mb-6 font-medium">
                    {p.comuna}, {p.sector || 'V Región'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-black/90 font-medium mb-8 bg-white/40 px-4 py-2 rounded-sm backdrop-blur-md">
                    <span className="flex flex-col items-center">
                      <strong className="text-xl font-normal">{p.habitaciones || 0}</strong> Habitaciones
                    </span>
                    <span className="h-8 w-px bg-black/20"></span>
                    <span className="flex flex-col items-center">
                      <strong className="text-xl font-normal">{p.banos || 0}</strong> Baños
                    </span>
                    <span className="h-8 w-px bg-black/20"></span>
                    <span className="flex flex-col items-center">
                      <strong className="text-xl font-normal">{p.superficie_util || p.superficie_total || 'N/A'}</strong> m²
                    </span>
                  </div>

                  <p className="font-serif text-2xl text-black font-medium drop-shadow-sm">
                    {formatUF(p.precio_uf)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. SERVICIOS (Enlistar, Comprar, Valorizar) */}
      <section className="relative py-32 bg-[#0a0a0a] border-t border-white/5 transition-colors duration-700">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link href="/contacto" className="group relative h-[400px] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/images/sell-bg.jpg')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-50 grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="relative z-10 text-center">
                <h3 className="font-serif text-3xl text-white mb-3">Vender</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-isl-gold">Enlista con nosotros</p>
              </div>
            </Link>

            <Link href="/propiedades" className="group relative h-[400px] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/images/buy-bg.jpg')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-50 grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="relative z-10 text-center">
                <h3 className="font-serif text-3xl text-white mb-3">Comprar</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-isl-gold">Encuentra tu hogar</p>
              </div>
            </Link>

            <Link href="/tasacion" className="group relative h-[400px] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/images/valuate-bg.jpg')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-50 grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="relative z-10 text-center">
                <h3 className="font-serif text-3xl text-white mb-3">Valorizar</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-isl-gold">Tasación profesional</p>
              </div>
            </Link>

          </div>
        </Container>
      </section>

      {/* 4. ESTADÍSTICAS / EXCELENCIA COMPROBADA */}
      <section className="relative py-32 bg-[#111111] border-t border-white/5 transition-colors duration-700">
        <Container className="text-center">
          <div className="max-w-3xl mx-auto mb-20">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-isl-gold mb-3">Resultados</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white font-normal">Excelencia Comprobada</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-white max-w-5xl mx-auto">
            <div className="p-6 transition-all duration-700 hover:-translate-y-2">
              <p className="font-serif text-5xl md:text-6xl text-isl-gold mb-4 font-light">+ UF 500k</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">En gestión y ventas exclusivas</p>
            </div>
            <div className="p-6 transition-all duration-700 hover:-translate-y-2 md:border-x border-white/5">
              <p className="font-serif text-5xl md:text-6xl text-isl-gold mb-4 font-light">100%</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Compromiso y asesoría directa</p>
            </div>
            <div className="p-6 transition-all duration-700 hover:-translate-y-2">
              <p className="font-serif text-5xl md:text-6xl text-isl-gold mb-4 font-light">V Región</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Operaciones estratégicas</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. BARRIOS */}
      <section className="relative py-32 bg-[#000000] text-white border-t border-white/5 transition-colors duration-700">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-isl-gold mb-3">Estilo de Vida</p>
            <h2 className="font-serif text-4xl md:text-5xl font-normal mb-6">Nuestros Barrios</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {barrios.slice(0, 4).map((b) => (
              <Link 
                key={b.id}
                href={`/barrios/${b.slug}`}
                className="group relative h-[450px] overflow-hidden rounded-sm flex items-end p-8 border border-white/10 transition-all duration-700 hover:border-isl-gold/50"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110 opacity-60 filter grayscale group-hover:grayscale-0"
                  style={{ backgroundImage: `url('${b.hero_image || "/images/hero-bg.jpg"}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-isl-black via-isl-black/50 to-transparent" />
                
                <div className="relative z-10 text-white">
                  <h3 className="font-serif text-2xl mb-2 group-hover:text-isl-gold transition-colors">{b.nombre}</h3>
                  <p className="text-xs text-white/70 uppercase tracking-widest flex items-center gap-1 group-hover:text-isl-gold transition-colors">
                    Explorar Zona <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. HISTORIA ISL (Estilo Oppenheim Group) */}
      <section className="py-32 bg-[#0a0a0a] text-white border-t border-white/5 transition-colors duration-700">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[600px] w-full grayscale hover:grayscale-0 transition-all duration-1000">
              <img 
                src="/images/isl-history.jpg" 
                alt="Historia de ISL Propiedades" 
                className="absolute inset-0 size-full object-cover rounded-sm shadow-2xl"
              />
              <div className="absolute inset-0 border border-white/10 m-4 rounded-sm pointer-events-none"></div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-isl-gold mb-4">Nuestra Esencia</p>
              <h2 className="font-serif text-4xl md:text-5xl font-normal mb-8 leading-tight">
                Redefiniendo el Lujo en la V Región
              </h2>
              <div className="space-y-6 text-white/70 font-light text-lg font-serif leading-relaxed">
                <p>
                  ISL Propiedades nació con una visión clara: elevar el estándar del corretaje inmobiliario en Viña del Mar y sus alrededores. Entendemos que una propiedad no es solo una transacción, es la consolidación de un patrimonio y el escenario de una vida.
                </p>
                <p>
                  A través de un enfoque boutique, discreción absoluta y una red de contactos exclusiva, conectamos propiedades extraordinarias con clientes que buscan lo excepcional. Nuestro compromiso es brindar una asesoría de clase mundial, respaldada por datos precisos y un servicio inigualable.
                </p>
              </div>
              <Link 
                href="/nosotros"
                className="inline-block mt-10 border-b border-isl-gold text-isl-gold pb-1 text-sm uppercase tracking-widest hover:text-white hover:border-white transition-colors duration-300"
              >
                Conoce al equipo →
              </Link>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}