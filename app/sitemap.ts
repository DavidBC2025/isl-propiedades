import type { MetadataRoute } from "next";
import { getPropiedadesPublicadas } from "@/lib/propiedades";
import { getBarriosPublicados } from "@/lib/barrios";
import { getArticulosPublicados } from "@/lib/articulos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://islpropiedades.cl";

  const [propiedades, barrios, articulos] = await Promise.all([
    getPropiedadesPublicadas(),
    getBarriosPublicados(),
    getArticulosPublicados(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/propiedades`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/barrios`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guia`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/vender`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tasacion`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/calculadora`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const propiedadesPages: MetadataRoute.Sitemap = propiedades.map((prop) => ({
    url: `${baseUrl}/propiedades/${prop.slug}`,
    lastModified: prop.updated_at ? new Date(prop.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const barriosPages: MetadataRoute.Sitemap = barrios.map((barrio) => ({
    url: `${baseUrl}/barrios/${barrio.slug}`,
    lastModified: barrio.updated_at ? new Date(barrio.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articulosPages: MetadataRoute.Sitemap = articulos.map((art) => ({
    url: `${baseUrl}/guia/${art.slug}`,
    lastModified: art.updated_at ? new Date(art.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...propiedadesPages, ...barriosPages, ...articulosPages];
}
