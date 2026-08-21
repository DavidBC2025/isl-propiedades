"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstadoLead } from "@/app/admin/(app)/leads/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { ESTADO_CONSULTA, TIPO_CONSULTA } from "@/lib/admin-copy";
import { EmptyState } from "@/components/isl/EmptyState";
import type { Lead } from "@/types/isl";

type AdminLeadsClientProps = {
  leads: Lead[];
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function NotificadoBadge({ lead }: { lead: Lead }) {
  if (lead.notificado) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700" title={lead.notificado_en ? `Enviado el ${formatDate(lead.notificado_en)}` : "Enviado"}>
        <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        Enviado
      </span>
    );
  }
  return <span className="text-xs text-isl-black/50">No enviado</span>;
}

function EstadoSelect({ lead, onCambiar }: { lead: Lead; onCambiar: (id: string, estado: "nuevo" | "contactado" | "cerrado") => void }) {
  return (
    <select
      value={lead.estado ?? "nuevo"}
      onChange={(e) => onCambiar(lead.id, e.target.value as "nuevo" | "contactado" | "cerrado")}
      className={`rounded-sm border px-2 py-1 text-xs font-medium ${
        lead.estado === "nuevo"
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : lead.estado === "contactado"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-zinc-200 bg-zinc-50 text-zinc-700"
      }`}
    >
      <option value="nuevo">Nueva</option>
      <option value="contactado">Ya hablamos</option>
      <option value="cerrado">Cerrada</option>
    </select>
  );
}

function WhatsAppButton({ lead }: { lead: Lead }) {
  const tipoLabel = lead.tipo ? TIPO_CONSULTA[lead.tipo] ?? "consulta" : "consulta";
  const message = lead.telefono
    ? `Hola ${lead.nombre}, te escribimos de ISL Propiedades por tu ${tipoLabel.toLowerCase()}.`
    : `Hola, llegó una ${tipoLabel.toLowerCase()} de ${lead.nombre} en ISL Propiedades.`;

  const phone = lead.telefono || "";
  if (!phone) return null;

  const href = buildWhatsAppLink(phone, message);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-9 items-center rounded-sm bg-emerald-600 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-white hover:bg-emerald-700"
    >
      WhatsApp
    </a>
  );
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const propiedadLink = (lead as any).propiedad?.slug ? `/propiedades/${(lead as any).propiedad.slug}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-12">
      <div className="mx-4 w-full max-w-lg rounded-sm bg-isl-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl text-isl-black">{lead.nombre}</h2>
          <button type="button" onClick={onClose} className="min-h-9 min-w-9 text-isl-black/60 hover:text-isl-black" aria-label="Cerrar">✕</button>
        </div>

        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between border-b border-isl-black/10 pb-2">
            <dt className="text-isl-gray">Tipo</dt>
            <dd>{TIPO_CONSULTA[lead.tipo ?? ""] ?? "Consulta"}</dd>
          </div>
          <div className="flex justify-between border-b border-isl-black/10 pb-2">
            <dt className="text-isl-gray">Estado</dt>
            <dd>{ESTADO_CONSULTA[lead.estado ?? ""] ?? "Nueva"}</dd>
          </div>
          {lead.email ? (
            <div className="flex justify-between border-b border-isl-black/10 pb-2">
              <dt className="text-isl-gray">Correo</dt>
              <dd><a href={`mailto:${lead.email}`} className="underline">{lead.email}</a></dd>
            </div>
          ) : null}
          {lead.telefono ? (
            <div className="flex justify-between border-b border-isl-black/10 pb-2">
              <dt className="text-isl-gray">Teléfono</dt>
              <dd>{lead.telefono}</dd>
            </div>
          ) : null}
          {lead.comuna ? (
            <div className="flex justify-between border-b border-isl-black/10 pb-2">
              <dt className="text-isl-gray">Comuna</dt>
              <dd>{lead.comuna}</dd>
            </div>
          ) : null}
          {lead.tipo_propiedad ? (
            <div className="flex justify-between border-b border-isl-black/10 pb-2">
              <dt className="text-isl-gray">Tipo propiedad</dt>
              <dd>{lead.tipo_propiedad}</dd>
            </div>
          ) : null}
          {lead.m2 ? (
            <div className="flex justify-between border-b border-isl-black/10 pb-2">
              <dt className="text-isl-gray">m²</dt>
              <dd>{lead.m2}</dd>
            </div>
          ) : null}
          {lead.dormitorios ? (
            <div className="flex justify-between border-b border-isl-black/10 pb-2">
              <dt className="text-isl-gray">Dormitorios</dt>
              <dd>{lead.dormitorios}</dd>
            </div>
          ) : null}
          {propiedadLink ? (
            <div className="flex justify-between border-b border-isl-black/10 pb-2">
              <dt className="text-isl-gray">Propiedad</dt>
              <dd><a href={propiedadLink} target="_blank" rel="noreferrer" className="underline">Ver ficha</a></dd>
            </div>
          ) : null}
          {lead.origen_url ? (
            <div className="flex justify-between border-b border-isl-black/10 pb-2">
              <dt className="text-isl-gray">Origen</dt>
              <dd className="truncate max-w-[250px] text-right">{lead.origen_url}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-b border-isl-black/10 pb-2">
            <dt className="text-isl-gray">Notificado</dt>
            <dd><NotificadoBadge lead={lead} /></dd>
          </div>
          <div className="flex justify-between border-b border-isl-black/10 pb-2">
            <dt className="text-isl-gray">Recibido</dt>
            <dd>{formatDate(lead.created_at)}</dd>
          </div>
        </dl>

        {lead.mensaje ? (
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">Mensaje</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-isl-black">{lead.mensaje}</p>
          </div>
        ) : null}

        <div className="mt-6 flex gap-3">
          <WhatsAppButton lead={lead} />
          <button type="button" onClick={onClose} className="min-h-9 rounded-sm border border-isl-black/20 px-4 text-xs font-medium uppercase tracking-[0.12em]">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminLeadsClient({ leads }: AdminLeadsClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const tipos = [...new Set(leads.map((l) => l.tipo).filter(Boolean))] as string[];
  const estados = [...new Set(leads.map((l) => l.estado).filter(Boolean))] as string[];

  const filtrados = leads.filter((lead) => {
    if (filtroTipo && lead.tipo !== filtroTipo) return false;
    if (filtroEstado && lead.estado !== filtroEstado) return false;
    return true;
  });

  function handleCambiarEstado(id: string, estado: "nuevo" | "contactado" | "cerrado") {
    startTransition(async () => {
      const result = await cambiarEstadoLead(id, estado);
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo cambiar el estado.");
        return;
      }
      setAviso("Estado actualizado.");
      router.refresh();
    });
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        title="Todavía no llegan consultas"
        description="Cuando alguien complete un formulario en el sitio, lo vas a ver acá. No se pierde: también te llega un correo si está configurado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-isl-gold/30 bg-isl-champagne/30 px-4 py-3 text-sm text-isl-black">
        Cuando llega una consulta nueva, reciben un correo al instante con un botón para responder por WhatsApp en un clic.
      </div>

      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm">{aviso}</p> : null}

      <div className="flex flex-wrap gap-3">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-sm"
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>{TIPO_CONSULTA[t] ?? t}</option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-sm"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {estados.map((e) => (
            <option key={e} value={e}>{ESTADO_CONSULTA[e] ?? e}</option>
          ))}
        </select>
        <p className="self-center text-sm text-isl-black/70">
          {filtrados.length} de {leads.length} {leads.length === 1 ? "consulta" : "consultas"}
        </p>
      </div>

      <div className="overflow-x-auto border border-isl-black/10 bg-isl-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-isl-black/10 text-xs uppercase tracking-widest text-isl-gray">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Notificado</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((lead) => (
              <tr key={lead.id} className="border-t border-isl-black/10 align-top hover:bg-isl-offwhite/50">
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(lead)}
                    className="font-medium text-isl-black underline-offset-2 hover:underline text-left"
                  >
                    {lead.nombre}
                  </button>
                  {lead.mensaje ? <p className="mt-1 max-w-xs truncate text-isl-black/65">{lead.mensaje}</p> : null}
                </td>
                <td className="px-4 py-4 text-isl-black/80">{TIPO_CONSULTA[lead.tipo ?? ""] ?? "Consulta"}</td>
                <td className="px-4 py-4">
                  <EstadoSelect lead={lead} onCambiar={handleCambiarEstado} />
                </td>
                <td className="px-4 py-4">
                  <NotificadoBadge lead={lead} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-isl-black/70">{formatDate(lead.created_at)}</td>
                <td className="px-4 py-4 text-isl-black/70">
                  <div className="flex flex-col gap-1">
                    {lead.email ? <span className="text-xs">{lead.email}</span> : null}
                    {lead.telefono ? <span className="text-xs">{lead.telefono}</span> : null}
                    {!lead.email && !lead.telefono ? <span className="text-xs text-isl-black/40">—</span> : null}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <WhatsAppButton lead={lead} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLead ? (
        <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
      ) : null}
    </div>
  );
}