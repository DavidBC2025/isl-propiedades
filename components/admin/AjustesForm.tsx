"use client";

import { useState } from "react";
import {
  guardarGeneral,
  guardarCalculadora,
  guardarComoTrabajamos,
  guardarCasoPreparacion,
  eliminarCasoPreparacion,
} from "@/app/admin/(app)/ajustes/actions";
import { FieldHelp, fieldClassName } from "@/components/admin/FieldHelp";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { MediaUploader } from "@/components/isl/MediaUploader";
import type { CasoPreparacion, Propiedad, SiteSettings } from "@/types/isl";

function SectionWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-isl-black/10 bg-isl-white p-8">
      <h2 className="font-serif text-2xl font-normal text-isl-black">{title}</h2>
      {children}
    </section>
  );
}

function SaveButton({ onClick, saving, label }: { onClick: () => void; saving: boolean; label: string }) {
  return (
    <ButtonISL type="button" onClick={onClick} disabled={saving}>
      {saving ? "Guardandoâ€¦" : label}
    </ButtonISL>
  );
}

export function AjustesForm({ settings, propiedades, casos }: { settings: SiteSettings | null; propiedades: Propiedad[]; casos: CasoPreparacion[] }) {
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <GeneralSection settings={settings} setAviso={setAviso} />
      <CalculadoraSection settings={settings} setAviso={setAviso} />
      <ComoTrabajamosSection settings={settings} setAviso={setAviso} />
      <CasosPreparacionSection casos={casos} propiedades={propiedades} setAviso={setAviso} />
      {aviso ? <p role="status" className="border border-isl-gold/40 bg-isl-champagne/40 px-4 py-3 text-sm">{aviso}</p> : null}
    </div>
  );
}

function GeneralSection({ settings, setAviso }: { settings: SiteSettings | null; setAviso: (msg: string | null) => void }) {
  const [homeHeadline, setHomeHeadline] = useState(settings?.home_headline ?? "");
  const [homeSubheadline, setHomeSubheadline] = useState(settings?.home_subheadline ?? "");
  const [emailGeneral, setEmailGeneral] = useState(settings?.email_general ?? "");
  const [whatsappGeneral, setWhatsappGeneral] = useState(settings?.whatsapp_general ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await guardarGeneral({
      home_headline: homeHeadline || null,
      home_subheadline: homeSubheadline || null,
      email_general: emailGeneral || null,
      whatsapp_general: whatsappGeneral || null,
    });
    setSaving(false);
    setAviso(result.ok ? "Listo, quedÃ³ guardada la secciÃ³n General." : result.error);
  }

  return (
    <SectionWrapper title="General">
      <div className="space-y-6">
        <FieldHelp id="home_headline" label="Titular de portada" help="El grande que se ve en la primera pantalla del sitio.">
          <input id="home_headline" className={fieldClassName} value={homeHeadline} onChange={(e) => setHomeHeadline(e.target.value)} maxLength={80} />
        </FieldHelp>

        <FieldHelp id="home_subheadline" label="SubtÃ­tulo de portada" help="El texto mÃ¡s chico debajo del titular.">
          <input id="home_subheadline" className={fieldClassName} value={homeSubheadline} onChange={(e) => setHomeSubheadline(e.target.value)} maxLength={160} />
        </FieldHelp>

        <FieldHelp id="email_general" label="Correo general" help="DÃ³nde llegan las consultas y notificaciones del sitio.">
          <input id="email_general" type="email" className={fieldClassName} value={emailGeneral} onChange={(e) => setEmailGeneral(e.target.value)} />
        </FieldHelp>

        <FieldHelp id="whatsapp_general" label="WhatsApp general" help="NÃºmero de WhatsApp del equipo ISL (formato +569xxxxxxxx o 569xxxxxxxx).">
          <input id="whatsapp_general" className={fieldClassName} value={whatsappGeneral} onChange={(e) => setWhatsappGeneral(e.target.value)} />
        </FieldHelp>
      </div>
      <div className="mt-8 flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Guardar general" />
      </div>
    </SectionWrapper>
  );
}

function CalculadoraSection({ settings, setAviso }: { settings: SiteSettings | null; setAviso: (msg: string | null) => void }) {
  const [ufValorManual, setUfValorManual] = useState(settings?.uf_valor_manual ?? "");
  const [calcComision, setCalcComision] = useState(settings?.calc_comision_porcentaje ?? "");
  const [calcGastosEscritura, setCalcGastosEscritura] = useState(settings?.calc_gastos_escritura_uf ?? "");
  const [calcPiePorcentaje, setCalcPiePorcentaje] = useState(settings?.calc_pie_porcentaje ?? "");
  const [disclaimer, setDisclaimer] = useState(settings?.disclaimer_calculadora ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await guardarCalculadora({
      uf_valor_manual: ufValorManual ? Number(ufValorManual) : null,
      calc_comision_porcentaje: calcComision ? Number(calcComision) : null,
      calc_gastos_escritura_uf: calcGastosEscritura ? Number(calcGastosEscritura) : null,
      calc_pie_porcentaje: calcPiePorcentaje ? Number(calcPiePorcentaje) : null,
      disclaimer_calculadora: disclaimer || null,
    });
    setSaving(false);
    setAviso(result.ok ? "Listo, quedÃ³ guardada la secciÃ³n Calculadora." : result.error);
  }

  return (
    <SectionWrapper title="Calculadora">
      <div className="space-y-6">
        <FieldHelp id="uf_valor_manual" label="UF (valor manual)" help="Si lo dejas vacÃ­o, el sitio busca el valor de UF automÃ¡ticamente.">
          <input id="uf_valor_manual" type="number" step="0.01" className={fieldClassName} value={ufValorManual} onChange={(e) => setUfValorManual(e.target.value)} />
        </FieldHelp>

        <FieldHelp id="calc_comision_porcentaje" label="ComisiÃ³n ISL (%)" help="Porcentaje que cobra ISL sobre el precio de la propiedad.">
          <input id="calc_comision_porcentaje" type="number" step="0.1" className={fieldClassName} value={calcComision} onChange={(e) => setCalcComision(e.target.value)} />
        </FieldHelp>

        <FieldHelp id="calc_gastos_escritura_uf" label="Gastos de escritura (UF)" help="Gastos fijos de la escritura, expresados en UF. Ej: 4 o 5.">
          <input id="calc_gastos_escritura_uf" type="number" step="0.1" className={fieldClassName} value={calcGastosEscritura} onChange={(e) => setCalcGastosEscritura(e.target.value)} />
        </FieldHelp>

        <FieldHelp id="calc_pie_porcentaje" label="Pie de forma (%)" help="Porcentaje que el comprador necesita aportar como pie.">
          <input id="calc_pie_porcentaje" type="number" step="0.1" className={fieldClassName} value={calcPiePorcentaje} onChange={(e) => setCalcPiePorcentaje(e.target.value)} />
        </FieldHelp>

        <FieldHelp id="disclaimer_calculadora" label="Disclaimer" help="Texto pequeÃ±o que aparece al pie de la calculadora.">
          <textarea id="disclaimer_calculadora" rows={3} className={fieldClassName} value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} maxLength={500} />
        </FieldHelp>
      </div>
      <div className="mt-8 flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Guardar calculadora" />
      </div>
    </SectionWrapper>
  );
}

function ComoTrabajamosSection({ settings, setAviso }: { settings: SiteSettings | null; setAviso: (msg: string | null) => void }) {
  const [items, setItems] = useState<Array<{ titulo: string; texto: string }>>(
    settings?.como_trabajamos?.length ? settings.como_trabajamos : [{ titulo: "", texto: "" }],
  );
  const [saving, setSaving] = useState(false);

  function addItem() {
    setItems([...items, { titulo: "", texto: "" }]);
  }

  function updateItem(index: number, field: "titulo" | "texto", value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removeItem(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const trimmed = items.map((item) => ({ titulo: item.titulo.trim(), texto: item.texto.trim() })).filter((item) => item.titulo || item.texto);
    if (trimmed.length === 0) {
      setAviso("AgregÃ¡ al menos un Ã­tem.");
      return;
    }
    setSaving(true);
    const result = await guardarComoTrabajamos({ como_trabajamos: trimmed });
    setSaving(false);
    setAviso(result.ok ? "Listo, quedÃ³ guardada la secciÃ³n CÃ³mo trabajamos." : result.error);
  }

  return (
    <SectionWrapper title="CÃ³mo trabajamos">
      <div className="space-y-4">
        <p className="text-sm text-isl-black/70">Se muestra como una lista de pasos en la pÃ¡gina de inicio.</p>
        {items.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-1 space-y-4">
              <FieldHelp id={`como-titulo-${index}`} label="TÃ­tulo" help="Un resumen corto del paso. Ej: Primera visita.">
                <input
                  id={`como-titulo-${index}`}
                  className={fieldClassName}
                  value={item.titulo}
                  onChange={(e) => updateItem(index, "titulo", e.target.value)}
                  maxLength={60}
                />
              </FieldHelp>
              <FieldHelp id={`como-texto-${index}`} label="Texto" help="La explicaciÃ³n del paso.">
                <textarea
                  id={`como-texto-${index}`}
                  rows={3}
                  className={fieldClassName}
                  value={item.texto}
                  onChange={(e) => updateItem(index, "texto", e.target.value)}
                  maxLength={300}
                />
              </FieldHelp>
            </div>
            {items.length > 1 ? (
              <button type="button" onClick={() => removeItem(index)} className="min-h-9 self-start text-sm text-red-600 hover:text-red-700">
                âœ•
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={addItem} className="min-h-9 text-sm text-isl-black/70 underline-offset-4 hover:underline">
          + Agregar paso
        </button>
      </div>
      <div className="mt-8 flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Guardar cÃ³mo trabajamos" />
      </div>
    </SectionWrapper>
  );
}

function CasoPreparacionForm({
  caso,
  propiedades,
  onCancel,
  onDone,
}: {
  caso?: CasoPreparacion | null;
  propiedades: Propiedad[];
  onCancel: () => void;
  onDone: () => void;
}) {
  const [imagenAntes, setImagenAntes] = useState<string>(caso?.imagen_antes ?? "");
  const [imagenDespues, setImagenDespues] = useState<string>(caso?.imagen_despues ?? "");
  const [descripcionCorta, setDescripcionCorta] = useState<string>(caso?.descripcion_corta ?? "");
  const [propiedadId, setPropiedadId] = useState<string>(caso?.propiedad_id ?? "");
  const [publicado, setPublicado] = useState<boolean>(caso?.publicado ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const result = await guardarCasoPreparacion({
      id: caso?.id,
      imagen_antes: imagenAntes,
      imagen_despues: imagenDespues,
      descripcion_corta: descripcionCorta || null,
      propiedad_id: propiedadId || null,
      publicado,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {error ? <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}

      <FieldHelp id="imagen_antes" label="Foto antes" help="La imagen delantes de la preparaciÃ³n.">
        <MediaUploader
          kind="image"
          bucket="contenidos"
          pathPrefix="casos-preparacion"
          existingUrls={imagenAntes ? [imagenAntes] : []}
          onChange={(urls) => setImagenAntes(urls[0] ?? "")}
        />
      </FieldHelp>

      <FieldHelp id="imagen_despues" label="Foto despuÃ©s" help="La imagen del despuÃ©s de la preparaciÃ³n.">
        <MediaUploader
          kind="image"
          bucket="contenidos"
          pathPrefix="casos-preparacion"
          existingUrls={imagenDespues ? [imagenDespues] : []}
          onChange={(urls) => setImagenDespues(urls[0] ?? "")}
        />
      </FieldHelp>

      <FieldHelp id="descripcion_corta" label="DescripciÃ³n corta" help="Un texto breve que acompaÃ±a las fotos.">
        <textarea id="descripcion_corta" rows={3} className={fieldClassName} value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)} maxLength={300} />
      </FieldHelp>

      <FieldHelp id="propiedad_id" label="Propiedad relacionada (opcional)" help="Si este caso corresponde a una propiedad publicada, asÃ³ciala acÃ¡.">
        <select id="propiedad_id" className={fieldClassName} value={propiedadId} onChange={(e) => setPropiedadId(e.target.value)}>
          <option value="">Sin propiedad</option>
          {propiedades.map((prop) => (
            <option key={prop.id} value={prop.id}>{prop.titulo}</option>
          ))}
        </select>
      </FieldHelp>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
        <span className="text-sm">Publicado (se ve en el sitio)</span>
      </label>

      <div className="flex gap-3">
        <ButtonISL type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </ButtonISL>
        <ButtonISL type="submit" disabled={saving}>
          {saving ? "Guardandoâ€¦" : caso ? "Guardar cambios" : "Crear caso"}
        </ButtonISL>
      </div>
    </form>
  );
}

function CasosPreparacionSection({
  casos: initialCasos,
  propiedades,
  setAviso,
}: {
  casos: CasoPreparacion[];
  propiedades: Propiedad[];
  setAviso: (msg: string | null) => void;
}) {
  const [casos, setCasos] = useState<CasoPreparacion[]>(initialCasos);
  const [editing, setEditing] = useState<CasoPreparacion | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // We load casos_preparacion from settings prop if available, otherwise via client state
  // Since the server already passes settings (which does NOT include casos), we need
  // the client to manage casos list. The page server component passes casos via props.

  async function handleEliminar(id: string) {
    if (!confirm("Â¿Seguro que querÃ©s eliminar este caso? No se puede deshacer.")) return;
    setDeletingId(id);
    const result = await eliminarCasoPreparacion(id);
    setDeletingId(null);
    setAviso(result.ok ? "Listo, se eliminÃ³ el caso." : result.error);
  }

  function handleEdit(caso: CasoPreparacion) {
    setEditing(caso);
  }

  function handleNew() {
    setEditing(null);
  }

  function handleDone() {
    setEditing(null);
    setAviso("Listo, caso guardado.");
  }

  return (
    <SectionWrapper title="Casos antes / despuÃ©s">
      <div className="space-y-4">
        <p className="text-sm text-isl-black/70">
          Fotos de propiedades que transformaste con la preparaciÃ³n ISL. Cada caso necesita una foto "antes" y una "despuÃ©s".
        </p>

        {casos.length === 0 && !editing ? (
          <p className="text-sm text-isl-black/50">AÃºn no hay casos. Â¡EmpezÃ¡ uno!</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-isl-black/10 text-xs uppercase tracking-widest text-isl-gray">
                <th className="px-4 py-3 font-medium">Foto antes</th>
                <th className="px-4 py-3 font-medium">Foto despuÃ©s</th>
                <th className="px-4 py-3 font-medium">DescripciÃ³n</th>
                <th className="px-4 py-3 font-medium">Publicado</th>
                <th className="px-4 py-3 font-medium">AcciÃ³n</th>
              </tr>
            </thead>
            <tbody>
              {casos.map((caso) => (
                <tr key={caso.id} className="border-t border-isl-black/10 align-top">
                  <td className="px-4 py-3">
                    {caso.imagen_antes ? <img src={caso.imagen_antes} alt="Antes" className="h-16 w-16 object-cover" /> : <span className="text-xs text-isl-black/40">â€”</span>}
                  </td>
                  <td className="px-4 py-3">
                    {caso.imagen_despues ? <img src={caso.imagen_despues} alt="DespuÃ©s" className="h-16 w-16 object-cover" /> : <span className="text-xs text-isl-black/40">â€”</span>}
                  </td>
                  <td className="px-4 py-3 max-w-xs text-isl-black/80">{caso.descripcion_corta ?? "â€”"}</td>
                  <td className="px-4 py-3">{caso.publicado ? "SÃ­" : "No"}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleEdit(caso)} className="text-xs text-isl-black/70 underline-offset-4 hover:underline">
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(caso.id)}
                      disabled={deletingId === caso.id}
                      className="ml-2 text-xs text-red-600 hover:text-red-700"
                    >
                      {deletingId === caso.id ? "Eliminandoâ€¦" : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {editing ? (
          <CasoPreparacionForm caso={editing} propiedades={propiedades} onCancel={() => setEditing(null)} onDone={handleDone} />
        ) : (
          <button type="button" onClick={handleNew} className="text-sm text-isl-black/70 underline-offset-4 hover:underline">
            + Nuevo caso
          </button>
        )}
      </div>
    </SectionWrapper>
  );
}
