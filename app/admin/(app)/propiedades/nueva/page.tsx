import { PropiedadForm } from "@/components/admin/PropiedadForm";
import { getAdminAgentes } from "@/lib/admin";
import { getAdminUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NuevaPropiedadPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const { aviso } = await searchParams;
  const agentes = await getAdminAgentes();
  const user = await getAdminUser();
  const defaultAgenteId = user?.user_metadata?.agente_id as string | null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Propiedades</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Nueva propiedad</h1>
      </div>

      <PropiedadForm
        mode="nueva"
        agentes={agentes}
        defaultAgenteId={defaultAgenteId}
        avisoInicial={aviso}
      />
    </div>
  );
}