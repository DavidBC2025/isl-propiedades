type PriceTagProps = {
  value: number | string | null | undefined;
  dark?: boolean;
  size?: "md" | "lg";
  className?: string;
};

const ufFormatter = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });

export function PriceTag({ value, dark = false, size = "md", className }: PriceTagProps) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const formattedValue = Number.isFinite(numericValue) ? ufFormatter.format(numericValue) : "—";

  return (
    <span className={[
      "font-sans font-medium tabular-nums",
      size === "lg" ? "text-3xl md:text-4xl" : "text-lg",
      dark ? "text-isl-gold" : "text-isl-black",
      className,
    ].filter(Boolean).join(" ")}>
      UF {formattedValue}
    </span>
  );
}
