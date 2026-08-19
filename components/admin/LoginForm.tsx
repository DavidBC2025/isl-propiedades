"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const fieldClass = "min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 text-base text-isl-black";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");

    setSending(true);
    setStatus(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("El correo o la clave no coinciden. Intenta de nuevo.");
        return;
      }
      const next = searchParams.get("siguiente");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setStatus("No pudimos entrar. Intenta de nuevo en un momento.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm text-isl-black">Correo</span>
        <input name="email" type="email" required autoComplete="username" className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-isl-black">Clave</span>
        <input name="password" type="password" required autoComplete="current-password" className={fieldClass} />
      </label>
      <button
        type="submit"
        disabled={sending}
        className="min-h-11 w-full rounded-sm bg-isl-black px-5 text-xs font-medium uppercase tracking-[0.12em] text-isl-white disabled:opacity-50"
      >
        {sending ? "Entrando…" : "Entrar"}
      </button>
      {status ? <p role="status" className="text-sm text-isl-black/70">{status}</p> : null}
    </form>
  );
}
