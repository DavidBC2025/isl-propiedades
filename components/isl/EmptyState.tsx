import { ButtonISL } from "./ButtonISL";

type EmptyStateProps = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

export function EmptyState({ title, description, ctaLabel, ctaHref, className }: EmptyStateProps) {
  return (
    <section className={[
      "flex flex-col items-center border border-isl-black/10 bg-isl-offwhite px-6 py-12 text-center md:px-12",
      className,
    ].filter(Boolean).join(" ")}>
      <h2 className="font-serif text-3xl font-normal text-isl-black">{title}</h2>
      {description ? <p className="mt-3 max-w-xl text-sm leading-6 text-isl-black/70">{description}</p> : null}
      {ctaLabel && ctaHref ? (
        <ButtonISL href={ctaHref} variant="outline" className="mt-7">{ctaLabel}</ButtonISL>
      ) : null}
    </section>
  );
}
