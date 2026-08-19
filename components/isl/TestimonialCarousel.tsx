"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import type { Testimonio } from "@/types/isl";

type TestimonialCarouselProps = {
  testimonios: Testimonio[];
};

export function TestimonialCarousel({ testimonios }: TestimonialCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const canRotate = !reducedMotion && testimonios.length > 1;
  const current = testimonios[Math.min(index, testimonios.length - 1)];

  useEffect(() => {
    if (!canRotate) return;
    const timer = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % testimonios.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [canRotate, testimonios.length]);

  function goTo(nextIndex: number) {
    setIndex((nextIndex + testimonios.length) % testimonios.length);
  }

  if (!current) return null;

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Testimonios"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") goTo(index + 1);
        if (event.key === "ArrowLeft") goTo(index - 1);
      }}
    >
      <figure className="mx-auto max-w-3xl text-center">
        {current.foto_url ? (
          <img src={current.foto_url} alt="" className="mx-auto mb-6 size-16 rounded-full object-cover" />
        ) : null}
        <blockquote className="font-serif text-2xl font-normal leading-snug text-isl-black md:text-4xl">
          “{current.texto}”
        </blockquote>
        <figcaption className="mt-6 text-sm text-isl-black/70">
          <span className="font-medium text-isl-black">{current.nombre}</span>
          {current.rol_ciudad ? ` · ${current.rol_ciudad}` : ""}
        </figcaption>
      </figure>
      {testimonios.length > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button type="button" className="min-h-11 min-w-11 rounded-sm border border-isl-black/20 px-3 text-sm" onClick={() => goTo(index - 1)} aria-label="Testimonio anterior">
            ←
          </button>
          <p className="text-xs uppercase tracking-[0.12em] text-isl-gray" aria-live="polite">
            {index + 1} / {testimonios.length}
          </p>
          <button type="button" className="min-h-11 min-w-11 rounded-sm border border-isl-black/20 px-3 text-sm" onClick={() => goTo(index + 1)} aria-label="Testimonio siguiente">
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
