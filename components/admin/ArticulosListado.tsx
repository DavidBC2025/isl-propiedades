"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarArticulo } from "@/app/admin/(app)/guia/actions";
import { ArticuloForm } from "@/components/admin/ArticuloForm";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { EmptyState } from "@/components/isl/EmptyState";
import type { Articulo } from "@/types/isl";

type ArticulosListadoProps = {
  articulos: Articulo[];
};

export function ArticulosListado({ articulos }: ArticulosListadoProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [editingArticulo, setEditingArticulo] = useState<Articulo | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleEliminar(id: string, titulo: string) {
    const ok = window.confirm(`¿Quieres borrar "${titulo}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    startTransition(async () => {
      const result = await eliminarArticulo(id);
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo eliminar.");
        return;
      }
      setAviso("Listo, el artículo se eliminó.");
      router.refresh();
    });
  }

  function handleEdit(articulo: Articulo) {
    setEditingArticulo(articulo);
    setShowForm(true);
  }

  function handleNuevo() {
    setEditingArticulo(null);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingArticulo(null);
  }

  function handleDone() {
    setShowForm(false);
    setEditingArticulo(null);
    router.refresh();
  }

  if (showForm) {
    return (
      <div className="border border-isl-black/10 bg-isl-white p-6">
        <h2 className="mb-6 font-serif text-2xl text-isl-black">
          {editingArticulo ? "Editar artículo" : "Nuevo artículo"}
        </h2>
        <ArticuloForm
          articulo={editingArticulo}
          onCancel={handleCancel}
          onDone={handleDone}
        />
      </div>
    );
  }

  if (articulos.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Aún no hay artículos"
          description="Cuando crees el primero, va a aparecer acá. Puedes escribir sobre comprar, vender, invertir, tips para propiedades, o guías de barrios."
        />
        <ButtonISL onClick={handleNuevo}>+ Crear artículo</ButtonISL>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm">{aviso}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-isl-black/70">
          {articulos.length} {articulos.length === 1 ? "artículo" : "artículos"}
        </p>
        <ButtonISL onClick={handleNuevo}>+ Crear artículo</ButtonISL>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articulos.map((articulo) => (
          <li key={articulo.id} className="flex gap-4 border border-isl-black/10 bg-isl-white p-4">
            <div className="aspect-video w-20 flex-shrink-0 overflow-hidden rounded-sm bg-isl-offwhite">
              {articulo.imagen_destacada ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={articulo.imagen_destacada} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center font-serif text-lg text-isl-gold">ISL</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-sm px-2 py-1 text-[11px] font-medium uppercase ${articulo.estado === "publicado" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>
                  {articulo.estado === "publicado" ? "Publicado" : "Borrador"}
                </span>
                {articulo.es_reporte ? (
                  <span className="rounded-sm px-2 py-1 text-[11px] font-medium uppercase bg-isl-gold text-isl-black">
                    Reporte
                  </span>
                ) : null}
                {articulo.categoria ? (
                  <span className="text-xs text-isl-black/60 capitalize">{articulo.categoria}</span>
                ) : null}
              </div>
              <h3 className="mt-1 font-serif text-lg text-isl-black truncate">{articulo.titulo}</h3>
              {articulo.extracto ? <p className="text-sm text-isl-black/70 line-clamp-2">{articulo.extracto}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <ButtonISL variant="outline" size="sm" onClick={() => handleEdit(articulo)}>
                Editar
              </ButtonISL>
              <button
                type="button"
                className="min-h-9 rounded-sm border border-isl-black/20 px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-red-800 hover:bg-red-50"
                onClick={() => handleEliminar(articulo.id, articulo.titulo)}
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
