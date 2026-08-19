"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarAgente } from "@/app/admin/(app)/agentes/actions";
import { AgenteForm } from "@/components/admin/AgenteForm";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { EmptyState } from "@/components/isl/EmptyState";
import type { Agente } from "@/types/isl";

type AgentesListadoProps = {
  agentes: Agente[];
};

export function AgentesListado({ agentes }: AgentesListadoProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [editingAgente, setEditingAgente] = useState<Agente | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleEliminar(id: string, nombre: string) {
    const ok = window.confirm(`¿Quieres borrar a "${nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    startTransition(async () => {
      const result = await eliminarAgente(id);
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo eliminar.");
        return;
      }
      setAviso("Listo, el agente se eliminó.");
      router.refresh();
    });
  }

  function handleEdit(agente: Agente) {
    setEditingAgente(agente);
    setShowForm(true);
  }

  function handleNuevo() {
    setEditingAgente(null);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingAgente(null);
  }

  function handleDone() {
    setShowForm(false);
    setEditingAgente(null);
    router.refresh();
  }

  if (showForm) {
    return (
      <div className="border border-isl-black/10 bg-isl-white p-6">
        <h2 className="mb-6 font-serif text-2xl text-isl-black">
          {editingAgente ? "Editar agente" : "Nuevo agente"}
        </h2>
        <AgenteForm
          agente={editingAgente}
          onCancel={handleCancel}
          onDone={handleDone}
        />
      </div>
    );
  }

  if (agentes.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Aún no hay agentes"
          description="Cuando agregues el primero, va a aparecer acá. Puedes cargar a Silvia e Ivannia, o agregar más agentes si el equipo crece."
        />
        <ButtonISL onClick={handleNuevo}>+ Agregar agente</ButtonISL>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm">{aviso}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-isl-black/70">
          {agentes.length} {agentes.length === 1 ? "agente" : "agentes"}
        </p>
        <ButtonISL onClick={handleNuevo}>+ Agregar agente</ButtonISL>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agentes.map((agente) => (
          <li key={agente.id} className="flex gap-4 border border-isl-black/10 bg-isl-white p-4">
            <div className="aspect-square w-16 flex-shrink-0 overflow-hidden rounded-sm bg-isl-offwhite">
              {agente.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agente.foto_url} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center font-serif text-xl text-isl-gold">ISL</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-sm px-2 py-1 text-[11px] font-medium uppercase ${agente.activo ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>
                  {agente.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <h3 className="mt-1 font-serif text-lg text-isl-black truncate">
                {[agente.nombre, agente.apellido].filter(Boolean).join(" ")}
              </h3>
              {agente.rol ? <p className="text-sm text-isl-black/70 truncate">{agente.rol}</p> : null}
              {agente.especialidad ? <p className="text-xs text-isl-black/60 truncate">{agente.especialidad}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <ButtonISL variant="outline" size="sm" onClick={() => handleEdit(agente)}>
                Editar
              </ButtonISL>
              <button
                type="button"
                className="min-h-9 rounded-sm border border-isl-black/20 px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-red-800 hover:bg-red-50"
                onClick={() => handleEliminar(agente.id, [agente.nombre, agente.apellido].filter(Boolean).join(" "))}
                disabled={pending}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}