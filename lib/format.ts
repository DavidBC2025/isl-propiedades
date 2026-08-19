export function formatUF(value: number | string | null | undefined): string {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? `UF ${new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(amount)}` : "UF —";
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatComuna(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .toLocaleLowerCase("es-CL")
    .split(/\s+/)
    .map((word) => word.charAt(0).toLocaleUpperCase("es-CL") + word.slice(1))
    .join(" ");
}
