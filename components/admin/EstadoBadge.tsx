import { ESTADO_PROPIEDAD } from "@/lib/admin-copy";

const TONE: Record<string, string> = {
  borrador: "bg-zinc-200 text-zinc-700",
  publicada: "bg-emerald-100 text-emerald-800",
  reservada: "bg-amber-100 text-amber-900",
  vendida: "bg-sky-100 text-sky-800",
  despublicada: "bg-red-100 text-red-800",
};

export function EstadoBadge({ estado }: { estado: string | null }) {
  const key = estado ?? "";
  return (
    <span className={`inline-flex rounded-sm px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${TONE[key] ?? "bg-zinc-100 text-zinc-600"}`}>
      {ESTADO_PROPIEDAD[key] ?? "Sin estado"}
    </span>
  );
}
