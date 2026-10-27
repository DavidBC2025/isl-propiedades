import { ButtonISL } from "./ButtonISL";

type EmptyStateProps = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  dark?: boolean;
};

export function EmptyState({ title, description, ctaLabel, ctaHref, className, dark = false }: EmptyStateProps) {
  return (
    <section className={[
      "flex flex-col items-center px-6 py-12 text-center md:px-12",
      dark ? "border border-white/15 bg-black/35 text-isl-white" : "border border-isl-black/10 bg-isl-offwhite",
      className,
    ].filter(Boolean).join(" ")}>
      <h2 className={`font-serif text-3xl font-normal ${dark ? "text-isl-white" : "text-isl-black"}`}>{title}</h2>
      {description ? <p className={`mt-3 max-w-xl text-sm leading-6 ${dark ? "text-isl-white/75" : "text-isl-black/70"}`}>{description}</p> : null}
      {ctaLabel && ctaHref ? (
        <ButtonISL href={ctaHref} variant="outline" className="mt-7">{ctaLabel}</ButtonISL>
      ) : null}
    </section>
  );
}
