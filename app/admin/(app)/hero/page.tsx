import { Suspense } from "react";
import { HeroSlidesListado } from "@/components/admin/HeroSlidesListado";
import { HeroSlideForm } from "@/components/admin/HeroSlideForm";
import { getAdminHeroSlides, getAdminPropiedades } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function HeroContent() {
  const [slides, propiedades] = await Promise.all([
    getAdminHeroSlides(),
    getAdminPropiedades(),
  ]);

  return (
    <HeroSlidesListado
      slides={slides}
      propiedades={propiedades}
    />
  );
}

export default function AdminHeroPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Hero</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Destacados de portada</h1>
      </div>

      <Suspense fallback={<div className="text-sm text-isl-black/70">Cargando destacados…</div>}>
        <HeroContent />
      </Suspense>
    </div>
  );
}