"use client";

import { useCallback, useEffect, useId, useRef, useState, type TouchEvent } from "react";
import { parseVideoUrl } from "@/lib/media";
import { sortImagenes } from "@/lib/ficha";
import type { Propiedad } from "@/types/isl";

type GalleryItem =
  | { kind: "image"; url: string; alt: string }
  | { kind: "video"; url: string; alt: string };

type FichaGaleriaProps = {
  propiedad: Propiedad;
};

function buildItems(propiedad: Propiedad): GalleryItem[] {
  const items: GalleryItem[] = sortImagenes(propiedad.imagenes).map((image) => ({
    kind: "image",
    url: image.url,
    alt: image.alt || propiedad.titulo,
  }));
  if (propiedad.video_url?.trim()) {
    items.push({ kind: "video", url: propiedad.video_url.trim(), alt: `Video de ${propiedad.titulo}` });
  }
  return items;
}

function Placeholder() {
  return (
    <div className="flex size-full min-h-[20rem] items-end bg-[linear-gradient(145deg,#E8DCC8,#F7F7F5)] p-6" aria-label="Propiedad sin fotografía">
      <span className="font-serif text-5xl text-isl-black/40">ISL</span>
    </div>
  );
}

function VideoFrame({ url, title }: { url: string; title: string }) {
  const parsed = parseVideoUrl(url);
  if (parsed.kind === "file") {
    return <video className="size-full bg-isl-black object-contain" src={url} controls playsInline />;
  }
  if ((parsed.kind === "youtube" || parsed.kind === "vimeo") && parsed.embedUrl) {
    return (
      <iframe
        className="size-full border-0"
        src={parsed.embedUrl}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <div className="flex size-full items-center justify-center bg-isl-black p-6 text-center text-sm text-isl-white/80">
      No pudimos reproducir este video acá.
    </div>
  );
}

export function FichaGaleria({ propiedad }: FichaGaleriaProps) {
  const items = buildItems(propiedad);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const labelId = useId();
  const current = items[active];

  const go = useCallback((next: number) => {
    if (items.length === 0) return;
    setActive((next + items.length) % items.length);
  }, [items.length]);

  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive((index) => (index + 1) % Math.max(items.length, 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive((index) => (index - 1 + items.length) % Math.max(items.length, 1));
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button, [href], video, iframe, [tabindex]:not([tabindex='-1'])")].filter((node) => !node.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close, items.length]);

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchX.current;
    const end = event.changedTouches[0]?.clientX;
    touchX.current = null;
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? active + 1 : active - 1);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-sm bg-isl-offwhite">
        <button
          type="button"
          className="relative block aspect-[4/3] w-full overflow-hidden bg-isl-champagne/40"
          onClick={() => current && setOpen(true)}
          aria-label={current ? `Ver ${current.alt} en grande` : "Galería"}
        >
          {!current ? (
            <Placeholder />
          ) : current.kind === "image" ? (
            <img src={current.url} alt={current.alt} className="size-full object-cover transition duration-300 motion-reduce:transition-none" />
          ) : (
            <div className="relative size-full">
              {items[0]?.kind === "image" ? (
                <img src={items[0].url} alt="" className="size-full object-cover" />
              ) : (
                <Placeholder />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-isl-black/40">
                <span className="flex size-16 items-center justify-center rounded-full bg-isl-gold text-2xl text-isl-black" aria-hidden>▶</span>
              </span>
            </div>
          )}
        </button>
      </div>

      {items.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {items.map((item, index) => (
            <button
              key={`${item.kind}-${item.url}-${index}`}
              type="button"
              onClick={() => {
                setActive(index);
                if (item.kind === "video") setOpen(true);
              }}
              className={[
                "relative size-20 shrink-0 overflow-hidden rounded-sm border",
                index === active ? "border-isl-gold" : "border-transparent",
              ].join(" ")}
              aria-label={item.kind === "video" ? "Ver video" : `Ver foto ${index + 1}`}
              aria-current={index === active}
            >
              {item.kind === "image" ? (
                <img src={item.url} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center bg-isl-black text-isl-gold" aria-hidden>▶</span>
              )}
            </button>
          ))}
        </div>
      ) : null}

      {open && current ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          className="fixed inset-0 z-50 flex items-center justify-center bg-isl-black/92 p-4"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <p id={labelId} className="sr-only">{current.alt}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-sm bg-isl-white text-isl-black"
            aria-label="Cerrar galería"
          >
            ×
          </button>
          {items.length > 1 ? (
            <>
              <button type="button" className="absolute left-4 top-1/2 z-10 min-h-11 min-w-11 -translate-y-1/2 rounded-sm bg-isl-white/90 text-isl-black" onClick={() => go(active - 1)} aria-label="Anterior">←</button>
              <button type="button" className="absolute right-16 top-1/2 z-10 min-h-11 min-w-11 -translate-y-1/2 rounded-sm bg-isl-white/90 text-isl-black md:right-4" onClick={() => go(active + 1)} aria-label="Siguiente">→</button>
            </>
          ) : null}
          <div className="flex max-h-[90vh] w-full max-w-5xl items-center justify-center">
            {current.kind === "image" ? (
              <img src={current.url} alt={current.alt} className="max-h-[90vh] w-full object-contain" />
            ) : (
              <div className="aspect-video w-full max-w-4xl">
                <VideoFrame url={current.url} title={current.alt} />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
