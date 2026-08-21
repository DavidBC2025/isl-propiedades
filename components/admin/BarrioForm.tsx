"use client";

import { useState } from "react";
import { guardarBarrio } from "@/app/admin/(app)/barrios/actions";
import { FieldHelp, fieldClassName } from "@/components/admin/FieldHelp";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { MediaUploader } from "@/components/isl/MediaUploader";
import { slugify } from "@/lib/format";
import type { Barrio } from "@/types/isl";

type BarrioFormProps = {
  barrio?: Barrio | null;
  onCancel: () => void;
  onDone: () => void;
};

export function BarrioForm({ barrio, onCancel, onDone }: BarrioFormProps) {
  const [nombre, setNombre] = useState(barrio?.nombre ?? "");
  const [heroImage, setHeroImage] = useState<string | null>(barrio?.hero_image ?? null);
  const [extracto, setExtracto] = useState(barrio?.extracto ?? "");
  const [contenido, setContenido] = useState(barrio?.contenido ?? "");
  const [tips, setTips] = useState(barrio?.tips?.join("\n") ?? "");
  const [seoTitle, setSeoTitle] = useState(barrio?.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(barrio?.meta_description ?? "");
  const [publicado, setPublicado] = useState(barrio?.publicado ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathPrefix = nombre ? `barrios/${slugify(nombre)}` : "barrios";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const tipsArray = tips.split("\n").map((t) => t.trim()).filter(Boolean);

    const result = await guardarBarrio({
      id: barrio?.id,
      nombre,
      hero_image: heroImage,
      extracto,
      contenido,
      tips: tipsArray,
      seo_title: seoTitle,
      meta_description: metaDescription,
      publicado,
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

      <div className="border border-isl-gold/30 bg-isl-champagne/30 px-4 py-3 text-sm text-isl-black">
        Escribe como si le estuvieras contando a un amigo cómo es vivir en este barrio. Menciona playas, colegios, locomoción, comercio — lo que realmente lo distingue.
      </div>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Información básica</h2>
        <FieldHelp id="nombre" label="Nombre del barrio" help="Por ejemplo: Reñaca, Recreo, Concón.">
          <input id="nombre" className={input} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="extracto" label="Extracto" help="Un breve resumen que se ve en la lista de barrios.">
          <textarea id="extracto" rows={3} className={input} value={extracto} onChange={(e) => setExtracto(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Imagen destacada</h2>
        <FieldHelp id="hero_image" label="Foto del barrio" help="Sube una foto representativa del barrio. Se recomienda que sea horizontal.">
          <MediaUploader
            kind="image"
            bucket="contenidos"
            pathPrefix={pathPrefix}
            existingUrls={heroImage ? [heroImage] : []}
            onChange={(urls) => setHeroImage(urls[0] ?? null)}
          />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Contenido</h2>
        <FieldHelp id="contenido" label="Descripción completa" help="Escribe todo lo que quieras contar sobre el barrio. Separa los párrafos dejando una línea en blanco entre ellos.">
          <textarea id="contenido" rows={12} className={input} value={contenido} onChange={(e) => setContenido(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Tips</h2>
        <FieldHelp id="tips" label="Tips útiles" help="Escribe un tip por línea. Por ejemplo: La mejor playa para niños, El café más tradicional, El punto de locomoción más cercano.">
          <textarea id="tips" rows={6} className={input} value={tips} onChange={(e) => setTips(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">SEO</h2>
        <FieldHelp id="seo_title" label="Título para buscadores" help="El título que aparece en Google. Si lo dejas vacío, usa el nombre del barrio.">
          <input id="seo_title" className={input} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="meta_description" label="Descripción para buscadores" help="Un breve texto que aparece en los resultados de búsqueda.">
          <textarea id="meta_description" rows={3} className={input} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Estado</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={publicado}
            onChange={(e) => setPublicado(e.target.checked)}
          />
          <span className="text-sm">Publicado (se ve en el sitio)</span>
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonISL type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </ButtonISL>
        <ButtonISL type="submit" disabled={saving}>
          {saving ? "Guardando…" : barrio ? "Guardar cambios" : "Crear barrio"}
        </ButtonISL>
      </div>
    </form>
  );
}