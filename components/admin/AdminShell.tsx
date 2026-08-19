"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cerrarSesion } from "@/app/admin/(app)/actions";
import { ADMIN_NAV } from "@/lib/admin-copy";

type AdminShellProps = {
  greeting: string;
  consultasNuevas: number;
  children: ReactNode;
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ greeting, consultasNuevas, children }: AdminShellProps) {
  const pathname = usePathname();

  const links = ADMIN_NAV.map((item) => {
    const active = isActive(pathname, item.href);
    const showBadge = "badgeKey" in item && item.badgeKey === "consultas" && consultasNuevas > 0;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={[
          "flex min-h-11 items-center justify-between gap-3 rounded-sm px-3 text-sm",
          active ? "bg-isl-black text-isl-white" : "text-isl-black/80 hover:bg-isl-offwhite",
        ].join(" ")}
      >
        <span>{item.label}</span>
        {showBadge ? (
          <span className="min-w-6 rounded-sm bg-isl-gold px-1.5 text-center text-[11px] font-medium text-isl-black">
            {consultasNuevas}
          </span>
        ) : null}
      </Link>
    );
  });

  return (
    <div className="min-h-screen bg-isl-offwhite">
      <header className="flex items-center justify-between gap-3 border-b border-isl-black/10 bg-isl-white px-4 py-3 lg:hidden">
        <p className="font-serif text-xl">ISL</p>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="text-sm underline-offset-4 hover:underline">
            Ver el sitio
          </a>
          <details className="relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-sm border border-isl-black/20 px-3 text-xs font-medium uppercase tracking-[0.12em]">
              Menú
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-sm bg-isl-white p-2 shadow-lg">
              {links}
            </div>
          </details>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden min-h-screen flex-col border-r border-isl-black/10 bg-isl-white px-4 py-6 lg:flex">
          <p className="font-serif text-2xl">ISL</p>
          <p className="mt-2 text-sm text-isl-black/70">{greeting}</p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline"
          >
            Ver el sitio
          </a>
          <nav className="mt-8 flex flex-col gap-1" aria-label="Administración">
            {links}
          </nav>
          <form action={cerrarSesion} className="mt-auto pt-8">
            <button type="submit" className="min-h-11 text-sm text-isl-black/70 underline-offset-4 hover:underline">
              Cerrar sesión
            </button>
          </form>
        </aside>

        <div className="px-4 py-8 md:px-8 lg:px-12">
          <div className="mb-8 hidden items-center justify-between gap-4 lg:flex">
            <p className="text-sm text-isl-black/70">{greeting}</p>
            <a href="/" target="_blank" rel="noreferrer" className="text-sm underline-offset-4 hover:underline">
              Ver el sitio
            </a>
          </div>
          {children}
          <form action={cerrarSesion} className="mt-12 lg:hidden">
            <button type="submit" className="min-h-11 text-sm underline-offset-4 hover:underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
