"use client";

import { useEffect, useMemo, useState } from "react";
import { guardarPropiedad } from "@/app/admin/(app)/propiedades/actions";
import { FieldHelp, fieldClassName } from "@/components/admin/FieldHelp";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { MediaUploader } from "@/components/isl/MediaUploader";
import { AVISO_ADMIN } from "@/lib/admin-copy";
import {
  COMUNAS_ISL,
  DRAFT_STORAGE_KEY,
  LAST_COMUNA_KEY,
  LAST_OPERACION_KEY,
  emptyPropiedadForm,
  formToGuardarInput,
  imagenesFromUrls,
  suggestedSlug,
  type PropiedadFormValues,
} from "@/lib/propiedad-admin";
import type { Agente, Propiedad } from "@/types/isl";

type PropiedadFormProps = {
  mode: "nueva" | "editar";
  propiedad?: Propiedad | null;
  agentes: Agente[];
  defaultAgenteId?: string | null;
  avisoInicial?: string | null;
};

function readSession(key: string): string {
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // El respaldo es opcional si el navegador no permite storage.
  }
}

function clearSession(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // noop
  }
}

export function PropiedadForm({ mode, propiedad, agentes, defaultAgenteId, avisoInicial }: PropiedadFormProps) {
  const lastOperacion = mode === "nueva" ? (readSession(LAST_OPERACION_KEY) as PropiedadFormValues["operacion"]) : "";
  const lastComuna = mode === "nueva" ? readSession(LAST_COMUNA_KEY) : "";
  const [values, setValues] = useState<PropiedadFormValues>(() => {
    if (propiedad) return emptyPropiedadForm();
    return emptyPropiedadForm({
      operacion: lastOperacion === "venta" || lastOperacion === "arriendo" ? lastOperacion : "",
      comuna: lastComuna,
      agente_id: defaultAgenteId ?? "",
    });
  });
  const [hydrated, setHydrated] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState<"ask" | "none">("none");
  const [draftSnapshot, setDraftSnapshot] = useState<PropiedadFormValues | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState(avisoInicial ? AVISO_ADMIN[avisoInicial] ?? avisoInicial : null);
  const [saving, setSaving] = useState<"borrador" | "publicar" | "mantener" | null>(null);
  const [draftFolder] = useState(() => `nueva-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`);

  useEffect(() => {
    if (propiedad) {
      const { emptyPropiedadForm: _unused, ...fromLib } = { emptyPropiedadForm } as { emptyPropiedadForm: unknown };
      void _unused;
      void fromLib;
    }
  }, [propiedad]);

  useEffect(() => {
    if (propiedad) {
      setValues({
        titulo: propiedad.titulo ?? "",
        operacion: propiedad.operacion ?? "",
        tipo: propiedad.tipo ?? "",
        precio_uf: propiedad.precio_uf == null ? "" : String(propiedad.precio_uf),
        comuna: propiedad.comuna ?? "",
        sector: propiedad.sector ?? "",
        direccion_publica: propiedad.direccion_publica ?? "",
        lat: propiedad.lat == null ? "" : String(propiedad.lat),
        lng: propiedad.lng == null ? "" : String(propiedad.lng),
        dormitorios: propiedad.dormitorios == null ? "" : String(propiedad.dormitorios),
        banos: propiedad.banos == null ? "" : String(propiedad.banos),
        estacionamientos: propiedad.estacionamientos == null ? "" : String(propiedad.estacionamientos),
        m2_construidos: propiedad.m2_construidos == null ? "" : String(propiedad.m2_construidos),
        m2_terreno: propiedad.m2_terreno == null ? "" : String(propiedad.m2_terreno),
        gastos_comunes_uf: propiedad.gastos_comunes_uf == null ? "" : String(propiedad.gastos_comunes_uf),
        orientacion: propiedad.orientacion ?? "",
        vista: propiedad.vista ?? "",
        descripcion: propiedad.descripcion ?? "",
        caracteristicas: (Array.isArray(propiedad.caracteristicas) ? propiedad.caracteristicas : []).join("\n"),
        video_url: propiedad.video_url ?? "",
        tour_url: propiedad.tour_url ?? "",
        imagenes: Array.isArray(propiedad.imagenes) ? propiedad.imagenes.filter((image) => Boolean(image?.url)) : [],
        agente_id: propiedad.agente_id ?? "",
      });
    } else {
      try {
        const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as PropiedadFormValues;
          if (parsed && typeof parsed === "object" && (parsed.titulo || parsed.comuna || parsed.precio_uf)) {
            setDraftSnapshot(parsed);
            setDraftPrompt("ask");
          }
        }
      } catch {
        // Si el respaldo está dañado, se ignora.
      }
    }
    setHydrated(true);
  }, [propiedad]);

  useEffect(() => {
    if (!hydrated || mode !== "nueva" || draftPrompt === "ask") return;
    const timer = window.setTimeout(() => {
      writeSession(DRAFT_STORAGE_KEY, JSON.stringify(values));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [values, hydrated, mode, draftPrompt]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const pathPrefix = useMemo(() => {
    const slug = propiedad?.slug || suggestedSlug(values.titulo) || draftFolder;
    return `propiedades/${slug}`;
  }, [propiedad?.slug, values.titulo, draftFolder]);

  function patch(partial: Partial<PropiedadFormValues>) {
    setDirty(true);
    setAviso(null);
    setValues((current) => ({ ...current, ...partial }));
  }

  async function submit(intent: "borrador" | "publicar" | "mantener") {
    const payload = formToGuardarInput(values, intent, propiedad?.id);
    if ("error" in payload) {
      setError(payload.error);
      return;
    }
    setError(null);
    setSaving(intent);
    const result = await guardarPropiedad(payload);
    setSaving(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    writeSession(LAST_OPERACION_KEY, values.operacion);
    writeSession(LAST_COMUNA_KEY, values.comuna);
    clearSession(DRAFT_STORAGE_KEY);
    setDirty(false);
  }

  const input = fieldClassName;

  return (
    <form className="space-y-12 pb-32" onSubmit={(event) => { event.preventDefault(); void submit(mode === "editar" ? "mantener" : "borrador"); }}>
      {draftPrompt === "ask" && draftSnapshot ? (
        <div className="border border-isl-gold/50 bg-isl-champagne/50 p-5" role="dialog" aria-labelledby="borrador-titulo">
          <p id="borrador-titulo" className="font-serif text-2xl text-isl-black">Encontramos datos sin guardar de hace un momento, ¿quieres recuperarlos o empezar de nuevo?</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonISL type="button" onClick={() => { setValues(draftSnapshot); setDraftPrompt("none"); setDirty(true); }}>Recuperar</ButtonISL>
            <ButtonISL type="button" variant="outline" onClick={() => { clearSession(DRAFT_STORAGE_KEY); setDraftPrompt("none"); }}>Empezar de nuevo</ButtonISL>
          </div>
        </div>
      ) : null}

      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm">{aviso}</p> : null}
      {error ? <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Datos básicos</h2>
        <FieldHelp id="titulo" label="Título" help="El nombre con el que se va a ver en el sitio. Algo claro, como el edificio o la calle.">
          <input id="titulo" className={input} value={values.titulo} onChange={(event) => patch({ titulo: event.target.value })} />
        </FieldHelp>
        <FieldHelp id="tipo" label="Tipo" help="Casa, departamento o parcela. Si no encaja perfecto, elige lo más cercano.">
          <select id="tipo" className={input} value={values.tipo} onChange={(event) => patch({ tipo: event.target.value as PropiedadFormValues["tipo"] })}>
            <option value="">Elegir…</option>
            <option value="departamento">Departamento</option>
            <option value="casa">Casa</option>
            <option value="parcela">Parcela</option>
          </select>
        </FieldHelp>
        <FieldHelp id="descripcion" label="Descripción" help="Cuenta cómo se siente el lugar. Puedes dejarlo vacío y completarlo después.">
          <textarea id="descripcion" rows={6} className={input} value={values.descripcion} onChange={(event) => patch({ descripcion: event.target.value })} />
        </FieldHelp>
        <FieldHelp id="caracteristicas" label="Características" help="Una por línea. Por ejemplo: logia, cocina integrada, calefacción.">
          <textarea id="caracteristicas" rows={4} className={input} value={values.caracteristicas} onChange={(event) => patch({ caracteristicas: event.target.value })} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Precio y operación</h2>
        <FieldHelp id="operacion" label="Operación" help="Si es para vender o para arrendar.">
          <select id="operacion" className={input} value={values.operacion} onChange={(event) => patch({ operacion: event.target.value as PropiedadFormValues["operacion"] })}>
            <option value="">Elegir…</option>
            <option value="venta">Venta</option>
            <option value="arriendo">Arriendo</option>
          </select>
        </FieldHelp>
        <FieldHelp id="precio_uf" label="Precio en UF" help="Valor de venta o arriendo en UF. Si no tienes el número exacto a mano, pon uno aproximado, después lo puedes ajustar.">
          <input id="precio_uf" inputMode="decimal" className={input} value={values.precio_uf} onChange={(event) => patch({ precio_uf: event.target.value })} />
        </FieldHelp>
        <FieldHelp id="gastos_comunes_uf" label="Gastos comunes en UF" help="Déjalo vacío si la propiedad no tiene gastos comunes.">
          <input id="gastos_comunes_uf" inputMode="decimal" className={input} value={values.gastos_comunes_uf} onChange={(event) => patch({ gastos_comunes_uf: event.target.value })} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Características</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldHelp id="dormitorios" label="Dormitorios" help="Si no lo tienes claro ahora, lo puedes completar después.">
            <input id="dormitorios" inputMode="numeric" className={input} value={values.dormitorios} onChange={(event) => patch({ dormitorios: event.target.value })} />
          </FieldHelp>
          <FieldHelp id="banos" label="Baños" help="Incluye los que tenga, aunque sean de visita.">
            <input id="banos" inputMode="numeric" className={input} value={values.banos} onChange={(event) => patch({ banos: event.target.value })} />
          </FieldHelp>
          <FieldHelp id="estacionamientos" label="Estacionamientos" help="Déjalo vacío si no tiene o no aplica.">
            <input id="estacionamientos" inputMode="numeric" className={input} value={values.estacionamientos} onChange={(event) => patch({ estacionamientos: event.target.value })} />
          </FieldHelp>
          <FieldHelp id="m2_construidos" label="m² construidos" help="Si no está en la escritura a mano, un aproximado sirve.">
            <input id="m2_construidos" inputMode="decimal" className={input} value={values.m2_construidos} onChange={(event) => patch({ m2_construidos: event.target.value })} />
          </FieldHelp>
          <FieldHelp id="m2_terreno" label="m² de terreno" help="Sobre todo para casas y parcelas. En departamento puedes dejarlo vacío.">
            <input id="m2_terreno" inputMode="decimal" className={input} value={values.m2_terreno} onChange={(event) => patch({ m2_terreno: event.target.value })} />
          </FieldHelp>
          <FieldHelp id="orientacion" label="Orientación" help="Por ejemplo: norte, norponiente. Si no la sabes, déjala vacía.">
            <input id="orientacion" className={input} value={values.orientacion} onChange={(event) => patch({ orientacion: event.target.value })} />
          </FieldHelp>
        </div>
        <FieldHelp id="vista" label="Vista" help="¿Qué se ve desde la propiedad? Elige la opción que más se acerque.">
          <select id="vista" className={input} value={values.vista} onChange={(event) => patch({ vista: event.target.value as PropiedadFormValues["vista"] })}>
            <option value="">Sin especificar</option>
            <option value="mar">Mar</option>
            <option value="cerro">Cerro</option>
            <option value="ciudad">Ciudad</option>
            <option value="jardin">Jardín</option>
            <option value="sin_vista">Sin vista especial</option>
          </select>
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Fotos y video</h2>
        <FieldHelp id="fotos" label="Fotos" help="Sube todas las fotos que quieras, puedes elegir varias al mismo tiempo. La primera foto que subas va a ser la portada, pero puedes cambiar cuál es la portada más abajo.">
          <MediaUploader
            kind="image-multiple"
            bucket="propiedades"
            pathPrefix={pathPrefix}
            existingUrls={values.imagenes.map((image) => image.url)}
            onChange={(urls) => patch({ imagenes: imagenesFromUrls(urls) })}
          />
        </FieldHelp>
        <FieldHelp id="video" label="Video" help="Puedes subir un video corto directo desde tu celular, o si ya tienes el video en YouTube o Vimeo, pega el link acá.">
          <MediaUploader
            kind="video"
            bucket="propiedades"
            pathPrefix={pathPrefix}
            allowUrlInstead={true}
            existingUrls={values.video_url ? [values.video_url] : []}
            onChange={(urls) => patch({ video_url: urls[0] ?? "" })}
          />
        </FieldHelp>
        <FieldHelp id="tour_url" label="Tour virtual" help="Solo si ya tienes un tour virtual armado en otra plataforma, pega el link acá. Si no tienes, déjalo vacío.">
          <input id="tour_url" className={input} value={values.tour_url} onChange={(event) => patch({ tour_url: event.target.value })} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Ubicación</h2>
        <FieldHelp id="comuna" label="Comuna" help="Elige la comuna o sector donde está. Si no aparece, puedes escribirla.">
          <input id="comuna" className={input} list="comunas-isl" value={values.comuna} onChange={(event) => patch({ comuna: event.target.value })} />
          <datalist id="comunas-isl">
            {COMUNAS_ISL.map((comuna) => <option key={comuna} value={comuna} />)}
          </datalist>
        </FieldHelp>
        <FieldHelp id="sector" label="Sector" help="Un barrio o referencia corta. Ejemplo: Recreo alto.">
          <input id="sector" className={input} value={values.sector} onChange={(event) => patch({ sector: event.target.value })} />
        </FieldHelp>
        <FieldHelp id="direccion_publica" label="Dirección pública" help="Lo que se puede mostrar en el sitio. Si prefieres no publicar el número, escribe solo la calle.">
          <input id="direccion_publica" className={input} value={values.direccion_publica} onChange={(event) => patch({ direccion_publica: event.target.value })} />
        </FieldHelp>
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldHelp id="lat" label="Latitud" help="Solo si quieres que se vea el mapa. Si no estás segura, déjalo vacío.">
            <input id="lat" inputMode="decimal" className={input} value={values.lat} onChange={(event) => patch({ lat: event.target.value })} />
          </FieldHelp>
          <FieldHelp id="lng" label="Longitud" help="Va junto con la latitud. También se puede dejar vacío.">
            <input id="lng" inputMode="decimal" className={input} value={values.lng} onChange={(event) => patch({ lng: event.target.value })} />
          </FieldHelp>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Agente a cargo</h2>
        <FieldHelp id="agente_id" label="Agente" help="Quién va a atender las consultas de esta propiedad. Se puede cambiar después.">
          <select id="agente_id" className={input} value={values.agente_id} onChange={(event) => patch({ agente_id: event.target.value })}>
            <option value="">Elegir después</option>
            {agentes.map((agente) => (
              <option key={agente.id} value={agente.id}>{[agente.nombre, agente.apellido].filter(Boolean).join(" ")}</option>
            ))}
          </select>
        </FieldHelp>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-isl-black/10 bg-isl-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-end gap-2">
          <ButtonISL type="button" variant="outline" disabled={saving != null} onClick={() => void submit("borrador")}>
            {saving === "borrador" ? "Guardando…" : "Guardar como borrador"}
          </ButtonISL>
          {mode === "editar" ? (
            <ButtonISL type="submit" disabled={saving != null}>
              {saving === "mantener" ? "Guardando…" : "Guardar"}
            </ButtonISL>
          ) : null}
          <ButtonISL type="button" variant="gold" disabled={saving != null} onClick={() => void submit("publicar")}>
            {saving === "publicar" ? "Publicando…" : "Publicar"}
          </ButtonISL>
        </div>
      </div>
    </form>
  );
}
