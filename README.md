# AECO Digital — Web Corporativa

![CI](https://github.com/AecoDigital/AECODigital-Web/actions/workflows/ci.yml/badge.svg)

Sitio web oficial de [aecodigital.com](https://aecodigital.com) — consultoría especializada en transformación digital del sector AECO (Arquitectura, Ingeniería, Construcción y Operaciones).

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Fuente | Space Grotesk |
| BIM / 3D | @thatopen/components + THREE.js |
| Email | Resend |
| Analytics | Vercel Analytics |
| Hosting | Vercel (auto-deploy desde `main`) |

---

## Funcionalidades

- **Web corporativa** — Hero, Servicios, Portfolio, Equipo, Testimonios, Blog, Contacto
- **Blog técnico** — artículos especializados en BIM, gemelos digitales e IFC
- **Repositorio de recursos** — plugins y herramientas para profesionales AECO
- **Visor BIM** — carga y visualización de modelos IFC directamente en el navegador
  - Árbol de modelo con jerarquía espacial IFC
  - Panel de categorías con toggle de visibilidad por tipo
  - Planos de sección en ejes X, Y, Z
  - Selección múltiple, propiedades de elementos, menú contextual
- **i18n ES/EN** — sistema propio de internacionalización con React Context

---

## Desarrollo local

### Requisitos
- Node.js 18+
- npm

### Instalación

```bash
git clone https://github.com/AecoDigital/AECODigital-Web.git
cd AECODigital-Web
npm install
```

VS Code detectará automáticamente las extensiones recomendadas (Tailwind, ESLint, Prettier, GitLens) y preguntará si quieres instalarlas.

### Variables de entorno

```bash
cp .env.example .env.local
```

Abre `.env.local` y rellena los valores. En Windows: `copy .env.example .env.local`.

### Arrancar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Flujo de trabajo

Este repositorio usa **protección de rama** — no se puede hacer push directo a `main`. Todo cambio requiere una rama y un Pull Request.

```bash
# 1. Actualizar antes de empezar
git pull origin main

# 2. Crear rama para el cambio
git checkout -b feature/nombre-del-cambio

# 3. Desarrollar y commitear
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-del-cambio

# 4. Abrir Pull Request en GitHub → CI valida → merge → Vercel despliega automáticamente
```

El CI ejecuta TypeScript check + build en cada PR. Si falla, el merge queda bloqueado.

### Convención de commits

| Prefijo | Uso |
|---|---|
| `feat:` | nueva funcionalidad |
| `fix:` | corrección de bug |
| `chore:` | infraestructura, dependencias, configuración |
| `content:` | textos, datos, traducciones |
| `refactor:` | mejora interna sin cambio de comportamiento |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── layout.tsx               # Root layout
│   ├── bim-viewer/              # Visor IFC
│   ├── blog/                    # Blog y detalle de artículos
│   ├── plugins/                 # Repositorio de recursos
│   └── api/contact/             # API de formulario de contacto
├── components/                  # Componentes React
├── data/
│   ├── blog.ts                  # Artículos del blog
│   └── plugins.ts               # Recursos/plugins
└── lib/
    ├── i18n.tsx                 # Context y hook de idioma
    └── translations.ts          # Todos los textos ES/EN
```

---

## Añadir contenido

### Nuevo artículo de blog
Abre `src/data/blog.ts` y añade un objeto siguiendo la interface `Articulo` (incluir versión EN).

### Nuevo recurso/plugin
Abre `src/data/plugins.ts` y añade un objeto siguiendo la interface `Plugin`.

### Nuevo texto o traducción
Todos los textos visibles del sitio están en `src/lib/translations.ts` en ES y EN. Nunca hardcodear texto en los componentes.

---

## Infraestructura

| Servicio | Cuenta |
|---|---|
| GitHub | [AecoDigital](https://github.com/AecoDigital) |
| Vercel | AECODigital (auto-deploy en merge a `main`) |
| Dominio | Hostinger — A record → 76.76.21.21 |
| Email transaccional | Resend |

---

## Licencia

Código privado — © AECO Digital. Todos los derechos reservados.
