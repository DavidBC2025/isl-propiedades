"use client";

import { ButtonISL } from "@/components/isl/ButtonISL";
import { useComparador } from "@/lib/useComparador";

export function CompareBar() {
  const { selected, items, notice, toggle, clear } = useComparador();

  if (selected.length === 0) return null;

  const href = `/comparar?slugs=${encodeURIComponent(selected.join(","))}`;

  return (
    <>
      <div className="h-28" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-isl-black/10 bg-isl-white/95 shadow-[0_-8px_30px_rgba(10,10,10,0.08)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-12 lg:px-16">
          <div className="flex items-center gap-3 overflow-x-auto">
            {selected.map((slug) => {
              const item = items[slug];
              return (
                <div key={slug} className="flex shrink-0 items-center gap-2 rounded-sm bg-isl-offwhite pr-1">
                  <div className="size-12 overflow-hidden bg-isl-champagne/50">
                    {item?.imagen ? (
                      <img src={item.imagen} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-end p-1 font-serif text-sm text-isl-black/40">ISL</span>
                    )}
                  </div>
                  <p className="max-w-[9rem] truncate text-xs text-isl-black">{item?.titulo ?? slug}</p>
                  <button
                    type="button"
                    onClick={() => toggle(slug)}
                    className="flex size-11 items-center justify-center text-isl-black/60 hover:text-isl-black"
                    aria-label={`Quitar ${item?.titulo ?? slug} de la comparación`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {notice ? (
              <p role="status" className="text-sm text-isl-black/75">{notice}</p>
            ) : null}
            <ButtonISL href={href} size="sm">Comparar ({selected.length})</ButtonISL>
            <ButtonISL type="button" variant="ghost" size="sm" onClick={clear}>Vaciar selección</ButtonISL>
          </div>
        </div>
      </div>
    </>
  );
}
