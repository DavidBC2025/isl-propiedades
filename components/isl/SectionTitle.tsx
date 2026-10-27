type SectionTitleProps = {
  title: string;
  subtitle?: string;
  accentWord?: string;
  className?: string;
};

export function SectionTitle({ title, subtitle, accentWord, className }: SectionTitleProps) {
  const accentIndex = accentWord ? title.indexOf(accentWord) : -1;

  return (
    <header className={className}>
      {subtitle ? <p className="mb-3 text-xs font-medium uppercase tracking-widest text-isl-gray">{subtitle}</p> : null}
      <h2 className="font-serif text-3xl font-normal leading-tight text-isl-black md:text-4xl lg:text-5xl">
        {accentIndex < 0 || !accentWord ? title : (
          <>
            {title.slice(0, accentIndex)}
            <span className="font-semibold text-isl-gold">{accentWord}</span>
            {title.slice(accentIndex + accentWord.length)}
          </>
        )}
      </h2>
    </header>
  );
}
