import type { MetadataRoute } from "next";

// manifest.ts para Next.js - debe exportar como valor serializable
const manifestData: MetadataRoute.Manifest = {
  name: "ISL Propiedades",
  short_name: "ISL Propiedades",
  description: "Corredora boutique de propiedades en Viña del Mar",
  start_url: "/",
  display: "standalone",
  background_color: "#F7F7F5",
  theme_color: "#0A0A0A",
  icons: [
    {
      src: "/favicon.ico",
      sizes: "any",
      type: "image/x-icon",
    },
  ],
};

export default manifestData;