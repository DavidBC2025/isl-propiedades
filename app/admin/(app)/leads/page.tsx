import { Suspense } from "react";
import { getAdminLeads } from "@/lib/admin";
import { AdminLeadsClient } from "@/components/admin/AdminLeadsClient";

export const dynamic = "force-dynamic";

async function LeadsContent() {
  const leads = await getAdminLeads();
  return <AdminLeadsClient leads={leads} />;
}

export default function AdminLeadsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Consultas</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Quienes escribieron</h1>
      </header>

      <Suspense fallback={<div className="text-sm text-isl-black/70">Cargando consultas…</div>}>
        <LeadsContent />
      </Suspense>
    </div>
  );
}