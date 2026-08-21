import { Suspense } from "react";
import { ArticulosListado } from "@/components/admin/ArticulosListado";
import { getAdminArticulos } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function ArticulosContent() {
  const articulos = await getAdminArticulos();

  return <ArticulosListado articulos={articulos} />;
}

export default function AdminGuiaPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Guía</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Artículos</h1>
      </div>

      <Suspense fallback={<div className="text-sm text-isl-black/70">Cargando artículos…</div>}>
        <ArticulosContent />
      </Suspense>
    </div>
  );
}
