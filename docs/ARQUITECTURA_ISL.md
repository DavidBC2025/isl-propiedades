# Arquitectura ISL Propiedades

> Documento vivo de la serie. Actualizado en el Prompt 1. Esta auditoría se hizo
> solamente con el contenido del repositorio; no se consultó la base de datos ni
> el panel de Supabase.

## Estado actual

Aplicación Next.js 16.3.1 con App Router, React 19, TypeScript estricto y
Tailwind CSS v4. El proyecto usa OpenNext para ejecutarse como Cloudflare Worker.
La interfaz actual es una página de catálogo muy pequeña y no existe un área de
administración, autenticación, API propia ni componentes reutilizables.

## Rutas y layouts

| Ruta | Archivo | Estado |
| --- | --- | --- |
| `/` | `app/page.tsx` | Página pública. Consulta propiedades y las muestra en tarjetas. |
| Global | `app/layout.tsx` | Layout raíz, fuentes Geist y metadatos actuales de plantilla. |
| Global | `app/globals.css` | Importa Tailwind y declara variables globales. |

No se detectaron rutas dinámicas, grupos de rutas, route handlers (`app/api`),
`middleware.ts`, páginas de error personalizadas ni rutas de autenticación.

## Componentes existentes

No existe una carpeta `components/` ni componentes UI extraídos. `app/page.tsx`
contiene directamente el encabezado, los estados de error/vacío y la tarjeta de
propiedad. `app/layout.tsx` es el único layout.

## Datos y Supabase

### Esquema real detectable

No hay migraciones, tipos generados, SQL ni acceso remoto configurado para
inspeccionar el esquema real. La única tabla referenciada por código es
`Propiedades` (P mayúscula), consultada con `select('*')` en `app/page.tsx`.
Los campos inferidos por el renderizado son `id`, `titulo`, `descripcion`,
`operacion`, `precio`, `tipo`, `habitaciones` y `banos`. No se pudieron confirmar
tipos, claves, relaciones, RLS, buckets ni datos existentes.

El contrato nuevo usa `propiedades` en minúscula, como se define en
`supabase/migrations/0001_isl_init.sql`. PostgreSQL/PostgREST distingue el
identificador existente con mayúscula si fue creado entre comillas: la migración
no renombra ni copia la posible tabla `Propiedades`, para no poner en riesgo datos
ni modificar la página actual. Antes de que futuros prompts consuman el contrato
nuevo, revisar en SQL Editor si ambas tablas coexisten y decidir una migración de
datos explícita si hubiera registros reales.

### Cliente y flujo de acceso

- `app/page.tsx` crea un cliente de `@supabase/supabase-js` en el servidor y
  consulta `Propiedades`.
- `lib/supabase.ts` exporta otro cliente con las mismas variables, pero no se usa
  actualmente. No fue modificado.
- `@supabase/ssr` está instalado, sin uso actual.
- No hay flujo de Auth, comprobación de sesión, roles ni usuarios administradores
  implementados. La migración no modifica `auth.users`; deja la escritura de
  contenido para el rol `authenticated`.

### Variables de entorno detectadas

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Sus valores no se documentan. El build también carga un archivo `.env.local` con
estos mismos nombres. `.dev.vars` y `app/wrangler.jsonc` contienen la
configuración de Supabase y están versionados según Git. Aunque la clave anon es
pública por diseño, centralizar la configuración y no versionar valores de
entorno evita errores operativos. No se detectaron variables de correo, service
role ni otros proveedores.

### Medios y correo

No existe integración de Supabase Storage, buckets, carga de archivos, `next/image`
ni rutas para servir medios. Tampoco se detectó Resend, SendGrid, Nodemailer ni
otra integración de envío de correo.

### Límite de archivos

No se pudo determinar el límite remoto de Supabase Storage desde el repositorio.
Se adopta **50 MB como supuesto conservador**, no como capacidad confirmada del
proyecto. La migración configura ese límite únicamente al crear los buckets
`propiedades` y `contenidos`; si ya existieran, no los altera. El Prompt 3 debe
mostrar 50 MB como límite operativo hasta confirmarlo en el panel de Supabase.

## Dependencias y configuración crítica

- Runtime: `next` 16.3.1, `react`/`react-dom` 19.2.8.
- Datos: `@supabase/supabase-js` 2.112.3 y `@supabase/ssr` 0.12.4.
- Estilos: Tailwind CSS 4 mediante `@tailwindcss/postcss`.
- Despliegue: `@opennextjs/cloudflare` y Wrangler 4.
- `next.config.ts` no tiene opciones personalizadas.
- `open-next.config.ts` usa la configuración base; la caché incremental R2 está
  comentada.
- `wrangler.jsonc` raíz apunta a `.open-next/worker.js`, configura assets,
  `nodejs_compat`, `global_fetch_strictly_public`, binding de autorreferencia e
  Images binding. Su fecha de compatibilidad es 2026-08-15.
- `app/wrangler.jsonc` parece una segunda configuración con variables y
  observabilidad, pero los scripts ejecutados desde la raíz usan el archivo raíz.
  La divergencia debe resolverse antes de desplegar.

## Tablas: existente versus pendiente

| Estado | Tabla |
| --- | --- |
| Detectada solo por referencia de código; no confirmada remotamente | `Propiedades` |
| Pendiente de aplicar en SQL Editor | `agentes`, `propiedades`, `hero_slides`, `casos_preparacion`, `articulos`, `testimonios`, `leads`, `barrios`, `alertas`, `site_settings` |

Los buckets `propiedades` y `contenidos` también quedan pendientes de aplicar con
la migración. La migración es aditiva y no se ejecuta desde la aplicación.

## Riesgos y consideraciones antes de cambiar el sitio

1. **Tabla con nombre distinto:** la página vigente usa `Propiedades`; el contrato
   futuro crea `propiedades`. No asumir equivalencia ni borrar la tabla original.
2. **Datos sin tipado:** `select('*')` y `any` impiden detectar cambios de schema.
3. **Sin límites de catálogo:** la consulta no filtra, ordena ni pagina; no escala
   para un catálogo real.
4. **Render siempre dinámico:** `force-dynamic` evita caché en cada visita. Los
   prompts públicos posteriores deben preferir `revalidate` si es compatible con
   el adaptador de Cloudflare.
5. **Credenciales/configuración duplicadas:** `.dev.vars` y `app/wrang.jsonc`
   contienen configuración de Supabase y se encuentran trackeados; no se deben
   añadir secretos de servidor allí.
6. **Artefactos de build versionados:** `.open-next/` está en Git. Puede inflar el
   repositorio y hacer que cambios generados oculten cambios reales de código.
7. **Configuración de Worker incompleta para operación:** observabilidad está en
   `app/wrang.jsonc`, no en la configuración raíz usada por los scripts. Revisar
   ese único punto antes del despliegue; no se modificó en este prompt.
8. **Contenido y SEO de plantilla:** idioma raíz `en`, metadata de create-next-app,
   iconos de plantilla y README genérico. El Prompt 2 en adelante puede corregirlo
   sin inventar contenido.

## Plan de la serie de 15 prompts

1. Auditoría y datos — **completado**
2. Sistema de diseño — **completado**
3. Motor de fotos y video
4. Componentes de contenido y datos
5. Home
6. Catálogo y comparador
7. Leads y notificaciones
8. Ficha de propiedad
9. Admin: estructura y panel
10. Admin: propiedades
11. Admin: hero y agentes
12. Admin: barrios, guía y testimonios
13. Admin: consultas y ajustes
14. Páginas comerciales y barrios públicos
15. Guía pública, calculadora y SEO final

## Prompt 2 — Sistema de diseño

Se creó la base visual ISL sin modificar la página de catálogo ni la integración
con Supabase. `app/globals.css` incorpora la paleta ISL, tokens de Tailwind,
tipografías globales, utilidades de sección, overlay, estados de carga de medios,
foco visible y animaciones que respetan `prefers-reduced-motion`. El layout raíz
usa Cormorant Garamond para titulares e Inter para UI mediante `next/font/google`,
además de metadata en español.

Se añadieron `Container`, `SectionTitle`, `ButtonISL`, `PriceTag` y `EmptyState`
en `components/isl/`, más los límites de carga y error globales. `PriceTag`
presenta precios solo como UF con separador chileno. El dorado `#C6A87C` sobre
negro `#0A0A0A` tiene contraste aproximado 9.29:1, superior a WCAG AA para texto.
