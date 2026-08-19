"use client";

import { type FormEvent, useState } from "react";

type AlertasFormValues = {
  email?: string;
  comuna?: string;
  operacion?: string;
  tipo?: string;
  precio_max_uf?: string;
};

const fieldClass = "min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-base text-isl-black";

export function AlertasForm({ values }: { values?: AlertasFormValues }) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) return;

    setIsSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/alertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      setStatus(response.ok ? "Listo. Te avisamos si aparece algo con ese criterio." : result?.message ?? "No pudimos guardar tu alerta. Intenta de nuevo.");
      if (response.ok) form.reset();
    } catch {
      setStatus("No pudimos guardar tu alerta. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">No completar</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="block space-y-1">
        <span className="text-sm text-isl-black">Correo</span>
        <input name="email" type="email" required defaultValue={values?.email} className={fieldClass} autoComplete="email" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-isl-black">Comuna</span>
        <input name="comuna" defaultValue={values?.comuna} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-isl-black">Operación</span>
        <select name="operacion" defaultValue={values?.operacion ?? ""} className={fieldClass}>
          <option value="">Cualquiera</option>
          <option value="venta">Venta</option>
          <option value="arriendo">Arriendo</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-isl-black">Tipo</span>
        <select name="tipo" defaultValue={values?.tipo ?? ""} className={fieldClass}>
          <option value="">Cualquiera</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="parcela">Parcela</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-isl-black">UF hasta</span>
        <input name="precio_max_uf" type="number" min={0} inputMode="numeric" defaultValue={values?.precio_max_uf} className={fieldClass} />
      </label>
      <p className="text-xs leading-5 text-isl-black/65">Te escribimos solo si aparece una propiedad que calce. Puedes darte de baja cuando quieras.</p>
      <button type="submit" disabled={isSending} className="min-h-11 rounded-sm bg-isl-black px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-isl-white disabled:opacity-50">
        {isSending ? "Guardando…" : "Avísame"}
      </button>
      {status ? <p className="text-sm text-isl-black/70" role="status">{status}</p> : null}
    </form>
  );
}
