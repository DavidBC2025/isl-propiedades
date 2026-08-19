import { Suspense } from "react";
import { PropiedadesListado } from "@/components/admin/PropiedadesListado";
import { getAdminPropiedades } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const { aviso } = await searchParams;
  const propiedades = await getAdminPropiedades();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Propiedades</p>
          <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Tu cartera</h1>
        </div>
      </div>

      <Suspense fallback={<div className="text-sm text-isl-black/70">Cargando propiedades…</div>}>
        <PropiedadesListado propiedades={propiedades} avisoInicial={aviso} />
      </Suspense>
    </div>
  );
}