"use client";

import { useState } from "react";
import { guardarArticulo } from "@/app/admin/(app)/guia/actions";
import { FieldHelp, fieldClassName } from "@/components/admin/FieldHelp";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { MediaUploader } from "@/components/isl/MediaUploader";
import { slugify } from "@/lib/format";
import type { Articulo } from "@/types/isl";

type ArticuloFormProps = {
  articulo?: Articulo | null;
  onCancel: () => void;
  onDone: () => void;
};

export function ArticuloForm({ articulo, onCancel, onDone }: ArticuloFormProps) {
  const [titulo, setTitulo] = useState(articulo?.titulo ?? "");
  const [slug, setSlug] = useState(articulo?.slug ?? "");
  const [extracto, setExtracto] = useState(articulo?.extracto ?? "");
  const [contenido, setContenido] = useState(articulo?.contenido ?? "");
  const [categoria, setCategoria] = useState<"comprar" | "vender" | "invertir" | "barrio" | "tips" | null>(articulo?.categoria || null);
  const [etiquetas, setEtiquetas] = useState(articulo?.etiquetas?.join(", ") ?? "");
  const [imagenDestacada, setImagenDestacada] = useState<string | null>(articulo?.imagen_destacada ?? null);
  const [seoTitle, setSeoTitle] = useState(articulo?.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(articulo?.meta_description ?? "");
  const [estado, setEstado] = useState<"publicado" | "borrador">((articulo?.estado || "borrador") as any);
  const [esReporte, setEsReporte] = useState(articulo?.es_reporte ?? false);
  const [archivoPdfUrl, setArchivoPdfUrl] = useState<string | null>(articulo?.archivo_pdf_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const etiquetasArray = etiquetas.split(",").map((t) => t.trim()).filter(Boolean);

    const result = await guardarArticulo({
      id: articulo?.id,
      titulo,
      slug: slug || undefined,
      extracto,
      contenido,
      categoria,
      etiquetas: etiquetasArray,
      imagen_destacada: imagenDestacada,
      seo_title: seoTitle,
      meta_description: metaDescription,
      estado,
      es_reporte: esReporte,
      archivo_pdf_url: archivoPdfUrl,
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone();
  }

  const input = fieldClassName;
  const pathPrefix = titulo ? `articulos/${slugify(titulo)}` : "articulos";

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {error ? <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Información básica</h2>
        <FieldHelp id="titulo" label="Título" help="El título del artículo. Se genera el slug automáticamente, pero puedes editarlo si quieres.">
          <input id="titulo" className={input} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="slug" label="Slug (URL)" help="El link del artículo. Si lo dejas vacío, se genera desde el título.">
          <input id="slug" className={input} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="extracto" label="Extracto" help="Un breve resumen que se ve en la lista de artículos.">
          <textarea id="extracto" rows={3} className={input} value={extracto} onChange={(e) => setExtracto(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Categoría y etiquetas</h2>
        <FieldHelp id="categoria" label="Categoría" help="Elige la categoría principal del artículo.">
          <select id="categoria" className={input} value={categoria || ""} onChange={(e) => setCategoria(e.target.value as any)}>
            <option value="">Elegir…</option>
            <option value="comprar">Comprar</option>
            <option value="vender">Vender</option>
            <option value="invertir">Invertir</option>
            <option value="barrio">Barrio</option>
            <option value="tips">Tips</option>
          </select>
        </FieldHelp>
        <FieldHelp id="etiquetas" label="Etiquetas" help="Separa las etiquetas con coma. Por ejemplo: Viña del Mar, departamentos, inversión.">
          <input id="etiquetas" className={input} value={etiquetas} onChange={(e) => setEtiquetas(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Imagen destacada</h2>
        <FieldHelp id="imagen_destacada" label="Foto del artículo" help="Sube una foto representativa del artículo.">
          <MediaUploader
            kind="image"
            bucket="contenidos"
            pathPrefix={pathPrefix}
            existingUrls={imagenDestacada ? [imagenDestacada] : []}
            onChange={(urls) => setImagenDestacada(urls[0] ?? null)}
          />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Contenido</h2>
        <FieldHelp id="contenido" label="Contenido del artículo" help="Escribe el contenido completo. Separa los párrafos dejando una línea en blanco entre ellos.">
          <textarea id="contenido" rows={15} className={input} value={contenido} onChange={(e) => setContenido(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Reporte descargable</h2>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={esReporte}
            onChange={(e) => setEsReporte(e.target.checked)}
            className="mt-1"
          />
          <div>
            <span className="text-sm font-medium">Este artículo es un reporte descargable</span>
            <p className="text-sm text-isl-black/70 mt-1">Actívalo si este contenido es más bien un reporte o guía larga que quieres entregar a cambio del correo de quien lo lee, en vez de mostrarlo directo.</p>
          </div>
        </label>
        {esReporte ? (
          <FieldHelp id="archivo_pdf" label="PDF del reporte" help="Sube el PDF que se va a poder descargar después de dejar el correo.">
            <MediaUploader
              kind="pdf"
              bucket="contenidos"
              pathPrefix={`reportes/${slugify(titulo) || "reporte"}`}
              existingUrls={archivoPdfUrl ? [archivoPdfUrl] : []}
              onChange={(urls) => setArchivoPdfUrl(urls[0] ?? null)}
            />
          </FieldHelp>
        ) : null}
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">SEO</h2>
        <FieldHelp id="seo_title" label="Título para buscadores" help="El título que aparece en Google. Si lo dejas vacío, usa el título del artículo.">
          <input id="seo_title" className={input} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="meta_description" label="Descripción para buscadores" help="Un breve texto que aparece en los resultados de búsqueda.">
          <textarea id="meta_description" rows={3} className={input} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Estado</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="estado"
              checked={estado === "borrador"}
              onChange={() => setEstado("borrador")}
            />
            <span className="text-sm">Borrador</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="estado"
              checked={estado === "publicado"}
              onChange={() => setEstado("publicado")}
            />
            <span className="text-sm">Publicado</span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonISL type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </ButtonISL>
        <ButtonISL type="submit" disabled={saving}>
          {saving ? "Guardando…" : articulo ? "Guardar cambios" : "Crear artículo"}
        </ButtonISL>
      </div>
    </form>
  );
}
