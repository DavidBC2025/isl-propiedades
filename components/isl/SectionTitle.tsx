type SectionTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionTitle({ title, subtitle, className }: SectionTitleProps) {
  return (
    <header className={className}>
      {subtitle ? <p className="mb-3 text-xs font-medium uppercase tracking-widest text-isl-gray">{subtitle}</p> : null}
      <h2 className="font-serif text-3xl font-normal leading-tight text-isl-black md:text-4xl lg:text-5xl">{title}</h2>
    </header>
  );
}
