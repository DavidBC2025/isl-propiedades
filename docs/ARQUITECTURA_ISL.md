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
3. Motor de fotos y video — **completado**
4. Componentes de contenido y datos — **completado**
5. Home — **completado**
6. Catálogo y comparador — **completado**
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

## Prompt 3 — Motor de fotos y video

Se añadieron `lib/media.ts` y `lib/whatsapp.ts` como fuentes únicas para
interpretar videos y construir enlaces de WhatsApp. `lib/image-client.ts` procesa
fotos solo en el navegador: intenta convertir HEIC a JPEG con `heic2any`, limita
el lado mayor a 2000 px, comprime a WebP/JPEG y genera una miniatura de 400 px.
Si HEIC no se puede convertir, el flujo sigue y muestra una orientación simple
para configurar el iPhone en modo Más compatible.

`MediaUploader` centraliza fotos individuales/múltiples, video, PDF, cámara móvil,
orden y portada de fotos, alternativa YouTube/Vimeo, aviso operativo de 50 MB,
indicador de actividad y subida a Supabase Storage. Sus miniaturas se guardan en
la carpeta `thumbnails` bajo el mismo prefijo. `HeroMedia` usa `parseVideoUrl`,
incluye video directo o embed, overlay, fallback y Ken Burns de 8 segundos que
respeta `prefers-reduced-motion`. Se instaló únicamente `heic2any`.

## Prompt 4 — Componentes de contenido y capa de datos

Se tipó el contrato público en `types/isl.ts` (Agente, Propiedad, HeroSlide,
CasoPreparacion, Articulo con `es_reporte`/`archivo_pdf_url`, Testimonio, Lead con
`notificado`/`notificado_en`, Barrio, Alerta, SiteSettings con `como_trabajamos`)
alineado a `supabase/migrations/0001_isl_init.sql`.

Tarjetas y formulario, sin páginas nuevas: `ListingCard` (4:5, overlay, PriceTag,
link a `/propiedades/[slug]`, placeholder si no hay foto), `AgentCard` (WhatsApp
vía `buildWhatsAppLink()`), `LeadForm` (honeypot, `hiddenFields`/`extraFields`,
consentimiento, inputs 16px y botones ≥44px). `/api/leads` es un stub 501 hasta
el Prompt 7.

Capa de datos con el cliente de `lib/supabase.ts`, try/catch y `[]`/`null` si
falla o no hay tabla: `lib/propiedades.ts` (join `agente:agentes(*)` en una sola
consulta), `lib/agentes.ts`, `lib/hero.ts`, `lib/articulos.ts`, `lib/barrios.ts`,
`lib/testimonios.ts`, `lib/settings.ts`, `lib/casos-preparacion.ts`.
`lib/format.ts` aporta `formatUF`, `slugify` y `formatComuna`. `createLead` queda
tipado en `lib/leads.ts` sin envío de correo todavía.

Se creó `docs/DESIGN.md` (tokens, ritmo de Home, motion 500ms/8s, bloques,
patrones de video/WhatsApp/EmptyState, copy local). `.isl-fade-up` pasó a 500ms
para coincidir con ese documento. `PriceTag` acepta `null` para `precio_uf`.
La página de catálogo vigente no se reemplazó.

## Prompt 5 — Home

`app/page.tsx` deja de consultar `Propiedades` y pasa a ser el Home público con el
ritmo de `docs/DESIGN.md`: hero, selección curada, buscador GET a `/propiedades`,
mirada ISL, por qué, CTA vender, guía, testimonios (solo si hay datos) y
newsletter. `generateMetadata` usa título absoluto y description desde
`site_settings` o un fallback fijo. `revalidate = 120` reemplaza `force-dynamic`.

Hero: `HomeHero` + `HeroMedia`. Carrusel por fade de `hero_slides` activos; con
`prefers-reduced-motion` o un solo slide no rota. Fallback a
`getPropiedadPrincipal()` y, si no hay nada, marca + headline de settings.
CTAs por defecto: Ver propiedades / Quiero vender (`/vender`).

Cero datos: selección y guía usan `EmptyState`; testimonios se omiten; el hero
nunca queda en blanco. Buscador nativo `method="get"` con `comuna`, `operacion`,
`tipo`, `precio_min_uf`, `precio_max_uf` (el catálogo los lee en el Prompt 6).

Layout de sitio: `SiteHeader` (overlay en Home) y `SiteFooter` con nav a rutas
aún no construidas, contacto desde `email_general` / `whatsapp_general` y año
dinámico. Newsletter: `LeadForm` tipo `newsletter` y solo el campo correo.

## Prompt 6 — Catálogo y comparador

`app/propiedades/page.tsx` es el catálogo público. Lee `comuna`, `operacion`,
`tipo`, `precio_min` / `precio_min_uf`, `precio_max` / `precio_max_uf`,
`dormitorios` y `page` desde `searchParams` (`lib/catalogo.ts`). El Home sigue
enviando `precio_min_uf` y `precio_max_uf`; ambos nombres funcionan. La barra
reutiliza `QuickSearch` con los valores actuales y el campo extra de dormitorios.

La grilla usa `ListingCard` con `enableCompare={true}`. Paginación por `?page=N`
en el servidor (12 por página, enlaces `<a>`). Cero resultados: `EmptyState` e
invitación a `/alertas` con los filtros precargados (ruta del Prompt 7).

`getPropiedadesPublicadas` acepta `page` / `pageSize`. Se añadieron
`countPropiedadesPublicadas` y `getPropiedadesPorSlugs` (respeta el orden de los
slugs).

Comparador 100% en el navegador: `lib/useComparador.ts` guarda slugs en
`localStorage` bajo `isl:comparar`, máximo 3. La 4.ª no se agrega y muestra
«Puedes comparar hasta 3 propiedades a la vez». `ListingCard` no se reescribió:
ganó `enableCompare` y un checkbox hermano del link (`CompareToggle`) para no
anidar controles dentro del `<a>`. `CompareBar` flota abajo en Home y catálogo.

`app/comparar/page.tsx` lee `?slugs=a,b,c`. Menos de 2 slugs válidos: EmptyState.
2 o 3: tabla comparativa (UF, comuna, sector, dormitorios, baños, m², gastos
comunes UF, orientación, vista) con `overflow-x-auto` en mobile.

