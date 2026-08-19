import { ButtonISL } from "@/components/isl/ButtonISL";
import { Container } from "@/components/isl/Container";
import { SiteFooter } from "@/components/isl/SiteFooter";
import { SiteHeader } from "@/components/isl/SiteHeader";

export default function PropiedadNoEncontrada() {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">ISL Propiedades</p>
          <h1 className="mt-4 max-w-xl font-serif text-4xl font-normal text-isl-black md:text-5xl">No encontramos esta propiedad</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-isl-black/70">
            Puede que ya no esté publicada o que el enlace esté incompleto. Mira el catálogo: ahí están las que Silvia e Ivannia tienen activas.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonISL href="/propiedades">Ver propiedades</ButtonISL>
            <ButtonISL href="/" variant="outline">Volver al inicio</ButtonISL>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
