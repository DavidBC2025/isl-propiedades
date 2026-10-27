import Link from "next/link";
import { NAV_LINKS } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type SiteHeaderProps = {
  variant?: "overlay" | "solid";
  whatsapp?: string | null;
  logo?: string | null;
};

export function SiteHeader({ variant = "solid", whatsapp, logo }: SiteHeaderProps) {
  const overlay = variant === "overlay";
  const text = overlay ? "text-isl-white" : "text-isl-black";

  return (
    <header className={overlay ? "absolute inset-x-0 top-0 z-30" : "border-b border-isl-black/10 bg-transparent backdrop-blur-sm"}>
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-12 lg:px-16 ${text}`}>
        <Link href="/" className="inline-flex items-center bg-transparent" aria-label="ISL Propiedades - Inicio">
          {logo ? (
            <img
              src={logo}
              alt="ISL Propiedades"
              className="h-20 w-auto max-w-[calc(100vw-10rem)] bg-transparent object-contain transition-opacity duration-200 hover:opacity-90 md:max-w-[440px]"
            />
          ) : (
            <span className="font-serif text-4xl tracking-wide">ISL</span>
          )}
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.12em] lg:flex" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="relative inline-flex min-h-11 items-center after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-isl-gold after:transition-transform after:duration-300 hover:after:scale-x-100">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {whatsapp ? (
            <a
              href={buildWhatsAppLink(whatsapp, "Hola, me gustaría conversar con ISL Propiedades.")}
              target="_blank"
              rel="noreferrer"
              className={`hidden min-h-11 items-center rounded-sm px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] sm:inline-flex ${overlay ? "bg-isl-gold text-isl-black" : "bg-isl-black text-isl-white"}`}
            >
              WhatsApp
            </a>
          ) : null}
          <details className="relative lg:hidden">
            <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-sm border border-current px-3 text-xs font-medium uppercase tracking-[0.12em]">
              Menú
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-sm bg-isl-white p-3 text-isl-black shadow-lg">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="flex min-h-11 items-center px-2 text-sm transition-colors duration-200 hover:text-isl-gold">
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
