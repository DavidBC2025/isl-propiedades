import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vlwrtlnqczncrpwqjrvn.supabase.co",
      },
    ],
  },

  // Configuración para permitir subir archivos de hasta 2MB en Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Configuración de headers para seguridad
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin"
          },
        ],
      },
    ];
  },
};

export default nextConfig;