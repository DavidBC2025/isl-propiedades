import { ButtonISL } from "@/components/isl/ButtonISL";
import { PrimerosPasosCard } from "@/components/admin/PrimerosPasosCard";
import { getAdminResumen } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPanelPage() {
  const resumen = await getAdminResumen();
  const pendiente = resumen.consultasNuevas > 0
    ? resumen.consultasNuevas === 1
      ? "Tienes 1 consulta sin responder."
      : `Tienes ${resumen.consultasNuevas} consultas sin responder.`
    : resumen.borradores > 0
      ? resumen.borradores === 1
        ? "Tienes 1 propiedad en borrador lista para revisar."
        : `Tienes ${resumen.borradores} propiedades en borrador.`
      : resumen.publicadas === 0
        ? "Todavía no hay propiedades publicadas. Ese puede ser el primer paso."
        : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Panel</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Cómo va el sitio hoy</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="border border-isl-black/10 bg-isl-white p-5">
          <p className="text-xs uppercase tracking-widest text-isl-gray">Publicadas</p>
          <p className="mt-2 font-serif text-4xl text-isl-black">{resumen.publicadas}</p>
        </article>
        <article className="border border-isl-black/10 bg-isl-white p-5">
          <p className="text-xs uppercase tracking-widest text-isl-gray">En borrador</p>
          <p className="mt-2 font-serif text-4xl text-isl-black">{resumen.borradores}</p>
        </article>
        <article className="border border-isl-black/10 bg-isl-white p-5">
          <p className="text-xs uppercase tracking-widest text-isl-gray">Consultas nuevas</p>
          <p className="mt-2 font-serif text-4xl text-isl-black">{resumen.consultasNuevas}</p>
        </article>
      </div>

      {pendiente ? (
        <p className="border border-isl-gold/40 bg-isl-champagne/40 px-5 py-4 text-sm text-isl-black">{pendiente}</p>
      ) : null}

      <PrimerosPasosCard pasos={resumen.pasos} />

      <div className="flex flex-wrap gap-3">
        <ButtonISL href="/admin/propiedades/nueva">+ Nueva propiedad</ButtonISL>
        <ButtonISL href="/admin/leads" variant="outline">Ver consultas nuevas</ButtonISL>
      </div>
    </div>
  );
}
