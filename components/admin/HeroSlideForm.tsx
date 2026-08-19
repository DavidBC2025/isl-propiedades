"use client";

import { useState } from "react";
import { guardarHeroSlide } from "@/app/admin/(app)/hero/actions";
import { FieldHelp, fieldClassName } from "@/components/admin/FieldHelp";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { MediaUploader } from "@/components/isl/MediaUploader";
import type { HeroSlide, Propiedad } from "@/types/isl";

type HeroSlideFormProps = {
  slide?: HeroSlide | null;
  propiedades: Propiedad[];
  onCancel: () => void;
  onDone: () => void;
};

const PAGINAS_OPCIONES = [
  { href: "/propiedades", label: "Propiedades" },
  { href: "/vender", label: "Vender" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/barrios", label: "Barrios" },
] as const;

export function HeroSlideForm({ slide, propiedades, onCancel, onDone }: HeroSlideFormProps) {
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(slide?.media_type ?? null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(slide?.media_url ?? null);
  const [titulo, setTitulo] = useState(slide?.titulo ?? "");
  const [subtitulo, setSubtitulo] = useState(slide?.subtitulo ?? "");
  const [ctaPrimarioLabel, setCtaPrimarioLabel] = useState(slide?.cta_primario_label ?? "");
  const [ctaPrimarioHrefType, setCtaPrimarioHrefType] = useState<"propiedad" | "pagina" | "manual">(() => {
    const href = slide?.cta_primario_href ?? "";
    if (href.startsWith("/propiedades/")) return "propiedad";
    if (PAGINAS_OPCIONES.some((opt) => opt.href === href)) return "pagina";
    return "manual";
  });
  const [ctaPrimarioPropiedadId, setCtaPrimarioPropiedadId] = useState(() => {
    const href = slide?.cta_primario_href ?? "";
    if (href.startsWith("/propiedades/")) {
      const slug = href.replace("/propiedades/", "");
      const prop = propiedades.find((p) => p.slug === slug);
      return prop?.id ?? "";
    }
    return "";
  });
  const [ctaPrimarioPaginaHref, setCtaPrimarioPaginaHref] = useState(() => {
    const href = slide?.cta_primario_href ?? "";
    const opt = PAGINAS_OPCIONES.find((o) => o.href === href);
    return opt?.href ?? "";
  });
  const [ctaPrimarioManualHref, setCtaPrimarioManualHref] = useState(() => {
    const href = slide?.cta_primario_href ?? "";
    if (ctaPrimarioHrefType === "manual") return href;
    return "";
  });
  const [ctaSecundarioLabel, setCtaSecundarioLabel] = useState(slide?.cta_secundario_label ?? "");
  const [ctaSecundarioHrefType, setCtaSecundarioHrefType] = useState<"propiedad" | "pagina" | "manual">(() => {
    const href = slide?.cta_secundario_href ?? "";
    if (href.startsWith("/propiedades/")) return "propiedad";
    if (PAGINAS_OPCIONES.some((opt) => opt.href === href)) return "pagina";
    return "manual";
  });
  const [ctaSecundarioPropiedadId, setCtaSecundarioPropiedadId] = useState(() => {
    const href = slide?.cta_secundario_href ?? "";
    if (href.startsWith("/propiedades/")) {
      const slug = href.replace("/propiedades/", "");
      const prop = propiedades.find((p) => p.slug === slug);
      return prop?.id ?? "";
    }
    return "";
  });
  const [ctaSecundarioPaginaHref, setCtaSecundarioPaginaHref] = useState(() => {
    const href = slide?.cta_secundario_href ?? "";
    const opt = PAGINAS_OPCIONES.find((o) => o.href === href);
    return opt?.href ?? "";
  });
  const [ctaSecundarioManualHref, setCtaSecundarioManualHref] = useState(() => {
    const href = slide?.cta_secundario_href ?? "";
    if (ctaSecundarioHrefType === "manual") return href;
    return "";
  });
  const [activo, setActivo] = useState(slide?.activo ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getHref(type: "propiedad" | "pagina" | "manual", propiedadId: string, paginaHref: string, manualHref: string): string | null {
    if (type === "propiedad") {
      const prop = propiedades.find((p) => p.id === propiedadId);
      return prop ? `/propiedades/${prop.slug}` : null;
    }
    if (type === "pagina") return paginaHref || null;
    return manualHref || null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const ctaPrimarioHref = getHref(ctaPrimarioHrefType, ctaPrimarioPropiedadId, ctaPrimarioPaginaHref, ctaPrimarioManualHref);
    const ctaSecundarioHref = getHref(ctaSecundarioHrefType, ctaSecundarioPropiedadId, ctaSecundarioPaginaHref, ctaSecundarioManualHref);

    const result = await guardarHeroSlide({
      id: slide?.id,
      media_type: mediaType,
      media_url: mediaUrl,
      titulo: titulo || null,
      subtitulo: subtitulo || null,
      cta_primario_label: ctaPrimarioLabel || null,
      cta_primario_href: ctaPrimarioHref,
      cta_secundario_label: ctaSecundarioLabel || null,
      cta_secundario_href: ctaSecundarioHref,
      orden: slide?.orden ?? null,
      activo,
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone();
  }

  const input = fieldClassName;

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {error ? <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Imagen o video</h2>
        <div className="flex gap-2 border-b border-isl-black/15" role="tablist" aria-label="Tipo de media">
          <button
            type="button"
            role="tab"
            aria-selected={mediaType === "image"}
            onClick={() => setMediaType("image")}
            className={`px-3 py-2 text-sm ${mediaType === "image" ? "border-b-2 border-isl-gold text-isl-black" : "text-isl-gray"}`}
          >
            Imagen
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mediaType === "video"}
            onClick={() => setMediaType("video")}
            className={`px-3 py-2 text-sm ${mediaType === "video" ? "border-b-2 border-isl-gold text-isl-black" : "text-isl-gray"}`}
          >
            Video
          </button>
        </div>

        {mediaType === "image" ? (
          <FieldHelp id="media" label="Imagen" help="Sube una foto para el destacado. La imagen debe ser horizontal para que se vea bien.">
            <MediaUploader
              kind="image"
              bucket="contenidos"
              pathPrefix="hero"
              existingUrls={mediaUrl ? [mediaUrl] : []}
              onChange={(urls) => setMediaUrl(urls[0] ?? null)}
            />
          </FieldHelp>
        ) : mediaType === "video" ? (
          <FieldHelp id="media" label="Video" help="Sube un video corto o pega el link de YouTube o Vimeo.">
            <MediaUploader
              kind="video"
              bucket="contenidos"
              pathPrefix="hero"
              allowUrlInstead={true}
              existingUrls={mediaUrl ? [mediaUrl] : []}
              onChange={(urls) => setMediaUrl(urls[0] ?? null)}
            />
          </FieldHelp>
        ) : (
          <p className="text-sm text-isl-black/70">Elige si quieres imagen o video arriba.</p>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Texto</h2>
        <FieldHelp id="titulo" label="Título" help="El texto principal que se ve sobre la imagen.">
          <input id="titulo" className={input} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="subtitulo" label="Subtítulo" help="Un texto más pequeño debajo del título.">
          <input id="subtitulo" className={input} value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Botones</h2>
        <FieldHelp id="cta_primario_label" label="Texto del botón principal" help="Por ejemplo: Ver propiedad.">
          <input id="cta_primario_label" className={input} value={ctaPrimarioLabel} onChange={(e) => setCtaPrimarioLabel(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="cta_primario_href" label="¿A dónde lleva el botón principal?" help="Elige si lleva a una propiedad, una página del sitio, o escribe un link manual.">
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="cta_primario_type"
                checked={ctaPrimarioHrefType === "propiedad"}
                onChange={() => setCtaPrimarioHrefType("propiedad")}
              />
              <span className="text-sm">A una propiedad</span>
            </label>
            {ctaPrimarioHrefType === "propiedad" ? (
              <select
                className={input}
                value={ctaPrimarioPropiedadId}
                onChange={(e) => setCtaPrimarioPropiedadId(e.target.value)}
              >
                <option value="">Elegir propiedad…</option>
                {propiedades.map((prop) => (
                  <option key={prop.id} value={prop.id}>{prop.titulo}</option>
                ))}
              </select>
            ) : null}

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="cta_primario_type"
                checked={ctaPrimarioHrefType === "pagina"}
                onChange={() => setCtaPrimarioHrefType("pagina")}
              />
              <span className="text-sm">A una página del sitio</span>
            </label>
            {ctaPrimarioHrefType === "pagina" ? (
              <select
                className={input}
                value={ctaPrimarioPaginaHref}
                onChange={(e) => setCtaPrimarioPaginaHref(e.target.value)}
              >
                <option value="">Elegir página…</option>
                {PAGINAS_OPCIONES.map((opt) => (
                  <option key={opt.href} value={opt.href}>{opt.label}</option>
                ))}
              </select>
            ) : null}

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="cta_primario_type"
                checked={ctaPrimarioHrefType === "manual"}
                onChange={() => setCtaPrimarioHrefType("manual")}
              />
              <span className="text-sm">Otro link</span>
            </label>
            {ctaPrimarioHrefType === "manual" ? (
              <input
                className={input}
                placeholder="https://..."
                value={ctaPrimarioManualHref}
                onChange={(e) => setCtaPrimarioManualHref(e.target.value)}
              />
            ) : null}
          </div>
        </FieldHelp>

        <FieldHelp id="cta_secundario_label" label="Texto del botón secundario (opcional)" help="Si no quieres botón secundario, déjalo vacío.">
          <input id="cta_secundario_label" className={input} value={ctaSecundarioLabel} onChange={(e) => setCtaSecundarioLabel(e.target.value)} />
        </FieldHelp>
        {ctaSecundarioLabel ? (
          <FieldHelp id="cta_secundario_href" label="¿A dónde lleva el botón secundario?" help="Igual que el botón principal, elige a dónde lleva.">
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cta_secundario_type"
                  checked={ctaSecundarioHrefType === "propiedad"}
                  onChange={() => setCtaSecundarioHrefType("propiedad")}
                />
                <span className="text-sm">A una propiedad</span>
              </label>
              {ctaSecundarioHrefType === "propiedad" ? (
                <select
                  className={input}
                  value={ctaSecundarioPropiedadId}
                  onChange={(e) => setCtaSecundarioPropiedadId(e.target.value)}
                >
                  <option value="">Elegir propiedad…</option>
                  {propiedades.map((prop) => (
                    <option key={prop.id} value={prop.id}>{prop.titulo}</option>
                  ))}
                </select>
              ) : null}

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cta_secundario_type"
                  checked={ctaSecundarioHrefType === "pagina"}
                  onChange={() => setCtaSecundarioHrefType("pagina")}
                />
                <span className="text-sm">A una página del sitio</span>
              </label>
              {ctaSecundarioHrefType === "pagina" ? (
                <select
                  className={input}
                  value={ctaSecundarioPaginaHref}
                  onChange={(e) => setCtaSecundarioPaginaHref(e.target.value)}
                >
                  <option value="">Elegir página…</option>
                  {PAGINAS_OPCIONES.map((opt) => (
                    <option key={opt.href} value={opt.href}>{opt.label}</option>
                  ))}
                </select>
              ) : null}

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cta_secundario_type"
                  checked={ctaSecundarioHrefType === "manual"}
                  onChange={() => setCtaSecundarioHrefType("manual")}
                />
                <span className="text-sm">Otro link</span>
              </label>
              {ctaSecundarioHrefType === "manual" ? (
                <input
                  className={input}
                  placeholder="https://..."
                  value={ctaSecundarioManualHref}
                  onChange={(e) => setCtaSecundarioManualHref(e.target.value)}
                />
              ) : null}
            </div>
          </FieldHelp>
        ) : null}
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Estado</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
          <span className="text-sm">Activo (se ve en la portada)</span>
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonISL type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </ButtonISL>
        <ButtonISL type="submit" disabled={saving}>
          {saving ? "Guardando…" : slide ? "Guardar cambios" : "Crear destacado"}
        </ButtonISL>
      </div>
    </form>
  );
}