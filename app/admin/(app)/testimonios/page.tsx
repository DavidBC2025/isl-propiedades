import { Suspense } from "react";
import { TestimoniosListado } from "@/components/admin/TestimoniosListado";
import { getAdminTestimonios, getAdminPropiedades } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function TestimoniosContent() {
  const [testimonios, propiedades] = await Promise.all([
    getAdminTestimonios(),
    getAdminPropiedades(),
  ]);

  return <TestimoniosListado testimonios={testimonios} propiedades={propiedades} />;
}

export default function AdminTestimoniosPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Testimonios</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Testimonios de clientes</h1>
      </div>

      <Suspense fallback={<div className="text-sm text-isl-black/70">Cargando testimonios…</div>}>
        <TestimoniosContent />
      </Suspense>
    </div>
  );
}
