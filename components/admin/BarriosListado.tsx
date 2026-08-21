"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarBarrio } from "@/app/admin/(app)/barrios/actions";
import { BarrioForm } from "@/components/admin/BarrioForm";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { EmptyState } from "@/components/isl/EmptyState";
import type { Barrio } from "@/types/isl";

type BarriosListadoProps = {
  barrios: Barrio[];
};

export function BarriosListado({ barrios }: BarriosListadoProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [editingBarrio, setEditingBarrio] = useState<Barrio | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleEliminar(id: string, nombre: string) {
    const ok = window.confirm(`¿Quieres borrar "${nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    startTransition(async () => {
      const result = await eliminarBarrio(id);
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo eliminar.");
        return;
      }
      setAviso("Listo, el barrio se eliminó.");
      router.refresh();
    });
  }

  function handleEdit(barrio: Barrio) {
    setEditingBarrio(barrio);
    setShowForm(true);
  }

  function handleNuevo() {
    setEditingBarrio(null);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingBarrio(null);
  }

  function handleDone() {
    setShowForm(false);
    setEditingBarrio(null);
    router.refresh();
  }

  if (showForm) {
    return (
      <div className="border border-isl-black/10 bg-isl-white p-6">
        <h2 className="mb-6 font-serif text-2xl text-isl-black">
          {editingBarrio ? "Editar barrio" : "Nuevo barrio"}
        </h2>
        <BarrioForm
          barrio={editingBarrio}
          onCancel={handleCancel}
          onDone={handleDone}
        />
      </div>
    );
  }

  if (barrios.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Aún no hay barrios"
          description="Cuando agregues el primero, va a aparecer acá. Puedes cargar los barrios donde trabajan: Viña del Mar, Reñaca, Recreo, Concón, Olmué, Quilpué, Peñablanca, Villa Alemana."
        />
        <ButtonISL onClick={handleNuevo}>+ Agregar barrio</ButtonISL>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm">{aviso}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-isl-black/70">
          {barrios.length} {barrios.length === 1 ? "barrio" : "barrios"}
        </p>
        <ButtonISL onClick={handleNuevo}>+ Agregar barrio</ButtonISL>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {barrios.map((barrio) => (
          <li key={barrio.id} className="flex gap-4 border border-isl-black/10 bg-isl-white p-4">
            <div className="aspect-video w-20 flex-shrink-0 overflow-hidden rounded-sm bg-isl-offwhite">
              {barrio.hero_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={barrio.hero_image} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center font-serif text-lg text-isl-gold">ISL</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-sm px-2 py-1 text-[11px] font-medium uppercase ${barrio.publicado ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>
                  {barrio.publicado ? "Publicado" : "Borrador"}
                </span>
              </div>
              <h3 className="mt-1 font-serif text-lg text-isl-black truncate">{barrio.nombre}</h3>
              {barrio.extracto ? <p className="text-sm text-isl-black/70 line-clamp-2">{barrio.extracto}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <ButtonISL variant="outline" size="sm" onClick={() => handleEdit(barrio)}>
                Editar
              </ButtonISL>
              <button
                type="button"
                className="min-h-9 rounded-sm border border-isl-black/20 px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-red-800 hover:bg-red-50"
                onClick={() => handleEliminar(barrio.id, barrio.nombre)}
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