"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonISL } from "@/components/isl/ButtonISL";
import { Container } from "@/components/isl/Container";
import { HeroMedia } from "@/components/isl/HeroMedia";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import type { HomeHeroSlide } from "@/lib/home";

export type { HomeHeroSlide };

type HomeHeroProps = {
  slides: HomeHeroSlide[];
  coverCount: number;
};

export function HomeHero({ slides, coverCount }: HomeHeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [previousImageUrl, setPreviousImageUrl] = useState<string | undefined>();
  const indexRef = useRef(0);
  const seenIndexesRef = useRef(new Set<number>([0]));
  const transitionTimer = useRef<number | null>(null);
  const canRotate = slides.length > 1;
  const current = slides[Math.min(index, slides.length - 1)] ?? slides[0];

  const transitionTo = useCallback((nextIndex: number) => {
    const currentIndex = indexRef.current;
    if (nextIndex === currentIndex) return;
    setPreviousImageUrl(reducedMotion ? undefined : slides[currentIndex]?.imageUrl);
    indexRef.current = nextIndex;
    seenIndexesRef.current.add(nextIndex);
    setIndex(nextIndex);
    if (reducedMotion) return;
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      setPreviousImageUrl(undefined);
      transitionTimer.current = null;
    }, 1000);
  }, [reducedMotion, slides]);

  useEffect(() => {
    if (!canRotate) return;
    const timer = window.setInterval(() => {
      const currentIndex = indexRef.current;
      let candidates = Array.from({ length: slides.length }, (_, slideIndex) => slideIndex)
        .filter((slideIndex) => slideIndex !== currentIndex && !seenIndexesRef.current.has(slideIndex));

      if (candidates.length === 0) {
        seenIndexesRef.current = new Set([currentIndex]);
        candidates = Array.from({ length: slides.length }, (_, slideIndex) => slideIndex)
          .filter((slideIndex) => slideIndex !== currentIndex);
      }

      const coverCandidates = candidates.filter((slideIndex) => slideIndex < coverCount);
      const galleryCandidates = candidates.filter((slideIndex) => slideIndex >= coverCount);
      const preferredCandidates = Math.random() < 0.75 ? coverCandidates : galleryCandidates;
      const availableCandidates = preferredCandidates.length > 0
        ? preferredCandidates
        : [...coverCandidates, ...galleryCandidates];
      const nextIndex = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
      if (nextIndex !== undefined) transitionTo(nextIndex);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [canRotate, coverCount, slides.length, transitionTo]);

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  if (!current) return null;

  return (
    <div className="relative">
      <HeroMedia
        key={current.id}
        imageUrl={current.imageUrl}
        previousImageUrl={previousImageUrl}
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
                  onClick={() => transitionTo(slideIndex)}
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
