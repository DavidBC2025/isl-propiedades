import { Suspense } from "react";
import { getAdminSettings, getAdminPropiedades, getAdminCasosPreparacion } from "@/lib/admin";
import { AjustesForm } from "@/components/admin/AjustesForm";

export const dynamic = "force-dynamic";

async function AjustesContent() {
  const [settings, propiedades, casos] = await Promise.all([
    getAdminSettings(),
    getAdminPropiedades(),
    getAdminCasosPreparacion(),
  ]);
  return <AjustesForm settings={settings ?? null} propiedades={propiedades} casos={casos} />;
}

export default function AdminAjustesPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Ajustes</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Configuración del sitio</h1>
        <p className="mt-2 text-isl-black/70">Cada sección se guarda de forma independiente. No hay que hacer todo de una vez.</p>
      </div>

      <Suspense fallback={<div className="text-sm text-isl-black/70">Cargando ajustes…</div>}>
        <AjustesContent />
      </Suspense>
    </div>
  );
}
