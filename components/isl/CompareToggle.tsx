"use client";

import { useComparador, type CompareSnapshot } from "@/lib/useComparador";

type CompareToggleProps = {
  snapshot: CompareSnapshot;
};

export function CompareToggle({ snapshot }: CompareToggleProps) {
  const { isSelected, toggle } = useComparador();
  const selected = isSelected(snapshot.slug);

  return (
    <label className="absolute right-3 top-3 z-10 flex min-h-11 items-center gap-1.5 rounded-sm bg-isl-white/95 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-isl-black">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => toggle(snapshot.slug, snapshot)}
        className="size-3.5 accent-isl-gold"
        aria-label={`Comparar ${snapshot.titulo}`}
      />
      Comparar
    </label>
  );
}
