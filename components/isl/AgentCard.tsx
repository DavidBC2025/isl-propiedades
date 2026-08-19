import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Agente } from "@/types/isl";

type AgentCardProps = {
  agente: Agente;
  className?: string;
};

export function AgentCard({ agente, className }: AgentCardProps) {
  const fullName = [agente.nombre, agente.apellido].filter(Boolean).join(" ");
  const whatsappMessage = `Hola ${agente.nombre}, me gustaría conversar sobre una propiedad.`;

  return (
    <article className={["overflow-hidden rounded-sm bg-isl-offwhite", className].filter(Boolean).join(" ")}>
      <div className="aspect-[4/5] bg-isl-champagne/40">
        {agente.foto_url ? (
          <img src={agente.foto_url} alt={fullName} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-[linear-gradient(145deg,#E8DCC8,#F7F7F5)]" aria-label={`Foto de ${fullName} próximamente`}>
            <span className="font-serif text-6xl text-isl-black/40">{agente.nombre.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-serif text-3xl font-normal text-isl-black">{fullName}</h3>
          {agente.rol ? <p className="mt-1 text-xs font-medium uppercase tracking-widest text-isl-gray">{agente.rol}</p> : null}
        </div>
        {agente.especialidad ? <p className="text-sm leading-6 text-isl-black/70">{agente.especialidad}</p> : null}
        <div className="flex flex-wrap gap-3 text-sm">
          {agente.whatsapp ? <a href={buildWhatsAppLink(agente.whatsapp, whatsappMessage)} target="_blank" rel="noreferrer" className="min-h-11 rounded-sm bg-isl-black px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-isl-white">WhatsApp</a> : null}
          {agente.email ? <a href={`mailto:${agente.email}`} className="inline-flex min-h-11 items-center underline underline-offset-4">Correo</a> : null}
        </div>
      </div>
    </article>
  );
}
