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

El Home se construye en el Prompt 5. Este es el orden de bloques, no el markup:

1. **Hero** — slide activo, overlay, titular y CTAs.
2. **Selección** — propiedad principal y/o destacadas.
3. **Buscador** — filtros hacia el catálogo.
4. **Mirada ISL** — posicionamiento editorial (sin inventar casos).
5. **Por qué** — `como_trabajamos` de `site_settings`, o EmptyState si no hay datos.
6. **Enlistar** — invitación a vender, formulario o CTA.
7. **Guía** — artículos publicados / reportes.
8. **Footer** — contacto, WhatsApp general, barrios.

Si un bloque no tiene datos reales, se muestra `EmptyState`. Nunca rellenar con propiedades, testimonios, artículos ni agentes de ejemplo.

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

## Continuidad

`docs/ARQUITECTURA_ISL.md` y `docs/DESIGN.md` se actualizan en cada prompt siguiente de la serie: se les agrega lo nuevo, no se reescriben desde cero.
