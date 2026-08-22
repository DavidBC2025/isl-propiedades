import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site";

export const revalidate = 86400; // 24 horas

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: [`${baseUrl}/sitemap.xml`],
  };
}