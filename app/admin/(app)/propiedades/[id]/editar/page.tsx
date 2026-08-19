import { notFound } from "next/navigation";
import { PropiedadForm } from "@/components/admin/PropiedadForm";
import { getAdminAgentes, getAdminPropiedadById } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function EditarPropiedadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
}) {
  const { id } = await params;
  const { aviso } = await searchParams;
  const [propiedad, agentes] = await Promise.all([
    getAdminPropiedadById(id),
    getAdminAgentes(),
  ]);

  if (!propiedad) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Propiedades</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Editar propiedad</h1>
      </div>

      <PropiedadForm
        mode="editar"
        propiedad={propiedad}
        agentes={agentes}
        avisoInicial={aviso}
      />
    </div>
  );
}