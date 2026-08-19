"use client";

import { useEffect, useState } from "react";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { Container } from "@/components/isl/Container";
import { HeroMedia } from "@/components/isl/HeroMedia";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import type { HomeHeroSlide } from "@/lib/home";

export type { HomeHeroSlide };

type HomeHeroProps = {
  slides: HomeHeroSlide[];
};

export function HomeHero({ slides }: HomeHeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const canRotate = !reducedMotion && slides.length > 1;
  const current = slides[Math.min(index, slides.length - 1)] ?? slides[0];

  useEffect(() => {
    if (!canRotate) return;
    const timer = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [canRotate, slides.length]);

  if (!current) return null;

  return (
    <div className="relative">
      <HeroMedia
        key={current.id}
        imageUrl={current.imageUrl}
        videoUrl={current.videoUrl}
        autoPlayVideo={!reducedMotion}
      >
        <Container className="flex w-full flex-col justify-end pb-16 pt-28 md:pb-24">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-isl-gold">ISL Propiedades</p>
          <h1 className="max-w-3xl font-serif text-4xl font-normal leading-tight text-isl-white md:text-6xl lg:text-7xl">
            {current.titulo}
          </h1>
          {current.subtitulo ? (
            <p className="mt-5 max-w-xl text-base leading-7 text-isl-white/85 md:text-lg">{current.subtitulo}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonISL href={current.ctaPrimario.href} variant="inverse">
              {current.ctaPrimario.label}
            </ButtonISL>
            <ButtonISL
              href={current.ctaSecundario.href}
              variant="outline"
              className="border-isl-white text-isl-white hover:bg-isl-white hover:text-isl-black"
            >
              {current.ctaSecundario.label}
            </ButtonISL>
          </div>
          {canRotate ? (
            <div className="mt-10 flex gap-2" role="tablist" aria-label="Slides del hero">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === index}
                  aria-label={`Mostrar slide ${slideIndex + 1}`}
                  className="flex min-h-11 min-w-11 items-center justify-center"
                  onClick={() => setIndex(slideIndex)}
                >
                  <span className={`block h-2 w-8 rounded-full ${slideIndex === index ? "bg-isl-gold" : "bg-isl-white/40"}`} />
                </button>
              ))}
            </div>
          ) : null}
        </Container>
      </HeroMedia>
    </div>
  );
}
