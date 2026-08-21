import type { Metadata } from "next";
import { Container } from "@/components/isl/Container";
import { SectionTitle } from "@/components/isl/SectionTitle";
import { LeadForm } from "@/components/isl/LeadForm";

export const metadata: Metadata = {
  title: "Tasación | ISL Propiedades",
  description: "Solicita una tasación profesional de tu propiedad en Viña del Mar. Un análisis real basado en el mercado local, no un promedio automático.",
};

export default function TasacionPage() {
  return (
    <main className="pb-24 pt-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">
            Valorización Real
          </p>
          <h1 className="mb-8 font-serif text-5xl font-normal leading-tight text-isl-black md:text-6xl">
            ¿Cuánto vale hoy tu propiedad?
          </h1>
          <div className="mx-auto max-w-2xl space-y-6 font-serif text-xl leading-relaxed text-isl-black/80 md:text-2xl">
            <p>
              Una tasación ISL no es un cálculo algorítmico. Partimos de conocer tu propiedad, el edificio, la calle y el momento exacto del mercado en Viña del Mar y sus alrededores.
            </p>
            <p>
              Entregamos un valor real basado en nuestra experiencia diaria en terreno, permitiéndote tomar decisiones informadas y seguras.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <section className="mx-auto mt-24 max-w-2xl border border-isl-black/5 bg-isl-offwhite p-8 md:p-12">
          <SectionTitle 
            title="Solicitar Tasación" 
            subtitle="ANÁLISIS PROFESIONAL"
            className="mb-12 text-center"
          />
          <LeadForm 
            tipo="tasacion" 
            submitLabel="Solicitar tasación"
            extraFields={
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-sm text-isl-black">Tipo de propiedad</span>
                  <select name="tipo_propiedad" className="min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base text-isl-black">
                    <option value="">Selecciona...</option>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="parcela">Parcela / Terreno</option>
                    <option value="oficina">Oficina / Local</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-isl-black">Comuna</span>
                  <input name="comuna" className="min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base text-isl-black" placeholder="Ej: Reñaca" />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-isl-black">Dormitorios</span>
                  <input name="dormitorios" type="number" className="min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base text-isl-black" />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-isl-black">Superficie (m²)</span>
                  <input name="m2" type="number" className="min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base text-isl-black" />
                </label>
              </div>
            }
          />
        </section>
      </Container>
    </main>
  );
}
