import Link from "next/link";
import { Container } from "@/components/isl/Container";
import { NAV_LINKS } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type SiteFooterProps = {
  email?: string | null;
  whatsapp?: string | null;
};

export function SiteFooter({ email, whatsapp }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-isl-black/10 bg-isl-black text-isl-white">
      <Container className="grid gap-10 py-16 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl">ISL Propiedades</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-isl-white/70">
            Corredora boutique en Viña del Mar. Silvia e Ivannia, con criterio y trato directo.
          </p>
        </div>
        <nav aria-label="Pie de página" className="grid grid-cols-2 gap-2 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 text-sm">
          {email ? (
            <a href={`mailto:${email}`} className="block min-h-11 underline-offset-4 hover:underline">
              {email}
            </a>
          ) : null}
          {whatsapp ? (
            <a
              href={buildWhatsAppLink(whatsapp, "Hola, me gustaría conversar con ISL Propiedades.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
            >
              WhatsApp
            </a>
          ) : null}
          <p className="text-isl-white/55">Viña del Mar, Chile</p>
        </div>
      </Container>
      <Container className="border-t border-isl-white/10 py-6 text-xs text-isl-white/50">
        <p>© {year} ISL Propiedades · Silvia e Ivannia</p>
      </Container>
    </footer>
  );
}
