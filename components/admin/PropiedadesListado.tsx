"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstadoPropiedad, duplicarPropiedad, eliminarPropiedad } from "@/app/admin/(app)/propiedades/actions";
import { crearHeroDesdePropiedad } from "@/app/admin/(app)/hero/actions";
import { EstadoBadge } from "@/components/admin/EstadoBadge";
import { FichaPdfButton } from "@/components/admin/FichaPdfButton";
import { ImagenRedesButton } from "@/components/admin/ImagenRedesButton";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { EmptyState } from "@/components/isl/EmptyState";
import { PriceTag } from "@/components/isl/PriceTag";
import { AVISO_ADMIN } from "@/lib/admin-copy";
import { formatComuna } from "@/lib/format";
import { portadaImagen } from "@/lib/ficha";
import type { Propiedad } from "@/types/isl";

const ESTADOS_FILTRO = [
  { value: "todas", label: "Todas" },
  { value: "borrador", label: "Borrador" },
  { value: "publicada", label: "Publicada" },
  { value: "reservada", label: "Reservada" },
  { value: "vendida", label: "Vendida" },
  { value: "despublicada", label: "Oculta" },
] as const;

const menuItemClass = "block min-h-11 w-full px-3 text-left text-sm text-isl-black hover:bg-isl-offwhite disabled:opacity-50";

type PropiedadesListadoProps = {
  propiedades: Propiedad[];
  avisoInicial?: string | null;
};

export function PropiedadesListado({ propiedades, avisoInicial }: PropiedadesListadoProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<(typeof ESTADOS_FILTRO)[number]["value"]>("todas");
  const [aviso, setAviso] = useState(avisoInicial ? AVISO_ADMIN[avisoInicial] ?? avisoInicial : null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtradas = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es-CL");
    return propiedades.filter((propiedad) => {
      const matchEstado = estado === "todas" || propiedad.estado === estado;
      const matchTitulo = !needle || propiedad.titulo.toLocaleLowerCase("es-CL").includes(needle);
      return matchEstado && matchTitulo;
    });
  }, [propiedades, query, estado]);

  function run(action: () => Promise<{ ok: boolean; error?: string; titulo?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo completar.");
        return;
      }
      setAviso(result.titulo ? `${success} ${result.titulo}` : success);
      setOpenMenu(null);
      router.refresh();
    });
  }

  function handleUsarComoDestacado(id: string, titulo: string) {
    startTransition(async () => {
      const result = await crearHeroDesdePropiedad(id);
      if (!result.ok) {
        setAviso(result.error ?? "No se pudo crear el destacado.");
        return;
      }
      setAviso(`Listo. "${titulo}" ahora es un destacado de portada.`);
      setOpenMenu(null);
      router.refresh();
    });
  }

  if (propiedades.length === 0) {
    return (
      <EmptyState
        title="Aún no has publicado ninguna propiedad"
        description="Cuando cargues la primera, va a aparecer acá. Puedes dejarla en borrador hasta tener las fotos listas."
        ctaLabel="+ Nueva propiedad"
        ctaHref="/admin/propiedades/nueva"
      />
    );
  }

  return (
    <div className="space-y-6">
      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm text-isl-black">{aviso}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm">
          <span className="mb-1 block text-isl-black/70">Buscar por título</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Escribe parte del nombre"
            className="min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 text-base"
          />
        </label>
        <label className="block text-sm sm:w-56">
          <span className="mb-1 block text-isl-black/70">Estado</span>
          <select
            value={estado}
            onChange={(event) => setEstado(event.target.value as typeof estado)}
            className="min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 text-base"
          >
            {ESTADOS_FILTRO.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      {filtradas.length === 0 ? (
        <p className="text-sm text-isl-black/70">Ninguna coincide con esa búsqueda. Prueba otro título o quita el filtro.</p>
      ) : (
        <ul className="grid gap-4">
          {filtradas.map((propiedad) => {
            const cover = portadaImagen(propiedad.imagenes);
            const puedePublicar = propiedad.estado === "borrador" || propiedad.estado === "despublicada";
            const puedeOcultar = propiedad.estado === "publicada";
            return (
              <li key={propiedad.id} className="grid gap-4 border border-isl-black/10 bg-isl-white p-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center">
                <div className="aspect-[4/5] w-22 overflow-hidden rounded-sm bg-isl-offwhite sm:w-auto">
                  {cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center font-serif text-2xl text-isl-gold">ISL</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <EstadoBadge estado={propiedad.estado} />
                    <p className="text-sm text-isl-black/65">{formatComuna(propiedad.comuna)}</p>
                  </div>
                  <h2 className="mt-1 font-serif text-2xl font-normal text-isl-black">{propiedad.titulo}</h2>
                  <div className="mt-1"><PriceTag value={propiedad.precio_uf} /></div>
                </div>
                <div className="relative justify-self-start sm:justify-self-end">
                  <button
                    type="button"
                    className="min-h-11 rounded-sm border border-isl-black/20 px-4 text-xs font-medium uppercase tracking-[0.12em]"
                    onClick={() => setOpenMenu((current) => current === propiedad.id ? null : propiedad.id)}
                    disabled={pending}
                  >
                    Acciones
                  </button>
                  {openMenu === propiedad.id ? (
                    <div className="absolute left-0 z-20 mt-2 w-64 rounded-sm border border-isl-black/10 bg-isl-white py-1 shadow-lg sm:left-auto sm:right-0">
                      <Link href={`/admin/propiedades/${propiedad.id}/editar`} className={menuItemClass}>Editar</Link>
                      <button type="button" className={menuItemClass} onClick={() => run(() => duplicarPropiedad(propiedad.id), "Listo. Dejamos una copia en borrador:")}>Duplicar</button>
                      <Link href={`/admin/propiedades/${propiedad.id}/vista-previa`} className={menuItemClass}>Vista previa</Link>
                      <button type="button" className={menuItemClass} onClick={() => handleUsarComoDestacado(propiedad.id, propiedad.titulo)}>Usar como destacado</button>
                      <FichaPdfButton propiedad={propiedad} agente={propiedad.agente ?? null} onDone={setAviso} className={menuItemClass} />
                      <ImagenRedesButton propiedad={propiedad} onDone={setAviso} className={`${menuItemClass} text-left`} />
                      {puedePublicar ? (
                        <button type="button" className={menuItemClass} onClick={() => run(() => cambiarEstadoPropiedad(propiedad.id, "publicada"), "Listo, ya está visible en el sitio.")}>Publicar</button>
                      ) : null}
                      {puedeOcultar ? (
                        <button type="button" className={menuItemClass} onClick={() => run(() => cambiarEstadoPropiedad(propiedad.id, "despublicada"), "Listo, ya no se ve en el sitio.")}>Despublicar</button>
                      ) : null}
                      <button
                        type="button"
                        className={`${menuItemClass} text-red-800`}
                        onClick={() => {
                          const ok = window.confirm(`¿Quieres borrar “${propiedad.titulo}”? Se va a quitar de la cartera y no se puede deshacer.`);
                          if (!ok) return;
                          run(() => eliminarPropiedad(propiedad.id), "Listo, la propiedad se eliminó.");
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ButtonISL href="/admin/propiedades/nueva" variant="outline">+ Nueva propiedad</ButtonISL>
    </div>
  );
}
