type PriceTagProps = {
  value: number | string | null | undefined;
  dark?: boolean;
  className?: string;
};

const ufFormatter = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });

export function PriceTag({ value, dark = false, className }: PriceTagProps) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const formattedValue = Number.isFinite(numericValue) ? ufFormatter.format(numericValue) : "—";

  return (
    <span className={[
      "font-sans text-lg font-medium tabular-nums",
      dark ? "text-isl-gold" : "text-isl-black",
      className,
    ].filter(Boolean).join(" ")}>
      UF {formattedValue}
    </span>
  );
}
