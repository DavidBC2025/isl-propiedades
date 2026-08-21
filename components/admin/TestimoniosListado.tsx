"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarTestimonio } from "@/app/admin/(app)/testimonios/actions";
import { TestimonioForm } from "@/components/admin/TestimonioForm";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { EmptyState } from "@/components/isl/EmptyState";
import type { Testimonio } from "@/types/isl";

type TestimoniosListadoProps = {
  testimonios: Testimonio[];
  propiedades: any[];
};

export function TestimoniosListado({ testimonios, propiedades }: TestimoniosListadoProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [editingTestimonio, setEditingTestimonio] = useState<Testimonio | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleEliminar(id: string, nombre: string) {
    const ok = window.confirm(`¿Quieres borrar el testimonio de "${nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    startTransition(async () => {
      const result = await eliminarTestimonio(id);
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo eliminar.");
        return;
      }
      setAviso("Listo, el testimonio se eliminó.");
      router.refresh();
    });
  }

  function handleEdit(testimonio: Testimonio) {
    setEditingTestimonio(testimonio);
    setShowForm(true);
  }

  function handleNuevo() {
    setEditingTestimonio(null);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingTestimonio(null);
  }

  function handleDone() {
    setShowForm(false);
    setEditingTestimonio(null);
    router.refresh();
  }

  if (showForm) {
    return (
      <div className="border border-isl-black/10 bg-isl-white p-6">
        <h2 className="mb-6 font-serif text-2xl text-isl-black">
          {editingTestimonio ? "Editar testimonio" : "Nuevo testimonio"}
        </h2>
        <TestimonioForm
          testimonio={editingTestimonio}
          propiedades={propiedades}
          onCancel={handleCancel}
          onDone={handleDone}
        />
      </div>
    );
  }

  if (testimonios.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Aún no hay testimonios"
          description="Cuando agregues el primero, va a aparecer acá. Puedes cargar testimonios de clientes satisfechos que hayan trabajado con Silvia e Ivannia."
        />
        <ButtonISL onClick={handleNuevo}>+ Agregar testimonio</ButtonISL>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm">{aviso}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-isl-black/70">
          {testimonios.length} {testimonios.length === 1 ? "testimonio" : "testimonios"}
        </p>
        <ButtonISL onClick={handleNuevo}>+ Agregar testimonio</ButtonISL>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonios.map((testimonio) => (
          <li key={testimonio.id} className="flex gap-4 border border-isl-black/10 bg-isl-white p-4">
            <div className="aspect-square w-16 flex-shrink-0 overflow-hidden rounded-sm bg-isl-offwhite">
              {testimonio.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={testimonio.foto_url} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center font-serif text-xl text-isl-gold">ISL</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-sm px-2 py-1 text-[11px] font-medium uppercase ${testimonio.publicado ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>
                  {testimonio.publicado ? "Publicado" : "Borrador"}
                </span>
                {testimonio.destacado ? (
                  <span className="rounded-sm px-2 py-1 text-[11px] font-medium uppercase bg-isl-gold text-isl-black">
                    Destacado
                  </span>
                ) : null}
              </div>
              <h3 className="mt-1 font-serif text-lg text-isl-black truncate">{testimonio.nombre}</h3>
              {testimonio.rol_ciudad ? <p className="text-sm text-isl-black/70 truncate">{testimonio.rol_ciudad}</p> : null}
              {testimonio.texto ? <p className="text-sm text-isl-black/60 line-clamp-2 mt-1">{testimonio.texto}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <ButtonISL variant="outline" size="sm" onClick={() => handleEdit(testimonio)}>
                Editar
              </ButtonISL>
              <button
                type="button"
                className="min-h-9 rounded-sm border border-isl-black/20 px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-red-800 hover:bg-red-50"
                onClick={() => handleEliminar(testimonio.id, testimonio.nombre)}
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
