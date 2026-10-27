import type { ReactNode } from "react";

type HeroMediaProps = {
  imageUrl?: string;
  previousImageUrl?: string;
  children?: ReactNode;
  className?: string;
};

export function HeroMedia({ imageUrl, previousImageUrl, children, className }: HeroMediaProps) {
  return (
    <section className={["relative isolate min-h-[34rem] overflow-hidden bg-isl-black md:min-h-screen", className].filter(Boolean).join(" ")}>
      {imageUrl ? (
        <img className="isl-kenburns absolute inset-0 size-full object-cover" src={imageUrl} alt="" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(198,168,124,0.35),transparent_35%),linear-gradient(135deg,#0A0A0A,#292521)]" aria-hidden="true" />
      )}
      {previousImageUrl ? (
        <img className="isl-cross-dissolve absolute inset-0 size-full object-cover" src={previousImageUrl} alt="" />
      ) : null}
      <div className="isl-hero-overlay absolute inset-0" aria-hidden="true" />
      {children ? <div className="relative z-10 flex min-h-[34rem] md:min-h-screen">{children}</div> : null}
    </section>
  );
}
