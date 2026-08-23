"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function HeroSlider({ propiedades }: { propiedades: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extraer las imágenes de las propiedades (o usar unas por defecto si no hay)
  const images = propiedades
    .map((p) => p.imagenes?.[0]?.url)
    .filter(Boolean);

  const fallbackImages = [
    '/images/hero-bg.jpg',
    '/images/stats-bg.jpg'
  ];

  const sliderImages = images.length > 0 ? images : fallbackImages;

  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, 6000); // Cambia cada 6 segundos

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-isl-black">
      {/* Slideshow de imágenes con transición suave */}
      {sliderImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out ${
            index === currentIndex ? "opacity-70 scale-100 z-10" : "opacity-0 scale-110 z-0"
          }`}
          style={{ backgroundImage: `url('${img}')` }}
        />
      ))}
      
      {/* Gradiente oscuro para que el texto sea legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-isl-black via-isl-black/50 to-isl-black/70 z-10" />

      {/* Contenido Frontal */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center mt-20">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-isl-gold mb-4 drop-shadow-md">
          Corretaje Boutique • Viña del Mar
        </p>
        <h1 className="font-serif text-5xl md:text-7xl font-normal tracking-tight mb-6 leading-tight text-white drop-shadow-lg">
          Exclusividad y Legado Inmobiliario
        </h1>
        <p className="font-light text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 tracking-wide drop-shadow-md">
          Especialistas en propiedades residenciales de alta gama, gestión de activos y asesoría patrimonial.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/propiedades"
            className="w-full sm:w-auto bg-isl-gold text-white px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-isl-black transition-all duration-500 shadow-2xl"
          >
            Explorar Propiedades
          </Link>
        </div>
      </div>
    </section>
  );
}