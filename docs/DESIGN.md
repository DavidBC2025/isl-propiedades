# Diseño ISL Propiedades

Documento vivo. Se actualiza (se agrega, no se reemplaza) en cada prompt de la serie, igual que `docs/ARQUITECTURA_ISL.md`.

## Tokens de color

| Token | Hex | Uso |
| --- | --- | --- |
| `--isl-black` / `isl-black` | `#0A0A0A` | Texto, botones primarios, overlays |
| `--isl-white` / `isl-white` | `#FFFFFF` | Fondo de página |
| `--isl-offwhite` / `isl-offwhite` | `#F7F7F5` | Superficies, tarjetas, zonas de carga |
| `--isl-gray` / `isl-gray` | `#A1A1AA` | Metadatos, tracking, placeholders |
| `--isl-gold` / `isl-gold` | `#C6A87C` | Acento, precios en overlay, foco visible |
| `--isl-champagne` / `isl-champagne` | `#E8DCC8` | Fondos suaves, hover gold, placeholders |

El dorado sobre negro tiene contraste aproximado 9.29:1 (WCAG AA para texto).

## Tipografía

- Titulares: Cormorant Garamond (`font-serif`), pesos 300–600. `font-normal` en títulos de sección.
- UI y cuerpo: Inter (`font-sans`), pesos 300–600.
- Precios: Inter, `tabular-nums`, siempre con prefijo `UF` y separador de miles chileno (`es-CL`).
- Etiquetas: sans, uppercase, tracking amplio (`tracking-widest` o `tracking-[0.12em]`).

Variables en el layout raíz: `--font-isl-serif`, `--font-isl-sans`.

## Ritmo de Home (inspirado en Ogroup)

El Home público (`app/page.tsx`, Prompt 5) sigue este pulso:

1. **Hero** — `hero_slides`, o propiedad principal, o fallback de marca. Fade 8s; sin rotar con `prefers-reduced-motion`.
2. **Selección** — hasta 6 `ListingCard`; `EmptyState` si no hay publicadas.
3. **Buscador** — GET nativo a `/propiedades`.
4. **Mirada ISL** — copy de Silvia e Ivannia; fotos de agentes si existen, si no placeholder de marca.
5. **Por qué** — `como_trabajamos` o los cuatro puntos editoriales (sin cifras).
6. **Enlistar** — CTA a `/vender`.
7. **Guía** — 3 artículos o `EmptyState`.
8. **Testimonios** — solo si hay publicados; carrusel sin autoavance si hay 1 o reduced-motion.
9. **Newsletter** — `LeadForm` solo con correo.
10. **Footer** — nav, `email_general`, `whatsapp_general`, año dinámico.

Si un bloque no tiene datos reales, se muestra `EmptyState` (salvo testimonios, que se omiten). Nunca rellenar con propiedades, testimonios, artículos ni agentes de ejemplo.

## Motion

- Fade: 500 ms, `ease-out`, clase `.isl-fade-up`.
- Ken Burns: 8 s, `ease-out`, clase `.isl-kenburns` (solo `prefers-reduced-motion: no-preference`).
- Transiciones de UI: 300 ms.
- Sin rebotes, springs ni easing elástico.
- Hover de tarjetas: overlay y datos; en reduced-motion el contenido sigue legible fuera del overlay.

## Bloques reutilizables

| Componente | Cuándo usarlo |
| --- | --- |
| `Container` | Ancho máximo y padding horizontal de página/sección |
| `SectionTitle` | Título de bloque + subtítulo en tracking |
| `ButtonISL` | CTAs. Variantes: `primary`, `gold`, `outline`, `ghost`, `inverse` |
| `PriceTag` | Todo precio público. Nunca armar `UF` a mano en la UI |
| `EmptyState` | Cero datos, tabla ausente o consulta fallida |
| `HeroMedia` | Hero y fichas: imagen, video archivo o embed |
| `ListingCard` | Grilla de propiedades. Link a `/propiedades/[slug]` |
| `AgentCard` | Equipo. WhatsApp solo con `buildWhatsAppLink()` |
| `LeadForm` | Contacto, tasación, visita, newsletter, etc. `hiddenFields` para contextos cortos |
| `HomeHero` | Solo Home: slides, fallback de marca y CTAs |
| `QuickSearch` | Buscador GET a `/propiedades` |
| `ArticleCard` | Preview de guía; link a `/guia/[slug]` |
| `TestimonialCarousel` | Solo con testimonios reales; teclado ← → |
| `SiteHeader` / `SiteFooter` | Nav compartida; overlay en Home |
| `CompareBar` | Home y catálogo. Solo si hay selección en `isl:comparar` |
| `CatalogPagination` | Catálogo. Enlaces GET, sin depender de JS |
| `MediaUploader` | Admin (Prompt 9+). Nunca en páginas públicas |

### `MediaUploader` por `kind`

- `image` — una foto (portada de artículo, barrio, agente).
- `image-multiple` — galería de propiedad: orden, portada, miniaturas en `thumbnails/`.
- `video` — archivo mp4/webm o URL YouTube/Vimeo (`allowUrlInstead`).
- `pdf` — reportes (`es_reporte` / `archivo_pdf_url`).

Bucket `propiedades` para listing; `contenidos` para el resto. Límite operativo: 50 MB (supuesto del Prompt 1).

## Patrones obligatorios

- **Video:** interpretar y embeber solo con `parseVideoUrl()` de `lib/media.ts`. No parsear hosts a mano en componentes.
- **WhatsApp:** armar enlaces solo con `buildWhatsAppLink()` de `lib/whatsapp.ts`. Normaliza celulares chilenos de 9 dígitos.
- **Estados vacíos:** siempre `components/isl/EmptyState`. Copy cercano, sin culpar al usuario.
- **Datos:** cada `get*` en `lib/` atrapa errores y devuelve `[]` o `null`. Propiedades con agente en un solo `select` anidado (`agente:agentes(*)`).
- **Leads:** el formulario hace POST a `/api/leads`. Hasta el Prompt 7 la ruta responde 501; `createLead` queda tipado en `lib/leads.ts`.

## Copy local

Español de Chile, simple y cercano. Comunas y sectores del área de trabajo, sin inventar listings:

Viña del Mar, Reñaca, Recreo, Concón, Olmué, Quilpué, Peñablanca, Villa Alemana.

`formatComuna()` capitaliza para UI. Precios siempre en UF.

## Catálogo y comparador

El catálogo (`/propiedades`) replica el buscador del Home y suma dormitorios. La
grilla es la misma de Home (`ListingCard`, 4:5). Cero resultados: `EmptyState`,
nunca una grilla vacía. El comparador es una barra fija inferior; no anima con
rebotes. La tabla de `/comparar` se desplaza en horizontal en mobile
(`overflow-x-auto`) y muestra precios solo con `PriceTag` / `formatUF`.

## Continuidad

`docs/ARQUITECTURA_ISL.md` y `docs/DESIGN.md` se actualizan en cada prompt siguiente de la serie: se les agrega lo nuevo, no se reescriben desde cero.
