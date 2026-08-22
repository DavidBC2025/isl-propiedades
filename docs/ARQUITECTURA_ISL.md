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
7. Leads y notificaciones — **completado**
8. Ficha de propiedad — **completado**
9. Admin: estructura y panel — **completado**
10. Admin: propiedades — **completado**
11. Admin: hero y agentes — **completado**
12. Admin: barrios, guía y testimonios — **completado**
13. Admin: consultas y ajustes — **completado**
14. Páginas comerciales y barrios públicos — **completado**
15. Guía pública, calculadora y SEO final — **completado**

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

## Prompt 7 — Leads y notificaciones

`/api/leads` dejó de ser un stub 501. Valida honeypot (200 silencioso), inserta
con `createLead()` y después intenta notificar. Si la tabla `leads` no existe,
responde 503 con mensaje claro. El correo va por `fetch` nativo a Resend
(`RESEND_API_KEY`); el remitente por defecto es
`ISL Propiedades <notificaciones@tudominio.cl>` (el dominio debe estar
verificado). Destino: correo del agente si hay `agente_id`, si no
`email_general`. Un fallo de Resend o la ausencia de la clave se registra en
consola y no se muestra al visitante. Si Resend responde OK, se llama
`marcar_lead_notificado` (migración `0002`). El botón de WhatsApp del correo se
arma con `buildWhatsAppLink()`: prioriza el teléfono del lead para responder en
un clic; si no hay, usa el del agente o `whatsapp_general`.

`/api/alertas` inserta en `alertas` con token `crypto.randomUUID()`.
`/alertas` precarga filtros del catálogo. `/alertas/baja/[token]` llama
`baja_alerta`: token real → confirmación y `activa = false`; token inventado →
«Este enlace ya no es válido».

`TestimoniosCarousel` en Home: teclado, `aria-label` en controles, auto-rotación
solo sin `prefers-reduced-motion`, pausa con mouse o foco; un testimonio se
muestra fijo.

## Prompt 8 — Ficha de propiedad

`app/propiedades/[slug]/page.tsx` carga con `getPropiedadBySlug`. Si el slug no
existe o el estado no es publicada/reservada/vendida, llama `notFound()` y muestra
`app/propiedades/[slug]/not-found.tsx`. El visual vive en
`components/isl/FichaPropiedadDetalle.tsx` (`propiedad` + `agente`) para que el
Prompt 10 pueda previsualizar borradores sin duplicar UI.

Galería: portada + miniaturas ordenadas, lightbox a pantalla completa (teclado,
swipe, Escape, foco atrapado). Video vía `parseVideoUrl()`. Tour virtual en
pestaña nueva. Encabezado con badges, `PriceTag` grande en UF y specs con valor.
Acciones: PDF en el navegador (`lib/pdf-ficha.ts`, jsPDF, una página A4; si la
foto falla por CORS el PDF igual se descarga), comparar con `useComparador`
(`isl:comparar`), WhatsApp (`buildWhatsAppLink`) y copiar link. Vendida oculta
el formulario de visita; reservada lo deja con copy ajustado. Similares (3–4)
quedan en la página, con relleno de las más recientes.

SEO: `generateMetadata` con title absoluto, description ~155, OG de portada y
canonical. JSON-LD `RealEstateListing` (sin precio CLP) y `BreadcrumbList`.
`NEXT_PUBLIC_SITE_URL` es la base canónica; si falta, se usa un placeholder.

## Prompt 9 — Admin: estructura y panel

Auth con `@supabase/ssr` (ya instalado). `proxy.ts` (convención de Next 16;
equivale al middleware pedido) cubre `/admin` y `/admin/*`: sin sesión redirige a `/admin/login`; con sesión en login, al panel.
`getUser()` (no `getSession()`) confirma la identidad. Login con correo y clave
(`signInWithPassword`). No hay registro público. Crear las cuentas de Silvia e
Ivannia en Authentication de Supabase.

Rutas:

| Ruta | Rol |
| --- | --- |
| `/admin/login` | Entrada. Sin menú. |
| `/admin` | Panel: tarjetas, primeros pasos y accesos rápidos. |
| `/admin/propiedades` | Listado (formulario de alta: Prompt 10). |
| `/admin/propiedades/nueva` | Placeholder hasta el Prompt 10. |
| `/admin/leads` | Listado de consultas. |
| `/admin/hero`, `/agentes`, `/barrios`, `/guia`, `/testimonios`, `/ajustes` | Placeholder hasta Prompts 11–13. |

El menú (colapsable en móvil) usa esas etiquetas. Consultas muestra un número si
hay estado `nuevo`. «Ver el sitio» abre la home en otra pestaña. Saludo con el
nombre de la sesión si existe; si no, «Hola».

Primeros pasos se calcula solo con datos reales (perfil de agente, WhatsApp +
titular, propiedad publicada con fotos, destacado, barrio publicado). Si las
tablas están vacías o fallan, todo queda pendiente y no se rompe. Se oculta al
cumplir los 5 o al minimizar a mano (`isl:admin:primeros-pasos-oculto`).

## Prompt 10 — Admin: módulo de propiedades

Se completó el módulo central del admin donde Silvia e Ivannia cargan propiedades
con fotos y video. El diseño prioriza eficiencia operativa y UX móvil.

**Rutas creadas:**

| Ruta | Archivo | Función |
| --- | --- | --- |
| `/admin/propiedades` | `app/admin/(app)/propiedades/page.tsx` | Listado con filtro instantáneo y acciones rápidas |
| `/admin/propiedades/nueva` | `app/admin/(app)/propiedades/nueva/page.tsx` | Formulario de nueva propiedad |
| `/admin/propiedades/[id]/editar` | `app/admin/(app)/propiedades/[id]/editar/page.tsx` | Formulario de edición |
| `/admin/propiedades/[id]/vista-previa` | `app/admin/(app)/propiedades/[id]/vista-previa/page.tsx` | Vista previa protegida |

**Server actions (propiedades/actions.ts):**

- `guardarPropiedad`: Crea o actualiza propiedad, genera slug único, maneja estados (borrador/publicada/mantener), revalida rutas relevantes.
- `cambiarEstadoPropiedad`: Publica o despublica en un clic.
- `duplicarPropiedad`: Crea copia en borrador con "(copia)" en título, sin fotos.
- `eliminarPropiedad`: Elimina con confirmación previa en UI.

**Componentes creados:**

- `PropiedadesListado`: Grilla de tarjetas con miniatura, título, precio UF, estado (con color), comuna. Filtro por estado y buscador por título que responden al instante en el navegador. Menú de acciones: Editar, Duplicar, Vista previa, Descargar ficha PDF, Generar imagen para redes, Publicar/Despublicar, Eliminar (con confirmación).
- `PropiedadForm`: Formulario organizado en secciones (Datos básicos, Precio y operación, Características, Fotos y video, Ubicación, Agente a cargo). Cada campo con ayuda corta en lenguaje simple. Valores por defecto inteligentes (recuerda última operación y comuna usadas, pre-carga agente si la autenticación lo permite). MediaUploader para fotos (múltiples) y video (archivo o link). Recuperación de borrador sin guardar via sessionStorage. Botón flotante de guardar/publicar. Validación de 5 campos mínimos. Advertencia nativa al salir con cambios sin guardar.
- `EstadoBadge`: Badge de estado con color (borrador gris, publicada verde, reservada ámbar, vendida azul, despublicada rojo suave).
- `FichaPdfButton`: Botón que reutiliza `lib/pdf-ficha.ts` para descargar ficha PDF.
- `ImagenRedesButton`: Botón con formato cuadrado (1080x1080) o historia (1080x1920), deshabilitado si no hay foto.
- `FieldHelp`: Componente de campo con etiqueta y ayuda.

**Librerías creadas:**

- `lib/social-image.ts`: `generateSocialImage(propiedad, formato)` dibuja en canvas del navegador: foto de portada + degradado inferior oscuro + título + precio UF + comuna + "ISL Propiedades" en Cormorant Garamond. Maneja CORS y fallback.
- `lib/propiedad-admin.ts`: Tipos `PropiedadFormValues` y `PropiedadGuardarInput`, funciones de conversión, validación, y utilidades para borrador y defaults inteligentes (COMUNAS_ISL, LAST_OPERACION_KEY, LAST_COMUNA_KEY).

## Prompt 13 — Admin: consultas y ajustes

Se completó el módulo de gestión de consultas (leads) y configuración general del sitio.

**Rutas creadas:**

|| Ruta | Archivo | Función |
|| --- | --- | --- |
|| `/admin/leads` | `app/admin/(app)/leads/page.tsx` | Listado de consultas con filtros y gestión de estado |
|| `/admin/ajustes` | `app/admin/(app)/ajustes/page.tsx` | Configuración general del sitio |

**Server actions (ajustes/actions.ts):**

- `guardarAjustes`: Actualiza configuración general (títulos, contacto, calculadora, como_trabajamos).
- `marcarLeadContactado`: Cambia estado de lead de "nuevo" a "contactado".

**Componentes creados:**

- `AdminLeadsClient`: Listado de leads con filtros por estado/tipo, búsqueda, y acción de contacto por WhatsApp.
- `AjustesForm`: Formulario de configuración del sitio con secciones: Información general, Contacto, Calculadora, Cómo trabajamos.

## Prompt 14 — Páginas comerciales y barrios públicos

Se implementaron las páginas públicas comerciales y la guía de barrios con mapa interactivo.

**Rutas creadas:**

|| Ruta | Archivo | Función |
|| --- | --- | --- |
|| `/nosotros` | `app/nosotros/page.tsx` | Página Nosotros con equipo y cómo trabajamos |
|| `/vender` | `app/vender/page.tsx` | Página de venta con beneficios y casos de preparación |
|| `/tasacion` | `app/tasacion/page.tsx` | Página de tasación con formulario |
|| `/barrios` | `app/barrios/page.tsx` | Guía de barrios con mapa interactivo |
|| `/barrios/[slug]` | `app/barrios/[slug]/page.tsx` | Detalle de barrio con contenido y propiedades |

**Componentes creados:**

- `MapaBarrios`: Mapa SVG interactivo de la V Región con zonas clickeables.
- `GaleriaAntesDespues`: Componente para mostrar casos de preparación (antes/después).

**Librerías creadas:**

- `lib/casos-preparacion.ts`: Funciones para obtener casos de preparación publicados.

## Prompt 15 — Guía pública, calculadora y SEO final

Se completó la guía pública con descarga de reportes, calculadora inmobiliaria, y SEO técnico global.

**Rutas creadas:**

|| Ruta | Archivo | Función |
|| --- | --- | --- |
|| `/guia` | `app/guia/page.tsx` | Índice de artículos con filtro por categoría |
|| `/guia/[slug]` | `app/guia/[slug]/page.tsx` | Artículo completo con descarga de reporte PDF |
|| `/calculadora` | `app/calculadora/page.tsx` | Calculadora UF ↔ CLP con API mindicador |

**Archivos SEO:**

- `app/sitemap.ts`: Sitemap dinámico con home, catálogo, fichas, barrios, artículos y páginas fijas.
- `app/robots.txt`: Reglas para crawlers excluyendo /admin y /api.
- `app/layout.tsx`: JSON-LD de Organization y LocalBusiness con datos dinámicos de settings.

**Librerías creadas:**

- `lib/uf.ts`: `getValorUF()` con API mindicador.cl (revalidate 1h) y fallback a valor manual.
- `app/guia/[slug]/not-found.tsx`: Página 404 específica para artículos.

**Modificaciones:**

- `components/isl/FichaAcciones.tsx`: Agregado `ImagenRedesButton` para generar imágenes para redes sociales desde la ficha pública.

## Mapa completo del sitio

### Rutas públicas

|| Ruta | Estado | Función |
|| --- | --- | --- |
|| `/` | ○ (revalidate 2m) | Home público con hero, selección, buscador, testimonios |
|| `/propiedades` | ƒ (dinámica) | Catálogo con filtros y paginación |
|| `/propiedades/[slug]` | ƒ (dinámica) | Ficha de propiedad con galería, acciones y similares |
|| `/comparar` | ƒ (dinámica) | Comparador de propiedades |
|| `/barrios` | ○ (revalidate 2m) | Guía de barrios con mapa interactivo |
|| `/barrios/[slug]` | ƒ (dinámica) | Detalle de barrio |
|| `/guia` | ○ (revalidate 2m) | Índice de artículos |
|| `/guia/[slug]` | ƒ (dinámica) | Artículo completo con descarga de reporte |
|| `/nosotros` | ○ (revalidate 2m) | Página Nosotros |
|| `/vender` | ○ (revalidate 2m) | Página de venta |
|| `/tasacion` | ○ (revalidate 2m) | Página de tasación |
|| `/calculadora` | ○ (revalidate 1h) | Calculadora inmobiliaria |
|| `/alertas` | ƒ (dinámica) | Formulario de alertas |
|| `/alertas/baja/[token]` | ƒ (dinámica) | Baja de alerta |

### Rutas de administración

|| Ruta | Estado | Función |
|| --- | --- | --- |
|| `/admin/login` | ○ (estática) | Login del panel |
|| `/admin` | ƒ (dinámica) | Panel principal con resumen y primeros pasos |
|| `/admin/propiedades` | ƒ (dinámica) | Listado de propiedades |
|| `/admin/propiedades/nueva` | ƒ (dinámica) | Formulario de nueva propiedad |
|| `/admin/propiedades/[id]/editar` | ƒ (dinámica) | Formulario de edición |
|| `/admin/propiedades/[id]/vista-previa` | ƒ (dinámica) | Vista previa protegida |
|| `/admin/leads` | ƒ (dinámica) | Gestión de consultas |
|| `/admin/hero` | ƒ (dinámica) | Gestión de hero slides |
|| `/admin/agentes` | ƒ (dinámica) | Gestión de agentes |
|| `/admin/barrios` | ƒ (dinámica) | Gestión de barrios |
|| `/admin/guia` | ƒ (dinámica) | Gestión de artículos |
|| `/admin/testimonios` | ƒ (dinámica) | Gestión de testimonios |
|| `/admin/ajustes` | ƒ (dinámica) | Configuración general |

### API Routes

|| Ruta | Función |
|| --- | --- |
|| `/api/leads` | Recepción de formularios de contacto con notificación por correo |
|| `/api/alertas` | Creación de alertas de búsqueda |

### Archivos técnicos

|| Archivo | Función |
|| --- | --- |
|| `app/sitemap.ts` | Sitemap dinámico para SEO |
|| `app/robots.txt` | Reglas para crawlers |
|| `app/manifest.ts` | PWA manifest |
|| `app/layout.tsx` | Layout raíz con JSON-LD SEO |

## Estado final del proyecto

El sitio ISL Propiedades está 100% funcional con:

- ✅ Sistema de diseño completo (paleta ISL, tipografías, componentes UI)
- ✅ Motor de fotos/video con HEIC a JPEG, optimización y miniaturas
- ✅ Catálogo público con filtros, paginación y comparador
- ✅ Fichas de propiedad con galería, lightbox, PDF y redes sociales
- ✅ Sistema de leads con notificación por correo (Resend)
- ✅ Panel de administración completo para todo el contenido
- ✅ Páginas públicas: Home, catálogo, fichas, comparador, barrios, guía, nosotros, vender, tasación, calculadora
- ✅ SEO técnico: sitemap dinámico, robots.txt, JSON-LD Organization/LocalBusiness
- ✅ Mapa interactivo de barrios
- ✅ Guía pública con descarga de reportes PDF
- ✅ Calculadora inmobiliaria con API mindicador.cl
- ✅ Sistema de alertas de búsqueda
- ✅ Auth con Supabase SSR para admin
- ✅ Responsive design con prefieres-reduced-motion
- ✅ Copy en español de Chile, contenido local

**Próximos pasos fuera del código:**

1. Crear cuentas de Silvia e Ivannia en Supabase Authentication
2. Verificar dominio en Resend para envío de correos
3. Configurar `NEXT_PUBLIC_SITE_URL` con el dominio real
4. Cargar primera propiedad real como prueba
5. Completar perfiles de agentes (foto, WhatsApp, especialidad)
6. Configurar ajustes del sitio (títulos, contactos, como_trabajamos)
7. Configurar Google Search Console y Analytics
8. Revisar y probar el sitio en diferentes dispositivos
9. Desplegar a Cloudflare Workers con OpenNext
- `lib/admin.ts`: `getAdminPropiedades`, `getAdminPropiedadById`, `getAdminAgentes` (usando el cliente SSR).
- `lib/admin-copy.ts`: Copia administrativa: ADMIN_NAV, ESTADO_PROPIEDAD, AVISO_ADMIN, TIPO_CONSULTA, ESTADO_CONSULTA.

**Patrones de UX:**

- Sin jerga técnica en pantalla.
- Confirmaciones breves y claras en cada acción que graba datos.
- Eliminar siempre pide confirmación explícita.
- Recuperación de borrador sin guardar con pregunta al usuario (nunca silenciosa).
- Campos mínimos obligatorios: título, precio_uf, comuna, operación, tipo.
- Formulario funciona perfecto en móvil, incluyendo cámara directa.
- Filtro y buscador responden al instante sin recargar página.
- Duplicar ahorra trabajo para propiedades parecidas.

**No se modificó:**

- Sistema de autenticación existente.
- Home, catálogo ni ficha pública (se reutiliza FichaPropiedadDetalle tal cual).
- Otras secciones del admin (Prompts 11–13).

## Prompt 11 — Admin: Hero y Agentes

Se completaron dos secciones más rápidas del admin: gestión de destacados de portada y perfiles de agentes.

**Rutas creadas:**

| Ruta | Archivo | Función |
| --- | --- | --- |
| `/admin/hero` | `app/admin/(app)/hero/page.tsx` | Gestión de hero_slides (destacados de portada) |
| `/admin/agentes` | `app/admin/(app)/agentes/page.tsx` | Gestión de perfiles de agentes |

**Server actions (hero/actions.ts):**

- `guardarHeroSlide`: Crea o actualiza slide con validación de máximo 5 activos. Soporta imagen o video, título, subtítulo, y dos CTAs (propiedad, página del sitio, o link manual).
- `eliminarHeroSlide`: Elimina slide con confirmación previa en UI.
- `reordenarHeroSlides`: Reordena slides por arrastrar y soltar.
- `crearHeroDesdePropiedad`: Crea slide nuevo precargado desde una propiedad (usado desde listado de propiedades).

**Server actions (agentes/actions.ts):**

- `guardarAgente`: Crea o actualiza agente con slug único automático. Campos: foto, nombre, apellido, rol, bio, email, whatsapp, especialidad, activo.
- `eliminarAgente`: Elimina agente con confirmación previa en UI.

**Componentes creados:**

- `HeroSlideForm`: Formulario para crear/editar slides. Selector de tipo (imagen/video), MediaUploader para bucket "contenidos" pathPrefix "hero", campos de texto, y selector inteligente para CTAs (propiedad → autocompleta link a ficha, página del sitio → selector simple, link manual → input).
- `HeroSlidesListado`: Lista ordenable de slides. Muestra contador de activos (máximo 5), modo de reordenar por arrastrar, y acciones (editar, eliminar). Valida tope de 5 activos con mensaje amable.
- `AgenteForm`: Formulario para crear/editar agentes. Organizado en secciones: Foto, Información personal, Contacto, Especialidad, Estado. MediaUploader para bucket "contenidos" pathPrefix "agentes".
- `AgentesListado`: Grilla de tarjetas de agentes con foto, nombre, rol, especialidad, estado. Acciones (editar, eliminar).

**Librerías actualizadas:**

- `lib/admin.ts`: Agregada `getAdminHeroSlides()` para listar slides ordenados.

**Funcionalidades implementadas:**

- **Tope de 5 destacados activos**: Validación en `guardarHeroSlide` y `crearHeroDesdePropiedad` con mensaje "Ya tienes 5 destacados activos, desactiva uno primero para activar este."
- **"Usar como destacado" desde propiedades**: Acción agregada en `PropiedadesListado` que llama `crearHeroDesdePropiedad`. Precarga datos desde la propiedad (foto de portada, título, subtítulo con operación/comuna, CTA a ficha).
- **Edición de perfiles de agentes**: Formulario completo con foto, nombre, apellido, rol, bio, email, whatsapp, especialidad, estado activo. Optimizado para Silvia e Ivannia con UX rápida.

**No se modificó:**

- Sistema de autenticación existente.
- Home, catálogo ni ficha pública.
- Otras secciones del admin (Prompts 12–13).

## Prompt 12 — Admin: Barrios, Guía y Testimonios

Se completaron las tres secciones de contenido editorial del admin. Comparten el mismo patrón (texto + imagen + publicar/no publicar).

**Rutas existentes (ya creadas en prompts anteriores, completadas en este):**

| Ruta | Archivo | Función |
| --- | --- | --- |
| `/admin/barrios` | `app/admin/(app)/barrios/page.tsx` | Gestión de guía de barrios |
| `/admin/guia` | `app/admin/(app)/guia/page.tsx` | Gestión de artículos y reportes |
| `/admin/testimonios` | `app/admin/(app)/testimonios/page.tsx` | Gestión de testimonios de clientes |

**Server actions (barrios/actions.ts):**

- `guardarBarrio`: Crea o actualiza barrio con slug único automático. Campos: nombre, hero_image (MediaUploader), extracto, contenido (textarea simple), tips (una frase por línea), seo_title, meta_description, publicado.
- `eliminarBarrio`: Elimina barrio con confirmación previa en UI.

**Server actions (guia/actions.ts):**

- `guardarArticulo`: Crea o actualiza artículo con slug único automático (editable a mano). Campos: título, extracto, contenido (textarea simple), categoría (Comprar/Vender/Invertir/Barrio/Tips), etiquetas, imagen_destacada (MediaUploader), seo_title, meta_description, estado (borrador/publicado). Soporta `es_reporte` y `archivo_pdf_url` (MediaUploader kind="pdf") para reportes descargables.
- `eliminarArticulo`: Elimina artículo con confirmación previa en UI.

**Server actions (testimonios/actions.ts):**

- `guardarTestimonio`: Crea o actualiza testimonio. Campos: nombre, rol_ciudad, texto, foto_url (MediaUploader), propiedad_id (selector opcional de propiedades), destacado, publicado.
- `eliminarTestimonio`: Elimina testimonio con confirmación previa en UI.

**Componentes creados:**

- `BarrioForm`: Formulario con ayuda visible: "Escribe como si le estuvieras contando a un amigo cómo es vivir en este barrio." Secciones: Información básica, Imagen destacada (MediaUploader kind="image" bucket="contenidos" pathPrefix="barrios/{slug}"), Contenido (textarea grande), Tips (textarea, una frase por línea), SEO, Estado.
- `BarriosListado`: Grilla de tarjetas con miniatura, nombre, extracto, estado. Acciones: Editar, Eliminar. EmptyState con lista de barrios sugeridos (Viña del Mar, Reñaca, Recreo, Concón, Olmué, Quilpué, Peñablanca, Villa Alemana).
- `ArticuloForm`: Formulario con secciones: Información básica (título + slug editable), Categoría y etiquetas, Imagen destacada (MediaUploader), Contenido (textarea grande), Reporte descargable (checkbox es_reporte + MediaUploader kind="pdf" condicional), SEO, Estado (borrador/publicado).
- `ArticulosListado`: Grilla de tarjetas con miniatura, título, categoría, badges (Publicado/Borrador, Reporte), extracto. Acciones: Editar, Eliminar. EmptyState con descripción editorial.
- `TestimonioForm`: Formulario con secciones: Información personal (nombre, rol_ciudad), Foto (MediaUploader kind="image" bucket="contenidos" pathPrefix="testimonios"), Testimonio (textarea), Propiedad relacionada (selector opcional), Estado (destacado, publicado).
- `TestimoniosListado`: Grilla de tarjetas con foto, nombre, rol_ciudad, badges (Publicado/Borrador, Destacado), texto. Acciones: Editar, Eliminar. EmptyState con descripción.

**Librerías actualizadas:**

- `lib/admin.ts`: Ya incluía `getAdminBarrios()`, `getAdminArticulos()`, `getAdminTestimonios()` desde el Prompt 4.
- `lib/admin-copy.ts`: Ya incluía las entradas en `ADMIN_NAV` para Barrios, Guía, Testimonios.

**Correcciones:**

- Se corrigió un error de sintaxis preexistente en `components/admin/ArticuloForm.tsx` (paréntesis extra en `useState` de `categoria`).

**No se modificó:**

- Sistema de autenticación existente.
- Home, catálogo ni ficha pública.
- Leads ni Ajustes (Prompt 13).

## Prompt 13 — Admin: Consultas y Ajustes

Se completó la gestión de leads y la configuración centralizada del sitio.

**Rutas creadas:**

| Ruta | Archivo | Función |
| --- | --- | --- |
| `/admin/leads` | `app/admin/(app)/leads/page.tsx` | Listado y gestión de consultas de clientes |
| `/admin/ajustes` | `app/admin/(app)/ajustes/page.tsx` | Configuración general, calculadora y antes/después |

**Server actions (leads/actions.ts):**

- `cambiarEstadoLead`: Actualiza el estado de la consulta ("nuevo", "contactado", "cerrado").

**Server actions (ajustes/actions.ts):**

- `guardarGeneral`: Titulares de portada y datos de contacto general.
- `guardarCalculadora`: Parámetros financieros (UF manual, comisión, gastos, pie, disclaimer).
- `guardarComoTrabajamos`: Lista dinámica de pasos para el Home.
- `guardarCasoPreparacion`: Crea o edita casos de Antes/Después con MediaUploader.
- `eliminarCasoPreparacion`: Elimina caso con confirmación.

**Componentes creados:**

- `AdminLeadsClient`: Listado con filtros por tipo y estado. Muestra badge de notificación (Resend), fecha relativa, y botón directo a WhatsApp con mensaje pre-armado. Modal de detalle con toda la información del lead (incluyendo propiedad de origen si aplica).
- `AjustesForm`: Formulario dividido en 4 secciones independientes. Cada sección guarda sus datos sin afectar a las demás, mejorando la UX operativa.
- `MediaUploader`: (Ya existía) Se usa en Ajustes para las fotos de Antes/Después y en perfiles.

**Librerías actualizadas:**

- `lib/admin.ts`: Agregadas `getAdminSettings()` y `getAdminCasosPreparacion()`.
- `app/admin/(app)/leads/page.tsx`: Convertida a Server Component que inyecta datos al cliente.

**Funcionalidades clave:**

- **Gestión de Leads**: Silvia e Ivannia pueden marcar qué consultas ya fueron atendidas y cuáles están cerradas, manteniendo el orden sin salir del admin.
- **Configuración en un clic**: Cambio de titulares y parámetros de la calculadora reflejados al instante en el sitio público.
- **Antes y Después**: Galería gestionable para mostrar el valor de la preparación ISL.

**No se modificó:**

- Sistema de autenticación existente.
- Home, catálogo ni ficha pública (aunque consumen los nuevos ajustes).
- Prompts 14-15 (pendientes).

## Prompt 14 — Páginas comerciales y barrios públicos

Se publicaron las páginas comerciales faltantes y la sección pública de barrios, construidas sobre el contenido ya cargado desde el admin (Prompts 12 y 13). Todo contenido es opcional: si no hay datos cargados, se omite con elegancia y sin huecos en el diseño.

**Rutas creadas/actualizadas:**

| Ruta | Archivo | Función |
| --- | --- | --- |
| `/nosotros` | `app/nosotros/page.tsx` | "La Mirada ISL", AgentCard del equipo, bloque "Cómo trabajamos" lee `site_settings.como_trabajamos` y se omite si está vacío |
| `/vender` | `app/vender/page.tsx` | Beneficios del servicio de venta, "Deja tu casa lista" con pasos y galery antes/después condicional (lee `getCasosPreparacionPublicados()`), LeadForm con tipo="vender" |
| `/tasacion` | `app/tasacion/page.tsx` | Explicación editorial de la tasación ISL, formulario de contacto con campos extra (tipo de propiedad, comuna, dormitorios, m²), LeadForm con tipo="tasacion" |
| `/barrios` | `app/barrios/page.tsx` | Índice con componente `MapaBarrios` (SVG interactivo con zonas clickeables de Viña del Mar a Olmué), y grilla de 8 tarjetas de barrio |
| `/barrios/[slug]` | `app/barrios/[slug]/page.tsx` | Hero, extracto, contenido, tips, lista de propiedades filtradas por comuna (match flexible sin distinción de tildes), EmptyState con CTA a alertas, generateMetadata |

**Componente interactivo:**

- `components/isl/MapaBarrios.tsx`: SVG ilustrativo con 8 zonas (Concón, Reñaca, Viña del Mar, Recreo, Quilpué, Villa Alemana, Peñablanca, Olmué). Hover/tap resalta zona y muestra nombre + conteo de propiedades. Click navega a `/barrios/[slug]`. Respetuoso con `prefers-reduced-motion` (transiciones deshabilitadas). Tooltip fijo en mobile.
- `components/isl/GaleriaAntesDespues.tsx`: Reutilizado desde Prompt 12 para la sección "Deja tu casa lista".

**Librerías reutilizadas:**

- `lib/settings.ts` (`getSiteSettings()`) — datos de "Cómo trabajamos".
- `lib/agentes.ts` (`getAgentesActivos()`) — AgentCard.
- `lib/casos-preparacion.ts` (`getCasosPreparacionPublicados()`) — galería antes/después.
- `lib/barrios.ts` (`getBarriosPublicados()`, `getBarrioBySlug()`) — contenido de barrios.
- `lib/propiedades.ts` (`getPropiedadesPublicadas()`) — conteo y listado de propiedades por comuna.
- `components/isl/LeadForm.tsx` — formulario de contacto reutilizable con `tipo` parametrizado.
- `components/isl/EmptyState.tsx` — estado vacío para barrios sin propiedades.

**Funcionalidades clave:**

- Todas las páginas respetan `prefers-reduced-motion` y evitan animaciones innecesarias.
- Match de comuna flexible (sin distinción de mayúsculas/tildes) entre `propiedades.comuna` y `barrios.nombre`.
- `generateMetadata` implementado en `/barrios/[slug]` con `seo_title` y `meta_description`.
- Páginas `/nosotros`, `/vender`, `/tasacion` y `/barrios` son estáticas (prerendered); `/barrios/[slug]` es dinámica.

**No se modificó:**

- Sistema de autenticación, admin, Home, catálogo, ficha pública, leads ni otras funcionalidades existentes.
- Prompts 15 (pendiente).






