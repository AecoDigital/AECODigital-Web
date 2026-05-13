# AECO Digital — Instrucciones para Claude Code

## Identidad del proyecto

Web corporativa de **AECO Digital** en `aecodigital.com`. Consultoría BIM especializada en transformación digital del sector Arquitectura, Ingeniería, Construcción y Operaciones. El sitio combina presencia corporativa, repositorio de recursos técnicos, blog especializado y un visor BIM interactivo.

---

## Stack y versiones

- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Lenguaje:** TypeScript estricto — sin `any` salvo justificación explícita
- **Estilos:** Tailwind CSS v4
- **Fuente:** Space Grotesk (`--font-geist-sans`) via `next/font/google`
- **Email:** Resend (`RESEND_API_KEY` en variables de entorno de Vercel)
- **Analytics:** Vercel Analytics (`@vercel/analytics/next`)
- **BIM/3D:** `@thatopen/components` v3.4.6 + `@thatopen/fragments` + THREE.js
- **Iconos:** `lucide-react`

---

## Sistema de diseño

### Colores
| Token | Valor | Uso |
|---|---|---|
| Acento principal | `#0066cc` | CTAs, links, highlights, bordes activos |
| Acento hover | `#004d99` | Hover de botones primarios |
| Acento selección BIM | `#0066cc` con opacidad 0.5 | Highlight de elementos seleccionados |
| Fondo body | `linear-gradient(160deg, #c8e0f8 0%, #ddeeff 20%, #eef6ff 50%, #e8e4f8 80%, #d8cff5 100%)` | Definido en `layout.tsx` |
| Scrollbar track | `#e8f1fb` | |
| Scrollbar thumb | `#93c5fd` / hover `#0066cc` | |

### Tipografía
- Fuente única: **Space Grotesk** en pesos 300/400/500/600/700
- Sin mezcla de fuentes — no añadir Google Fonts adicionales

### Cards (patrón estándar)
```tsx
className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[#0066cc] hover:shadow-[0_0_0_1px_#0066cc,0_4px_24px_rgba(0,102,204,0.15)] transition-all"
```

### Botón primario
```tsx
className="px-... py-... bg-[#0066cc] text-white font-medium rounded-lg hover:bg-[#004d99] transition-colors"
```

### Botón secundario (outline)
```tsx
className="px-... py-... text-[#0066cc] border border-[#0066cc] rounded-lg hover:bg-blue-50 transition-colors"
```

---

## Arquitectura de la aplicación

### Estructura de rutas
```
src/app/
  page.tsx                    — Home (Server Component, importa todos los sections)
  layout.tsx                  — Root layout: fuente, fondo, LanguageProvider, Analytics
  globals.css                 — Tailwind + scrollbar custom
  bim-viewer/page.tsx         — Visor IFC (dynamic import con ssr:false)
  blog/page.tsx               — Listado de artículos
  blog/[slug]/page.tsx        — Detalle de artículo (Server Component + Client hijo)
  plugins/page.tsx            — Repositorio de recursos
  plugins/[slug]/page.tsx     — Detalle de recurso (Server Component + Client hijo)
  api/contact/route.ts        — API de formulario de contacto (Resend)
```

### Componentes de sección (Home)
Orden en `page.tsx`: `Navbar` → `NetworkBackground` → `Hero` → `Servicios` → `Testimonios` → `Portfolio` → `Equipo` → `Blog` → `Plugins` → `Contacto` → `Footer`

### Internacionalización (i18n)
- Sistema propio con React Context en `src/lib/i18n.tsx`
- Todas las traducciones en `src/lib/translations.ts` — **nunca hardcodear texto visible en componentes**
- Hook: `const { t, lang, setLang } = useLang()`
- Idioma por defecto: español (`"es"`)
- Todos los componentes que muestran texto son `"use client"` y consumen `useLang()`
- Las páginas de detalle usan patrón: Server Component (`page.tsx`) + Client Component hijo para acceder al contexto

### Datos
- `src/data/blog.ts` — artículos del blog (interface `Articulo`, bilingüe ES/EN)
- `src/data/plugins.ts` — recursos/plugins (interface `Plugin`)
- Al añadir contenido seguir siempre las interfaces existentes e incluir versión EN

---

## BIM Viewer (`/bim-viewer`)

Componente principal: `src/components/BimViewerClient.tsx` (cargado con `dynamic(..., { ssr: false })`).

### Dependencias clave
- `@thatopen/components` — `OBC.Components`, `OBC.Worlds`, `OBC.SimpleScene/Camera/Renderer`, `OBC.FragmentsManager`, `OBC.IfcLoader`, `OBC.Raycasters`, `OBC.Grids`
- `@thatopen/fragments` — `FRAGS.RenderedFaces`
- Los archivos WASM de web-ifc están en `/public/` con rutas absolutas

### API del modelo (fragmentos cargados)
```typescript
model.getSpatialStructure()        // árbol jerárquico IFC
model.getItemsData(localIds[])     // atributos por localId
model.setVisible(localIds[], bool) // mostrar/ocultar
// getMergedBox() puede no existir — usar THREE.Box3().setFromObject(model.object) como fallback
```

### Patrones importantes
- `coloredItemsRef` + `selectedItemsRef` son `useRef` — accesibles en closures sin stale state
- Tras cualquier `fragments.resetHighlight()` siempre llamar `reapplyColors()` + `reapplySelection()`
- Los planos de sección se aplican síncronamente en `onChange` (NO via `useEffect`) pasando los nuevos valores directamente a `applyClippingPlanes(x, y, z)`
- Las categorías se derivan del árbol (`buildCategoryItems`) — no usar `model.getCategories()` (API no fiable)
- Bounding box: intentar `getMergedBox()`, fallback a `model.object.updateMatrixWorld(true)` + `new THREE.Box3().setFromObject(model.object)`

### Layout del visor
```
[Panel izquierdo w-56] [Canvas flex-1] [Panel derecho w-64]
```
- Panel izquierdo: botón IFC + tabs (Árbol | Categ. | Sección)
- Panel derecho: propiedades del elemento seleccionado
- Solo visible en `md+` — móvil tiene botón flotante

---

## Reglas de código

### Lo que siempre hay que hacer
- TypeScript estricto — tipar todo correctamente
- Componentes pequeños — si un componente supera ~200 líneas, considerar dividirlo
- Lógica separada de presentación
- Todo texto visible del sitio va en `src/lib/translations.ts`
- Seguir las interfaces existentes al añadir datos

### Lo que nunca hay que hacer
- No hardcodear textos visibles fuera de `translations.ts`
- No usar `any` sin justificación
- No añadir fuentes adicionales
- No cambiar el color de acento `#0066cc` sin acuerdo explícito
- No modificar el fondo degradado del body sin acuerdo explícito
- No romper el patrón de i18n (componentes deben funcionar en ES y EN)
- No instalar librerías pesadas sin evaluar el impacto en el bundle del visor BIM

### Comentarios
Solo cuando el **por qué** no es obvio. Nunca comentar lo que el código ya dice.

---

## Flujo de trabajo Git

```bash
git pull origin main                          # siempre antes de empezar
git checkout -b feature/nombre-del-cambio     # nueva rama
# ... editar ...
git add .
git commit -m "feat: descripción"
git push origin feature/nombre-del-cambio
# → abrir PR en GitHub → merge → Vercel despliega automáticamente
```

### Convención de commits
`feat:` | `fix:` | `chore:` | `content:` | `refactor:`

### Reglas del repositorio
- Push directo a `main` bloqueado — todo va por PR
- PR requiere 1 aprobación (los admins pueden hacer bypass)
- Borrar la rama tras el merge

---

## Infraestructura

| Servicio | Cuenta | Notas |
|---|---|---|
| GitHub | AecoDigital | github.com/AecoDigital/AECODigital-Web |
| Vercel | AECODigital | Auto-deploy en merge a `main` |
| Dominio | Hostinger | A record → 76.76.21.21. No tocar registros MX |
| Email transaccional | Resend | Pendiente migrar a cuenta AECODigital |

### Variable de entorno requerida
```
RESEND_API_KEY=...   # en Vercel y en .env.local para desarrollo
```
