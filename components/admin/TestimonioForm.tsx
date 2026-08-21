"use client";

import { useState } from "react";
import { guardarTestimonio } from "@/app/admin/(app)/testimonios/actions";
import { FieldHelp, fieldClassName } from "@/components/admin/FieldHelp";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { MediaUploader } from "@/components/isl/MediaUploader";
import type { Testimonio } from "@/types/isl";

type TestimonioFormProps = {
  testimonio?: Testimonio | null;
  propiedades: any[];
  onCancel: () => void;
  onDone: () => void;
};

export function TestimonioForm({ testimonio, propiedades, onCancel, onDone }: TestimonioFormProps) {
  const [nombre, setNombre] = useState(testimonio?.nombre ?? "");
  const [rolCiudad, setRolCiudad] = useState(testimonio?.rol_ciudad ?? "");
  const [texto, setTexto] = useState(testimonio?.texto ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(testimonio?.foto_url ?? null);
  const [propiedadId, setPropiedadId] = useState(testimonio?.propiedad_id ?? "");
  const [destacado, setDestacado] = useState(testimonio?.destacado ?? false);
  const [publicado, setPublicado] = useState(testimonio?.publicado ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const result = await guardarTestimonio({
      id: testimonio?.id,
      nombre,
      rol_ciudad: rolCiudad,
      texto,
      foto_url: fotoUrl,
      propiedad_id: propiedadId || null,
      destacado,
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

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Información personal</h2>
        <FieldHelp id="nombre" label="Nombre" help="El nombre de la persona que dio el testimonio.">
          <input id="nombre" className={input} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="rol_ciudad" label="Rol y ciudad" help="Por ejemplo: Comprador en Viña del Mar, Inversionista en Reñaca.">
          <input id="rol_ciudad" className={input} value={rolCiudad} onChange={(e) => setRolCiudad(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Foto</h2>
        <FieldHelp id="foto" label="Foto de la persona" help="Sube una foto de la persona. Es opcional, pero ayuda a dar más credibilidad al testimonio.">
          <MediaUploader
            kind="image"
            bucket="contenidos"
            pathPrefix="testimonios"
            existingUrls={fotoUrl ? [fotoUrl] : []}
            onChange={(urls) => setFotoUrl(urls[0] ?? null)}
          />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Testimonio</h2>
        <FieldHelp id="texto" label="Texto del testimonio" help="Lo que dijo la persona sobre su experiencia con ISL Propiedades.">
          <textarea id="texto" rows={6} className={input} value={texto} onChange={(e) => setTexto(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Propiedad relacionada</h2>
        <FieldHelp id="propiedad_id" label="Propiedad (opcional)" help="Si el testimonio es sobre una propiedad específica, elígela acá.">
          <select id="propiedad_id" className={input} value={propiedadId} onChange={(e) => setPropiedadId(e.target.value)}>
            <option value="">Sin propiedad específica</option>
            {propiedades.map((prop) => (
              <option key={prop.id} value={prop.id}>{prop.titulo}</option>
            ))}
          </select>
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Estado</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
            />
            <span className="text-sm">Destacado (se ve primero en Home)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={publicado}
              onChange={(e) => setPublicado(e.target.checked)}
            />
            <span className="text-sm">Publicado (se ve en el sitio)</span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonISL type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </ButtonISL>
        <ButtonISL type="submit" disabled={saving}>
          {saving ? "Guardando…" : testimonio ? "Guardar cambios" : "Crear testimonio"}
        </ButtonISL>
      </div>
    </form>
  );
}
