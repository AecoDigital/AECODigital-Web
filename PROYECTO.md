# AECO Digital — Guía del Proyecto

## Estructura

- **Dominio:** aecodigital.com (gestionado en Hostinger)
- **Hosting:** Vercel (cuenta AECODigital)
- **Repositorio:** github.com/AecoDigital/AECODigital-Web (privado → público)
- **Código local:** `C:\Users\javie\Desktop\aecodigital-web\`
- **Stack:** Next.js 16 + Tailwind CSS + TypeScript

---

## Flujo de trabajo (Git + Vercel automático)

**Vercel despliega automáticamente** cada vez que se hace merge a `main`. No hay que ejecutar ningún comando manual.

### Inicio de sesión de trabajo
```bash
git pull origin main        # siempre antes de empezar
```

### Publicar un cambio
```bash
git checkout -b feature/nombre-del-cambio   # nueva rama
# ... editar archivos ...
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-del-cambio
```
Luego abrir un Pull Request en GitHub → aprobar → merge a `main` → Vercel despliega solo.

### Convención de commits
| Prefijo | Cuándo usarlo |
|---|---|
| `feat:` | nueva funcionalidad |
| `fix:` | corrección de bug |
| `chore:` | infraestructura, dependencias |
| `content:` | solo textos, datos, traducciones |
| `refactor:` | mejora interna sin cambio de comportamiento |

---

## Archivos clave

| Archivo | Qué contiene |
|---|---|
| `src/app/page.tsx` | Estructura principal de la página (orden de secciones) |
| `src/app/layout.tsx` | Fondo degradado, metadatos SEO, fuente |
| `src/app/globals.css` | Estilos globales y scrollbar |
| `src/lib/translations.ts` | Todos los textos ES/EN del sitio |
| `src/data/blog.ts` | Artículos del blog |
| `src/data/plugins.ts` | Recursos/plugins del repositorio |
| `src/components/Navbar.tsx` | Menú de navegación |
| `src/components/Hero.tsx` | Sección principal con stats y tecnologías |
| `src/components/Servicios.tsx` | Los 6 servicios BIM |
| `src/components/Testimonios.tsx` | Scroll infinito de testimonios |
| `src/components/Portfolio.tsx` | Proyectos con filtro por categoría |
| `src/components/Equipo.tsx` | Equipo y valores de la empresa |
| `src/components/Blog.tsx` | Sección blog (home) |
| `src/components/Contacto.tsx` | Formulario de contacto (usa Resend) |
| `src/components/Footer.tsx` | Pie de página |
| `src/components/NetworkBackground.tsx` | Animación de red de puntos del fondo |
| `src/components/BimViewerClient.tsx` | Visor IFC — árbol, categorías, sección |

---

## Cambios habituales

### Añadir un artículo al blog
Abre `src/data/blog.ts` y añade un objeto siguiendo la interface `Articulo` (incluir versión EN).

### Añadir un recurso/plugin
Abre `src/data/plugins.ts` y añade un objeto siguiendo la interface `Plugin`.

### Cambiar un texto
Abre `src/lib/translations.ts` — todos los textos visibles del sitio están ahí en ES y EN.

### Añadir un proyecto al portfolio
Abre `src/lib/translations.ts` y añade al array de proyectos en ES y EN.

### Cambiar colores
El color principal es `#0066cc`. El fondo degradado se define en `src/app/layout.tsx` en el `style` del `<body>`.

---

## Variables de entorno

Gestionadas en Vercel (cuenta AECODigital) → proyecto → Environment Variables.

| Variable | Uso |
|---|---|
| `RESEND_API_KEY` | Envío de emails desde el formulario de contacto |

Para desarrollo local, crea un archivo `.env.local` (no se sube al repo):
```
RESEND_API_KEY=tu_clave_aqui
```

---

## DNS y dominio

El dominio `aecodigital.com` apunta a Vercel mediante este registro DNS en Hostinger:

| Tipo | Nombre | Valor |
|---|---|---|
| A | @ | 76.76.21.21 |

**No borrar** los registros MX (son del email info@aecodigital.com).

---

## Gestión

| Tarea | Dónde |
|---|---|
| Desplegar cambios | Merge a `main` en GitHub → automático |
| Ver deploys y logs | vercel.com (cuenta AECODigital) → proyecto |
| Repositorio | github.com/AecoDigital/AECODigital-Web |
| Gestionar dominio | Hostinger → Dominios → aecodigital.com |
| Gestionar email | Hostinger → Emails |
| Emails transaccionales | resend.com (cuenta AECODigital — pendiente migrar) |
