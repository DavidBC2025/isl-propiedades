import { ButtonISL } from "@/components/isl/ButtonISL";
import { Container } from "@/components/isl/Container";
import { SiteFooter } from "@/components/isl/SiteFooter";
import { SiteHeader } from "@/components/isl/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">ISL Propiedades</p>
          <h1 className="mt-4 font-serif text-4xl font-normal text-isl-black">Esta página no está</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-isl-black/70">
            El enlace puede estar mal escrito o la página todavía no existe. Te llevamos de vuelta al inicio.
          </p>
          <div className="mt-8">
            <ButtonISL href="/">Volver al inicio</ButtonISL>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
