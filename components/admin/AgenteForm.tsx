"use client";

import { useState } from "react";
import { guardarAgente } from "@/app/admin/(app)/agentes/actions";
import { FieldHelp, fieldClassName } from "@/components/admin/FieldHelp";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { MediaUploader } from "@/components/isl/MediaUploader";
import type { Agente } from "@/types/isl";

type AgenteFormProps = {
  agente?: Agente | null;
  onCancel: () => void;
  onDone: () => void;
};

export function AgenteForm({ agente, onCancel, onDone }: AgenteFormProps) {
  const [nombre, setNombre] = useState(agente?.nombre ?? "");
  const [apellido, setApellido] = useState(agente?.apellido ?? "");
  const [rol, setRol] = useState(agente?.rol ?? "");
  const [bio, setBio] = useState(agente?.bio ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(agente?.foto_url ?? null);
  const [email, setEmail] = useState(agente?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(agente?.whatsapp ?? "");
  const [especialidad, setEspecialidad] = useState(agente?.especialidad ?? "");
  const [activo, setActivo] = useState(agente?.activo ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const result = await guardarAgente({
      id: agente?.id,
      nombre,
      apellido,
      rol,
      bio,
      foto_url: fotoUrl,
      email,
      whatsapp,
      especialidad,
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
        <h2 className="font-serif text-3xl font-normal">Foto</h2>
        <FieldHelp id="foto" label="Foto de perfil" help="Sube una foto profesional. Se recomienda que sea cuadrada y con buena iluminación.">
          <MediaUploader
            kind="image"
            bucket="contenidos"
            pathPrefix="agentes"
            existingUrls={fotoUrl ? [fotoUrl] : []}
            onChange={(urls) => setFotoUrl(urls[0] ?? null)}
          />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Información personal</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldHelp id="nombre" label="Nombre" help="El nombre con el que te presentas a los clientes.">
            <input id="nombre" className={input} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </FieldHelp>
          <FieldHelp id="apellido" label="Apellido" help="Tu apellido.">
            <input id="apellido" className={input} value={apellido} onChange={(e) => setApellido(e.target.value)} />
          </FieldHelp>
        </div>
        <FieldHelp id="rol" label="Rol" help="Por ejemplo: Corredora, Agente Comercial.">
          <input id="rol" className={input} value={rol} onChange={(e) => setRol(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="bio" label="Biografía" help="Un breve texto sobre ti. Cuentales a los clientes quién eres y qué haces.">
          <textarea id="bio" rows={4} className={input} value={bio} onChange={(e) => setBio(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Contacto</h2>
        <FieldHelp id="email" label="Email" help="Tu correo electrónico de contacto.">
          <input id="email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </FieldHelp>
        <FieldHelp id="whatsapp" label="WhatsApp" help="Tu número de WhatsApp. Los clientes podrán escribirte con un clic.">
          <input id="whatsapp" type="tel" className={input} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Especialidad</h2>
        <FieldHelp id="especialidad" label="Especialidad" help="Por ejemplo: Propiedades de lujo, Departamentos en Viña del Mar.">
          <input id="especialidad" className={input} value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
        </FieldHelp>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl font-normal">Estado</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
          <span className="text-sm">Activo (se ve en el sitio)</span>
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonISL type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </ButtonISL>
        <ButtonISL type="submit" disabled={saving}>
          {saving ? "Guardando…" : agente ? "Guardar cambios" : "Crear agente"}
        </ButtonISL>
      </div>
    </form>
  );
}