import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { guardarLogo, eliminarLogo } from "../app/admin/(app)/ajustes/actions";
import { validarArchivoLogo, validarBytesPng } from "../lib/logo";
import { getSiteSettings } from "../lib/settings";

async function runTestSuite() {
  console.log("=========================================");
  console.log("   SUITE DE PRUEBAS: GESTIÓN DE LOGO     ");
  console.log("=========================================\n");

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message || err);
    }
  }

  async function asyncTest(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message || err);
    }
  }

  // 1. Verificación de Migraciones y Tipos
  test("1. La migración 0003_add_logo_to_site_settings.sql existe y es válida", () => {
    const migrationPath = path.join(process.cwd(), "supabase/migrations/0003_add_logo_to_site_settings.sql");
    assert(fs.existsSync(migrationPath), "El archivo de migración no existe");
    const sql = fs.readFileSync(migrationPath, "utf8");
    assert(sql.includes("alter table if exists public.site_settings add column if not exists logo text;"), "El SQL no añade la columna logo");
  });

  test("2. El tipo SiteSettings en types/isl.ts incluye 'logo: string | null'", () => {
    const typesPath = path.join(process.cwd(), "types/isl.ts");
    const code = fs.readFileSync(typesPath, "utf8");
    assert(code.includes("logo: string | null;"), "El tipo SiteSettings no contiene 'logo: string | null'");
  });

  // 2. Verificación de componentes de interfaz
  test("3. AjustesForm.tsx contiene la sección 'Logo del sitio web — ISL Propiedades'", () => {
    const formPath = path.join(process.cwd(), "components/admin/AjustesForm.tsx");
    const code = fs.readFileSync(formPath, "utf8");
    assert(code.includes("Logo del sitio web — ISL Propiedades"), "No se encontró el título de sección requerido");
    assert(code.includes("LogoSection"), "No se encontró el componente LogoSection");
    assert(code.includes("guardarLogo"), "No se encontró la llamada a guardarLogo");
    assert(code.includes("eliminarLogo"), "No se encontró la llamada a eliminarLogo");
    assert(code.includes("object-contain"), "El logo no tiene clase object-contain");
  });

  test("4. SiteHeader.tsx y SiteFooter.tsx soportan y renderizan el logo con object-contain", () => {
    const headerPath = path.join(process.cwd(), "components/isl/SiteHeader.tsx");
    const headerCode = fs.readFileSync(headerPath, "utf8");
    assert(headerCode.includes("logo?: string | null"), "SiteHeaderProps no incluye logo");
    assert(headerCode.includes("object-contain"), "SiteHeader no usa object-contain");

    const footerPath = path.join(process.cwd(), "components/isl/SiteFooter.tsx");
    const footerCode = fs.readFileSync(footerPath, "utf8");
    assert(footerCode.includes("logo?: string | null"), "SiteFooterProps no incluye logo");
    assert(footerCode.includes("object-contain"), "SiteFooter no usa object-contain");
  });

  test("5. AdminShell.tsx renderiza el logo en el panel administrativo", () => {
    const adminShellPath = path.join(process.cwd(), "components/admin/AdminShell.tsx");
    const adminShellCode = fs.readFileSync(adminShellPath, "utf8");
    assert(adminShellCode.includes("logo?: string | null"), "AdminShellProps no incluye logo");
    assert(adminShellCode.includes("object-contain"), "AdminShell no usa object-contain");
  });

  // 3. Verificación de Seguridad y Validaciones del Servidor
  await asyncTest("6. Usuarios sin sesión activa son rechazados al intentar guardar logo", async () => {
    // Generar un FormData vacío o con archivo falso sin cookies de auth
    const fd = new FormData();
    const fakeFile = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])], "test.png", { type: "image/png" });
    fd.append("logo", fakeFile);

    const result = await guardarLogo(fd);
    assert.strictEqual(result.ok, false);
    assert(result.error.includes("sesión") || result.error.includes("Tu sesión se cerró"), `Error inesperado: ${result.error}`);
  });

  await asyncTest("7. Usuarios sin sesión activa son rechazados al intentar eliminar logo", async () => {
    const result = await eliminarLogo();
    assert.strictEqual(result.ok, false);
    assert(result.error.includes("sesión") || result.error.includes("Tu sesión se cerró"), `Error inesperado: ${result.error}`);
  });

  // 4. Verificación de lectura de configuración
  await asyncTest("8. getSiteSettings() se ejecuta sin lanzar excepciones", async () => {
    const settings = await getSiteSettings();
    assert(settings !== undefined, "Settings no debería ser undefined");
    console.log("   (Configuración recuperada con éxito, logo actual:", settings?.logo || "ninguno / predeterminado)");
  });

  // 5. Verificación de Validaciones de Archivo (formato, tamaño, firma de bytes)
  test("9. Se rechazan archivos que no sean formato PNG (JPG, PDF, SVG)", () => {
    const jpgFile = new File([new Uint8Array([0xff, 0xd8, 0xff])], "foto.jpg", { type: "image/jpeg" });
    const resJpg = validarArchivoLogo(jpgFile);
    assert.strictEqual(resJpg.ok, false);
    assert(resJpg.error.includes("PNG"), "Debe indicar que solo se permiten PNG");

    const pdfFile = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "documento.pdf", { type: "application/pdf" });
    const resPdf = validarArchivoLogo(pdfFile);
    assert.strictEqual(resPdf.ok, false);
  });

  test("10. Se rechazan archivos que superen los 2 MB de tamaño", () => {
    const oversizedBytes = new Uint8Array(2 * 1024 * 1024 + 1); // 2 MB + 1 byte
    const largeFile = new File([oversizedBytes], "logo_gigante.png", { type: "image/png" });
    const resLarge = validarArchivoLogo(largeFile);
    assert.strictEqual(resLarge.ok, false);
    assert(resLarge.error.includes("2 MB"), "Debe indicar que supera el límite de 2 MB");
  });

  test("11. validarBytesPng valida correctamente la firma de bytes PNG", () => {
    const validPngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);
    assert.strictEqual(validarBytesPng(validPngBytes), true, "Debe aceptar bytes PNG válidos");

    const invalidBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00]); // GIF
    assert.strictEqual(validarBytesPng(invalidBytes), false, "Debe rechazar bytes que no sean de PNG");
  });

  test("12. Se acepta un archivo PNG válido menor a 2 MB", () => {
    const validBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x12, 0x34]);
    const validFile = new File([validBytes], "isl_logo.png", { type: "image/png" });
    const res = validarArchivoLogo(validFile);
    assert.strictEqual(res.ok, true);
  });

  console.log(`\n=========================================`);
  console.log(`   RESULTADOS: ${passed}/${total} pruebas superadas`);
  console.log(`=========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch((e) => {
  console.error("Error fatal en pruebas:", e);
  process.exit(1);
});
