import { Suspense } from "react";
import { BarriosListado } from "@/components/admin/BarriosListado";
import { getAdminBarrios } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function BarriosContent() {
  const barrios = await getAdminBarrios();

  return <BarriosListado barrios={barrios} />;
}

export default function AdminBarriosPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Barrios</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Guía de barrios</h1>
      </div>

      <Suspense fallback={<div className="text-sm text-isl-black/70">Cargando barrios…</div>}>
        <BarriosContent />
      </Suspense>
    </div>
  );
}