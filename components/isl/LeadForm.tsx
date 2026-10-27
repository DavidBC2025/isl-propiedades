"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import type { LeadTipo } from "@/types/isl";

type LeadFormProps = {
  tipo: LeadTipo;
  propiedadId?: string;
  agenteId?: string;
  extraFields?: ReactNode;
  hiddenFields?: string[];
  submitLabel?: string;
  className?: string;
  appearance?: "light" | "dark";
  onSuccess?: () => void;
};

export function LeadForm({ tipo, propiedadId, agenteId, extraFields, hiddenFields = [], submitLabel, className, appearance = "light", onSuccess }: LeadFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isHidden = (name: string) => hiddenFields.includes(name);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());

    if (values.website) return;

    setIsSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tipo, propiedad_id: propiedadId ?? null, agente_id: agenteId ?? null, origen_url: window.location.href }),
      });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      setStatus(response.ok ? "Gracias, te contactaremos pronto." : result?.message ?? "No pudimos enviar tu mensaje. Intenta de nuevo.");
      if (response.ok) {
        form.reset();
        onSuccess?.();
      }
    } catch {
      setStatus("No pudimos enviar tu mensaje. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  }

  const isDark = appearance === "dark";
  const inputClass = `min-h-12 w-full rounded-sm border px-3 py-2 text-base transition-colors duration-300 focus:border-isl-gold focus:outline-none ${
    isDark
      ? "border-white/20 bg-white/5 text-white placeholder:text-white/45"
      : "border-isl-black/20 bg-isl-white text-isl-black placeholder:text-isl-gray"
  }`;
  const labelClass = isDark ? "text-sm text-white/75" : "text-sm text-isl-black";

  return (
    <form onSubmit={handleSubmit} className={["space-y-4", className].filter(Boolean).join(" ")}>
      <div className="sr-only" aria-hidden="true"><label htmlFor="website">No completar</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      {isHidden("nombre") ? <input type="hidden" name="nombre" value={tipo === "newsletter" ? "Newsletter" : "Consulta"} /> : <label className="block space-y-1"><span className={labelClass}>Nombre</span><input name="nombre" required className={inputClass} autoComplete="name" /></label>}
      {!isHidden("email") ? <label className="block space-y-1"><span className={labelClass}>Correo</span><input name="email" type="email" required={tipo === "newsletter"} className={inputClass} autoComplete="email" /></label> : null}
      {!isHidden("telefono") ? <label className="block space-y-1"><span className={labelClass}>Teléfono</span><input name="telefono" type="tel" className={inputClass} autoComplete="tel" /></label> : null}
      {!isHidden("mensaje") ? <label className="block space-y-1"><span className={labelClass}>Mensaje</span><textarea name="mensaje" rows={4} className={inputClass} /></label> : null}
      {extraFields}
      <p className={`text-xs leading-5 ${isDark ? "text-white/70" : "text-isl-black/65"}`}>Al enviar, autorizas que te contactemos sobre esta solicitud.</p>
      <button type="submit" disabled={isSending} className="min-h-12 rounded-sm bg-isl-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.12em] text-isl-black transition duration-300 hover:-translate-y-0.5 hover:bg-isl-champagne disabled:opacity-50">{isSending ? "Enviando…" : submitLabel ?? (tipo === "newsletter" ? "Quiero enterarme" : "Enviar consulta")}</button>
      {status ? <p className={`text-sm ${isDark ? "text-white/85" : "text-isl-black/70"}`} role="status">{status}</p> : null}
    </form>
  );
}
