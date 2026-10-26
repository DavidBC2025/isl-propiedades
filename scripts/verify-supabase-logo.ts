import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

async function verifySupabase() {
  console.log("=================================================");
  console.log("  VERIFICACIÓN EN TIEMPO REAL: SUPABASE & LOGO  ");
  console.log("=================================================\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variables de entorno faltantes en .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Verificar existencia del bucket contenidos
  console.log("1. Verificando acceso al bucket 'contenidos'...");
  const { data: listContenidos, error: listError } = await supabase.storage.from("contenidos").list();
  if (listError) {
    console.error("   ❌ Error al acceder al bucket contenidos:", listError.message);
  } else {
    console.log("   ✅ Bucket 'contenidos' existe y responde correctamente.");
    console.log("   Carpetas/archivos en raíz:", listContenidos.map((item) => item.name).join(", "));
  }

  // 2. Verificar carpeta branding en contenidos
  console.log("\n2. Verificando ruta 'branding/' en bucket 'contenidos'...");
  const { data: listBranding, error: brandingError } = await supabase.storage.from("contenidos").list("branding");
  if (brandingError) {
    console.error("   ❌ Error al consultar 'branding/':", brandingError.message);
  } else {
    console.log("   ✅ Carpeta 'branding/' accesible.");
    console.log("   Archivos actuales en 'branding/':", listBranding.length > 0 ? listBranding.map(f => f.name).join(", ") : "(vacía, no hay logo aún)");
  }

  // 3. Verificar que usuarios no autenticados (anon) NO puedan subir archivos a contenidos
  console.log("\n3. Verificando políticas RLS de almacenamiento (seguridad)...");
  const dummyBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const { data: unauthorizedUpload, error: unauthError } = await supabase.storage
    .from("contenidos")
    .upload("branding/unauthorized-test.png", dummyBuffer, { upsert: true });

  if (unauthError) {
    console.log("   ✅ RLS de Storage protege correctamente: usuario anónimo rechazado.");
    console.log("      Mensaje del servidor:", unauthError.message);
  } else {
    console.warn("   ⚠️ ALERTA: Usuario anónimo pudo subir archivo. Limpiando...");
    await supabase.storage.from("contenidos").remove(["branding/unauthorized-test.png"]);
  }

  // 4. Verificar URL pública de storage
  console.log("\n4. Verificando generación y resolución de URL pública de Storage...");
  const publicUrl = supabase.storage.from("contenidos").getPublicUrl("branding/logo.png").data.publicUrl;
  console.log("   URL pública esperada:", publicUrl);

  try {
    const res = await fetch(publicUrl, { method: "HEAD" });
    console.log(`   Estado HTTP al consultar URL de logo: ${res.status} (${res.status === 404 ? "404 esperado mientras no se haya subido un logo" : res.statusText})`);
  } catch (err: any) {
    console.warn("   Aviso al consultar URL:", err.message);
  }

  // 5. Verificar esquema de la tabla site_settings
  console.log("\n5. Verificando tabla 'site_settings' en PostgreSQL...");
  const { data: settingsRow, error: settingsError } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (settingsError) {
    console.error("   ❌ Error al consultar site_settings:", settingsError.message);
  } else {
    console.log("   ✅ Tabla 'site_settings' encontrada con ID 1.");
    const columns = Object.keys(settingsRow || {});
    console.log("   Columnas actuales en base de datos:", columns.join(", "));
    const hasLogoCol = "logo" in (settingsRow || {});
    if (hasLogoCol) {
      console.log("   ✅ La columna 'logo' YA EXISTE en site_settings.");
    } else {
      console.log("   ⚠️ La columna 'logo' AÚN NO EXISTE en site_settings (migración 0003 pendiente en SQL Editor).");
    }
  }

  // 6. Verificar compatibilidad del SQL de la migración 0003
  console.log("\n6. Verificando archivo de migración 0003...");
  const migrationPath = "supabase/migrations/0003_add_logo_to_site_settings.sql";
  const migrationSql = fs.readFileSync(migrationPath, "utf8").trim();
  console.log("   Archivo:", migrationPath);
  console.log("   Sentencia SQL a ejecutar en Supabase SQL Editor:");
  console.log("   --------------------------------------------------");
  console.log("  ", migrationSql);
  console.log("   --------------------------------------------------");

  console.log("\n=================================================");
  console.log("       DIAGNÓSTICO DE SUPABASE COMPLETADO        ");
  console.log("=================================================\n");
}

verifySupabase().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
