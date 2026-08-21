import type { Metadata } from "next";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { LeadForm } from "@/components/isl/LeadForm";
import { getCasosPreparacionPublicados } from "@/lib/casos-preparacion";
import { GaleriaAntesDespues } from "@/components/isl/GaleriaAntesDespues";

export const metadata: Metadata = {
  title: "Vende tu propiedad | ISL Propiedades",
  description: "Descubre cómo preparamos y vendemos tu propiedad en Viña del Mar. Fotografía profesional, preparación editorial y comunicación directa.",
};

export default async function VenderPage() {
  const casos = await getCasosPreparacionPublicados();
  // Mostramos máximo 3 casos para no sobrecargar
  const casosVisibles = casos.slice(0, 3);

  const beneficios = [
    {
      titulo: "Fotografía y Video Profesional",
      texto: "No sacamos fotos con el celular. Utilizamos equipo profesional para capturar la amplitud y luz natural de cada espacio.",
    },
    {
      titulo: "Publicación Estratégica",
      texto: "Tu propiedad estará en los portales más importantes, pero también en nuestra red de contactos y redes sociales con contenido curado.",
    },
    {
      titulo: "Acompañamiento Real",
      texto: "Estamos presentes en cada visita. Filtramos a los interesados y te mantenemos al tanto de cada paso del proceso.",
    },
    {
      titulo: "Comunicación Directa",
      texto: "Tratas directamente con nosotras. Sin intermediarios ni procesos burocráticos que dilaten la venta.",
    },
  ];

  return (
    <main className="pb-24 pt-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">
            Vende con Nosotros
          </p>
          <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl">
            Tu propiedad merece una mirada experta.
          </h1>
          <p className="font-serif text-xl leading-relaxed text-isl-black/80 md:text-2xl">
            En ISL no solo enlistamos propiedades; las preparamos para que se vendan rápido y al mejor precio posible. Combinamos marketing digital de alto nivel con un trato personalizado.
          </p>
        </div>

        {/* Qué incluye */}
        <section className="my-24 grid gap-12 md:grid-cols-2">
          {beneficios.map((item, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-serif text-2xl font-normal text-isl-black">
                {item.titulo}
              </h3>
              <p className="text-sm leading-relaxed text-isl-black/70">
                {item.texto}
              </p>
            </div>
          ))}
        </section>

        {/* Deja tu casa lista */}
        <section className="my-24 rounded-sm border border-isl-black/5 bg-isl-offwhite p-8 md:p-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center font-serif text-4xl font-normal text-isl-black">
              Deja tu casa lista
            </h2>
            <div className="mb-12 space-y-6 text-center text-isl-black/80">
              <p>
                La primera impresión es definitiva. Un espacio ordenado, con la luz correcta y pequeños detalles resueltos, puede marcar la diferencia entre una visita más y una oferta concreta.
              </p>
              <p>
                Nos encargamos de asesorarte en la preparación de tu propiedad, desde la limpieza del salitre típico de nuestra zona costera hasta la optimización de los espacios interiores.
              </p>
            </div>

            {casosVisibles.length > 0 && (
              <GaleriaAntesDespues casos={casosVisibles} />
            )}
          </div>
        </section>

        {/* Formulario */}
        <section className="mx-auto max-w-2xl py-12">
          <SectionTitle 
            title="Conversemos" 
            subtitle="CUÉNTANOS SOBRE TU PROPIEDAD"
            className="mb-12 text-center"
          />
          <LeadForm 
            tipo="vender" 
            submitLabel="Solicitar contacto para vender"
          />
        </section>
      </Container>
    </main>
  );
}
