import { Suspense } from "react";
import { AgentesListado } from "@/components/admin/AgentesListado";
import { getAdminAgentes } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function AgentesContent() {
  const agentes = await getAdminAgentes();

  return <AgentesListado agentes={agentes} />;
}

export default function AdminAgentesPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Agentes</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">El equipo</h1>
      </div>

      <Suspense fallback={<div className="text-sm text-isl-black/70">Cargando agentes…</div>}>
        <AgentesContent />
      </Suspense>
    </div>
  );
}