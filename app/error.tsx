"use client";

import { ButtonISL } from "@/components/isl/ButtonISL";

export default function GlobalError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-isl-offwhite px-6 text-center">
      <div className="max-w-md">
        <p className="text-xs font-medium uppercase tracking-widest text-isl-gray">ISL Propiedades</p>
        <h1 className="mt-4 text-4xl font-normal text-isl-black">Algo no salió como esperábamos</h1>
        <p className="mt-4 text-sm leading-6 text-isl-black/70">Por favor, vuelve al inicio e inténtalo nuevamente.</p>
        <ButtonISL href="/" className="mt-8">Volver al inicio</ButtonISL>
      </div>
    </main>
  );
}
