import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-isl-offwhite px-6 py-16">
      <div className="w-full max-w-md border border-isl-black/10 bg-isl-white p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">ISL Propiedades</p>
        <h1 className="mt-3 font-serif text-4xl font-normal text-isl-black">Hola, entra cuando quieras</h1>
        <p className="mt-3 text-sm leading-6 text-isl-black/70">
          Este espacio es para Silvia e Ivannia. Si no recuerdas tu clave, pídele a quien administra el sitio que te la reenvíe.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-isl-black/60">Cargando…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
