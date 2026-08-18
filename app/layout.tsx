import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${cormorantGaramond.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-isl-white antialiased">{children}</body>
    </html>
  );
}
