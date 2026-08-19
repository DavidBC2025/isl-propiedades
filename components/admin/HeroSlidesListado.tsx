"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarHeroSlide, reordenarHeroSlides } from "@/app/admin/(app)/hero/actions";
import { HeroSlideForm } from "@/components/admin/HeroSlideForm";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { EmptyState } from "@/components/isl/EmptyState";
import type { HeroSlide, Propiedad } from "@/types/isl";

type HeroSlidesListadoProps = {
  slides: HeroSlide[];
  propiedades: Propiedad[];
};

export function HeroSlidesListado({ slides, propiedades }: HeroSlidesListadoProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [ordenando, setOrdenando] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [showForm, setShowForm] = useState(false);

  const activosCount = slides.filter((s) => s.activo).length;

  function handleEliminar(id: string, titulo: string) {
    const ok = window.confirm(`¿Quieres borrar "${titulo}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    startTransition(async () => {
      const result = await eliminarHeroSlide(id);
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo eliminar.");
        return;
      }
      setAviso("Listo, el destacado se eliminó.");
      router.refresh();
    });
  }

  function handleDragStart(id: string) {
    setDraggedId(id);
    setOrdenando(true);
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setOrdenando(false);
      return;
    }

    const fromIndex = slides.findIndex((s) => s.id === draggedId);
    const toIndex = slides.findIndex((s) => s.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      setOrdenando(false);
      return;
    }

    const newOrder = [...slides];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    const newIds = newOrder.map((s) => s.id);

    startTransition(async () => {
      const result = await reordenarHeroSlides(newIds);
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo reordenar.");
      } else {
        setAviso("Listo, el orden se actualizó.");
        router.refresh();
      }
      setDraggedId(null);
      setOrdenando(false);
    });
  }

  function handleEdit(slide: HeroSlide) {
    setEditingSlide(slide);
    setShowForm(true);
  }

  function handleNuevo() {
    setEditingSlide(null);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingSlide(null);
  }

  function handleDone() {
    setShowForm(false);
    setEditingSlide(null);
    router.refresh();
  }

  if (showForm) {
    return (
      <div className="border border-isl-black/10 bg-isl-white p-6">
        <h2 className="mb-6 font-serif text-2xl text-isl-black">
          {editingSlide ? "Editar destacado" : "Nuevo destacado"}
        </h2>
        <HeroSlideForm
          slide={editingSlide}
          propiedades={propiedades}
          onCancel={handleCancel}
          onDone={handleDone}
        />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Aún no hay destacados"
          description="Cuando crees el primero, va a aparecer acá. Puedes elegir una propiedad y destacarla, o crear uno desde cero."
        />
        <ButtonISL onClick={handleNuevo}>+ Crear destacado</ButtonISL>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm">{aviso}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-isl-black/70">
          {activosCount}/5 destacados activos
        </p>
        <ButtonISL onClick={handleNuevo}>+ Crear destacado</ButtonISL>
      </div>

      <ul className="space-y-4">
        {slides.map((slide, index) => (
          <li
            key={slide.id}
            draggable={ordenando}
            onDragStart={() => handleDragStart(slide.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(slide.id)}
            className={`flex gap-4 border border-isl-black/10 bg-isl-white p-4 ${ordenando ? "cursor-move" : ""}`}
          >
            <div className="flex flex-col items-center justify-center gap-1 text-isl-gray">
              <span className="text-xs font-medium">{index + 1}</span>
              <button
                type="button"
                onClick={() => setOrdenando(!ordenando)}
                className="text-xs underline-offset-4 hover:underline"
                title={ordenando ? "Terminar de reordenar" : "Reordenar"}
              >
                {ordenando ? "✓" : "↕"}
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-sm px-2 py-1 text-[11px] font-medium uppercase ${slide.activo ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>
                  {slide.activo ? "Activo" : "Inactivo"}
                </span>
                <span className="text-xs text-isl-black/60">{slide.media_type === "video" ? "Video" : "Imagen"}</span>
              </div>
              <h3 className="mt-1 font-serif text-xl text-isl-black truncate">{slide.titulo || "Sin título"}</h3>
              {slide.subtitulo ? <p className="text-sm text-isl-black/70 truncate">{slide.subtitulo}</p> : null}
            </div>

            <div className="flex gap-2">
              <ButtonISL variant="outline" onClick={() => handleEdit(slide)}>
                Editar
              </ButtonISL>
              <button
                type="button"
                className="min-h-11 rounded-sm border border-isl-black/20 px-4 text-xs font-medium uppercase tracking-[0.12em] text-red-800 hover:bg-red-50"
                onClick={() => handleEliminar(slide.id, slide.titulo || "destacado")}
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