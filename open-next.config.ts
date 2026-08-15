import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Configuración para asegurar que las variables públicas viajen en el build
  buildCommand: "npm run build",
});