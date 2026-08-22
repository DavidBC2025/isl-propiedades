import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-isl-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-isl-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ISL Propiedades",
    default: "ISL Propiedades",
  },
  description: "Corredora boutique de propiedades en Viña del Mar",
  openGraph: {
    siteName: "ISL Propiedades",
    locale: "es_CL",
    type: "website",
  },
};

async function getJsonLd() {
  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://islpropiedades.cl";

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ISL Propiedades",
    "description": "Corredora boutique de propiedades en Viña del Mar",
    "url": baseUrl,
    "logo": `${baseUrl}/favicon.ico`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Viña del Mar",
      "addressRegion": "Valparaíso",
      "addressCountry": "CL",
    },
    "telephone": settings?.whatsapp_general || undefined,
    "email": settings?.email_general || undefined,
    "sameAs": [],
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ISL Propiedades",
    "description": "Corredora boutique de propiedades en Viña del Mar",
    "url": baseUrl,
    "telephone": settings?.whatsapp_general || undefined,
    "email": settings?.email_general || undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Viña del Mar",
      "addressRegion": "Valparaíso",
      "addressCountry": "CL",
    },
  };

  return JSON.stringify([organizationData, localBusinessData]);
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = await getJsonLd();

  return (
    <html
      lang="es"
      className={`${cormorantGaramond.variable} ${inter.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <body className="min-h-full bg-isl-white antialiased">{children}</body>
    </html>
  );
}
