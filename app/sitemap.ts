import type { MetadataRoute } from "next";
import { getPropiedadesPublicadas } from "@/lib/propiedades";
import { getBarriosPublicados } from "@/lib/barrios";
import { getArticulosPublicados } from "@/lib/articulos";
import { getPublicSiteUrl } from "@/lib/site";

const EXCLUDED_SECTIONS = ["/admin", "/api"];

export const revalidate = 3600; // 1 hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicSiteUrl();

  const [propiedades, barrios, articulos] = await Promise.all([
    getPropiedadesPublicadas({ pageSize: 1000 }),
    getBarriosPublicados(),
    getArticulosPublicados(),
  ]);

  const staticRoutes = [
    { href: "/", priority: 1.0, changeFrequency: "daily" as const },
    { href: "/propiedades", priority: 0.8, changeFrequency: "daily" as const },
    { href: "/nosotros", priority: 0.7, changeFrequency: "monthly" as const },
    { href: "/vender", priority: 0.7, changeFrequency: "monthly" as const },
    { href: "/tasacion", priority: 0.7, changeFrequency: "monthly" as const },
    { href: "/calculadora", priority: 0.6, changeFrequency: "monthly" as const },
    { href: "/barrios", priority: 0.7, changeFrequency: "weekly" as const },
    { href: "/guia", priority: 0.7, changeFrequency: "daily" as const },
  ];

  const dynamicRoutes = [
    ...propiedades.map((p) => ({
      url: `${baseUrl}/propiedades/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.created_at ?? Date.now()),
      priority: 0.9,
      changeFrequency: "daily" as const,
    })),
    ...barrios.map((b) => ({
      url: `${baseUrl}/barrios/${b.slug}`,
      lastModified: new Date(b.updated_at ?? b.created_at ?? Date.now()),
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
    ...articulos.map((a) => ({
      url: `${baseUrl}/guia/${a.slug}`,
      lastModified: new Date(a.updated_at ?? a.created_at ?? Date.now()),
      priority: 0.6,
      changeFrequency: "weekly" as const,
    })),
  ];

  const allRoutes = [
    ...staticRoutes.map((r) => ({
      url: `${baseUrl}${r.href}`,
      lastModified: new Date(),
      priority: r.priority,
      changeFrequency: r.changeFrequency,
    })),
    ...dynamicRoutes,
  ];

  // Filtrar rutas excluidas
  return allRoutes.filter((route) => !EXCLUDED_SECTIONS.some((excluded) => route.url.includes(excluded)));
}