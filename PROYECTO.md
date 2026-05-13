# AECO Digital — Guía del Proyecto

## Estructura

- **Dominio:** aecodigital.com (gestionado en Hostinger)
- **Hosting:** Vercel (cuenta javiercorderotorres-2058)
- **Código:** `C:\Users\javie\Desktop\aecodigital-web\`
- **Stack:** Next.js 16 + Tailwind CSS + TypeScript

---

## Cómo publicar cambios

Cada vez que modifiques algo en el código, ejecuta este comando en la carpeta del proyecto para publicarlo en producción:

```bash
cd C:\Users\javie\Desktop\aecodigital-web
vercel --prod
```

---

## Archivos clave

| Archivo | Qué contiene |
|---|---|
| `src/app/page.tsx` | Estructura principal de la página (orden de secciones) |
| `src/app/layout.tsx` | Fondo degradado, metadatos SEO, fuente |
| `src/app/globals.css` | Estilos globales y scrollbar |
| `src/components/Navbar.tsx` | Menú de navegación |
| `src/components/Hero.tsx` | Sección principal con stats y tecnologías |
| `src/components/Servicios.tsx` | Los 6 servicios BIM |
| `src/components/Testimonios.tsx` | Scroll infinito de testimonios de clientes |
| `src/components/Portfolio.tsx` | Proyectos con filtro por categoría |
| `src/components/Equipo.tsx` | Equipo y valores de la empresa |
| `src/components/Blog.tsx` | Artículos técnicos |
| `src/components/Contacto.tsx` | Formulario de contacto |
| `src/components/Footer.tsx` | Pie de página |
| `src/components/NetworkBackground.tsx` | Animación de red de puntos del fondo |

---

## Cambios habituales

### Cambiar un texto o descripción
Abre el componente correspondiente y edita el texto directamente. Luego ejecuta `vercel --prod`.

### Añadir un proyecto al portfolio
Abre `src/components/Portfolio.tsx` y añade un objeto al array `proyectos`:
```ts
{
  title: "Nombre del proyecto",
  categoria: "Infraestructura", // o Arquitectura, Digital Twin, GIS
  descripcion: "Descripción breve.",
  tags: ["Revit", "IFC"],
  año: "2025",
}
```

### Añadir un testimonio
Abre `src/components/Testimonios.tsx` y añade al array `testimonios`. Recuerda que hay 3 por fila (row1 = primeros 3, row2 = siguientes 3).

### Añadir un artículo al blog
Abre `src/components/Blog.tsx` y añade un objeto al array `articulos`.

### Cambiar colores
El color principal es `#0066cc` (azul). Aparece en todos los componentes. Para cambiarlo usa buscar y reemplazar en VS Code (`Ctrl+H`).

El fondo degradado se define en `src/app/layout.tsx` dentro del atributo `style` del `<body>`.

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
| Editar contenido / diseño | Código en `aecodigital-web` + `vercel --prod` |
| Ver visitas y logs | vercel.com → proyecto aecodigital-web |
| Gestionar dominio | Hostinger → Dominios → aecodigital.com |
| Gestionar email | Hostinger → Emails |
