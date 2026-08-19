import { ButtonISL } from "@/components/isl/ButtonISL";
import { EmptyState } from "@/components/isl/EmptyState";
import { PriceTag } from "@/components/isl/PriceTag";
import { getAdminPropiedades } from "@/lib/admin";
import { ESTADO_PROPIEDAD } from "@/lib/admin-copy";
import { formatComuna } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPropiedadesPage() {
  const propiedades = await getAdminPropiedades();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Propiedades</p>
          <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Tu cartera</h1>
        </div>
        <ButtonISL href="/admin/propiedades/nueva">+ Nueva propiedad</ButtonISL>
      </div>

      {propiedades.length === 0 ? (
        <EmptyState
          title="Todavía no hay propiedades"
          description="Cuando cargues la primera, va a aparecer acá. Puedes dejarla en borrador hasta tener las fotos listas."
          ctaLabel="Cargar la primera"
          ctaHref="/admin/propiedades/nueva"
        />
      ) : (
        <div className="overflow-x-auto border border-isl-black/10 bg-isl-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-isl-black/10 text-xs uppercase tracking-widest text-isl-gray">
                <th className="px-4 py-3 font-medium">Propiedad</th>
                <th className="px-4 py-3 font-medium">Comuna</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Precio</th>
              </tr>
            </thead>
            <tbody>
              {propiedades.map((propiedad) => (
                <tr key={propiedad.id} className="border-t border-isl-black/10">
                  <td className="px-4 py-4 font-medium text-isl-black">{propiedad.titulo}</td>
                  <td className="px-4 py-4 text-isl-black/70">{formatComuna(propiedad.comuna)}</td>
                  <td className="px-4 py-4">{ESTADO_PROPIEDAD[propiedad.estado ?? ""] ?? "Sin estado"}</td>
                  <td className="px-4 py-4"><PriceTag value={propiedad.precio_uf} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
