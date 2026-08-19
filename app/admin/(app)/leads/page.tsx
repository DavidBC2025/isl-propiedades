import { EmptyState } from "@/components/isl/EmptyState";
import { getAdminLeads } from "@/lib/admin";
import { ESTADO_CONSULTA, TIPO_CONSULTA } from "@/lib/admin-copy";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Consultas</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-isl-black">Quienes escribieron</h1>
      </header>

      {leads.length === 0 ? (
        <EmptyState
          title="Todavía no llegan consultas"
          description="Cuando alguien complete un formulario en el sitio, lo vas a ver acá. No se pierde: también te llega un correo si está configurado."
        />
      ) : (
        <div className="overflow-x-auto border border-isl-black/10 bg-isl-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-isl-black/10 text-xs uppercase tracking-widest text-isl-gray">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-isl-black/10 align-top">
                  <td className="px-4 py-4">
                    <p className="font-medium text-isl-black">{lead.nombre}</p>
                    {lead.mensaje ? <p className="mt-1 max-w-sm text-isl-black/65">{lead.mensaje}</p> : null}
                  </td>
                  <td className="px-4 py-4">{TIPO_CONSULTA[lead.tipo ?? ""] ?? "Consulta"}</td>
                  <td className="px-4 py-4">{ESTADO_CONSULTA[lead.estado ?? ""] ?? "Nueva"}</td>
                  <td className="px-4 py-4 text-isl-black/70">{formatDate(lead.created_at)}</td>
                  <td className="px-4 py-4 text-isl-black/70">
                    {[lead.email, lead.telefono].filter(Boolean).join(" · ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
