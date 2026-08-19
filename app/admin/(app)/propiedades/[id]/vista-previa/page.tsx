import Link from "next/link";
import { notFound } from "next/navigation";
import { FichaPropiedadDetalle } from "@/components/isl/FichaPropiedadDetalle";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { getAdminPropiedadById } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function VistaPreviaPropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propiedad = await getAdminPropiedadById(id);

  if (!propiedad) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-isl-black/10 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Vista previa</p>
          <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">{propiedad.titulo}</h1>
        </div>
        <ButtonISL href={`/admin/propiedades/${id}/editar`} variant="outline">
          Volver a editar
        </ButtonISL>
      </div>

      <div className="border border-isl-gold/30 bg-isl-champagne/30 px-4 py-3 text-sm text-isl-black">
        Estás viendo una vista previa — así se va a ver esta propiedad
      </div>

      <div className="mx-auto max-w-5xl">
        <FichaPropiedadDetalle propiedad={propiedad} agente={propiedad.agente ?? null} />
      </div>
    </div>
  );
}