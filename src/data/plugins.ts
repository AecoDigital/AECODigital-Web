export interface Descarga {
  label: string;
  url: string;
  tipo: "github" | "zip" | "dynamo" | "python";
}

export interface Ejemplo {
  titulo: string;
  imagen: string;
}

export interface Plugin {
  slug: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  version: string;
  fecha: string;
  tags: string[];
  manual: string;
  ejemplos: Ejemplo[];
  descargas: Descarga[];
  destacado: boolean;
}

export const plugins: Plugin[] = [
  {
    slug: "ifc-checker",
    nombre: "IFC Checker",
    categoria: "Python",
    descripcion:
      "Validador automático de modelos IFC contra los requisitos de información de ISO 19650. Genera un informe detallado de cumplimiento en PDF o Excel.",
    version: "v1.3.0",
    fecha: "Mar 2025",
    tags: ["IFC", "ISO 19650", "Python", "Validación"],
    destacado: true,
    manual: `## ¿Qué hace IFC Checker?

IFC Checker analiza un modelo IFC y verifica que cumple con los requisitos de información definidos en la norma ISO 19650. Comprueba la presencia y formato correcto de propiedades, clasificaciones y metadatos obligatorios.

## Requisitos

- Python 3.9 o superior
- Biblioteca \`ifcopenshell\`
- Modelo IFC 2x3 o IFC 4

## Instalación

\`\`\`bash
pip install ifcopenshell openpyxl reportlab
python ifc_checker.py --install
\`\`\`

## Uso básico

\`\`\`bash
python ifc_checker.py --input modelo.ifc --output informe.xlsx
\`\`\`

## Parámetros

| Parámetro | Descripción | Ejemplo |
|---|---|---|
| \`--input\` | Ruta al archivo IFC | \`modelo.ifc\` |
| \`--output\` | Ruta del informe | \`informe.xlsx\` |
| \`--format\` | PDF o Excel | \`pdf\` |
| \`--level\` | Nivel de severidad | \`warning\` |

## Qué comprueba

- ✅ Presencia de GlobalId en todos los elementos
- ✅ Clasificación OmniClass / Uniclass asignada
- ✅ Nivel LOD declarado por elemento
- ✅ Propiedades de material obligatorias
- ✅ Coordenadas de referencia correctas (IFC Site)
- ✅ Autoría y fecha de modelo presentes

## Ejemplo de informe

El informe generado incluye una tabla con todos los errores encontrados, clasificados por severidad (Error, Advertencia, Información) y por disciplina.
`,
    ejemplos: [
      { titulo: "Informe de validación en Excel", imagen: "/plugins/ifc-checker/ejemplo-excel.png" },
      { titulo: "Resumen de errores por disciplina", imagen: "/plugins/ifc-checker/ejemplo-resumen.png" },
    ],
    descargas: [
      { label: "Ver en GitHub", url: "#", tipo: "github" },
      { label: "Descargar ZIP", url: "#", tipo: "zip" },
    ],
  },
  {
    slug: "dynamo-excel",
    nombre: "Dynamo Excel Sync",
    categoria: "Dynamo",
    descripcion:
      "Sincronización bidireccional entre parámetros de Revit/Dynamo y hojas de cálculo Excel. Actualiza masivamente propiedades BIM desde una tabla.",
    version: "v2.1.0",
    fecha: "Ene 2025",
    tags: ["Dynamo", "Revit", "Excel", "Automatización"],
    destacado: true,
    manual: `## ¿Qué hace Dynamo Excel Sync?

Este script de Dynamo permite leer y escribir parámetros de elementos de Revit directamente desde y hacia hojas de cálculo Excel, sin necesidad de exportar/importar manualmente.

## Requisitos

- Revit 2022 o superior
- Dynamo 2.13+
- Paquete \`Data-Shapes\` (opcional, para UI)

## Instalación

1. Descarga el archivo \`.dyn\`
2. Abre Dynamo en Revit
3. Ve a **Archivo → Abrir** y selecciona el archivo descargado

## Flujo de trabajo

### Modo Lectura (Revit → Excel)

1. Selecciona los elementos en Revit
2. Define qué parámetros exportar en el nodo de configuración
3. Ejecuta el script — se genera un Excel con una fila por elemento

### Modo Escritura (Excel → Revit)

1. Edita los valores en el Excel generado
2. Abre el script en modo escritura
3. Selecciona el archivo Excel modificado
4. Ejecuta — los parámetros se actualizan en Revit

## Parámetros soportados

- Parámetros de proyecto y de tipo
- Parámetros compartidos
- Parámetros de sistema (solo lectura)

## Notas importantes

> ⚠️ Haz siempre una copia de seguridad del modelo antes de ejecutar en modo escritura.
`,
    ejemplos: [
      { titulo: "Script en Dynamo Player", imagen: "/plugins/dynamo-excel/ejemplo-dynamo.png" },
      { titulo: "Excel generado con parámetros", imagen: "/plugins/dynamo-excel/ejemplo-excel.png" },
    ],
    descargas: [
      { label: "Descargar .dyn", url: "#", tipo: "dynamo" },
      { label: "Ver en GitHub", url: "#", tipo: "github" },
    ],
  },
  {
    slug: "clash-reporter",
    nombre: "Clash Reporter BCF",
    categoria: "Python",
    descripcion:
      "Genera automáticamente informes de interferencias en formato BCF a partir de los resultados de Navisworks. Exporta a PDF y crea issues en BIMcollab.",
    version: "v1.0.2",
    fecha: "Feb 2025",
    tags: ["BCF", "Navisworks", "Clash Detection", "BIMcollab"],
    destacado: true,
    manual: `## ¿Qué hace Clash Reporter?

Clash Reporter toma el informe de interferencias exportado desde Navisworks (.xml o .html) y lo convierte automáticamente en:

- Un archivo BCF estándar listo para importar en cualquier herramienta BIM
- Un informe PDF con capturas, descripción y responsables asignados
- Issues en BIMcollab (requiere API key)

## Requisitos

- Python 3.9+
- Navisworks 2022+ (para exportar el informe fuente)
- Cuenta BIMcollab (opcional, para sincronización)

## Instalación

\`\`\`bash
pip install bcf-client requests lxml
python clash_reporter.py --setup
\`\`\`

## Uso

\`\`\`bash
# Generar BCF desde Navisworks XML
python clash_reporter.py --input clashes.xml --output informe.bcf

# Generar PDF
python clash_reporter.py --input clashes.xml --format pdf --output informe.pdf

# Publicar en BIMcollab
python clash_reporter.py --input clashes.xml --bimcollab --project MI_PROYECTO
\`\`\`

## Asignación de responsables

El script puede asignar automáticamente responsables en función de la disciplina del elemento en clash, configurado en el archivo \`config.yaml\`.
`,
    ejemplos: [
      { titulo: "Informe BCF en BIMcollab", imagen: "/plugins/clash-reporter/ejemplo-bimcollab.png" },
      { titulo: "PDF de interferencias generado", imagen: "/plugins/clash-reporter/ejemplo-pdf.png" },
    ],
    descargas: [
      { label: "Ver en GitHub", url: "#", tipo: "github" },
      { label: "Descargar ZIP", url: "#", tipo: "zip" },
    ],
  },
  {
    slug: "aecod-design",
    nombre: "AECOD Design Plugin",
    categoria: "Revit",
    descripcion:
      "Plugin todo-en-uno para Revit con generación de diseño por IA, acotación automática, exportación a PDF/DWG y evaluación LOD según ISO 19650. Licencia de 365 días incluida.",
    version: "v1.0.0",
    fecha: "May 2025",
    tags: ["Revit", "IA", "ISO 19650", "PDF", "DWG", "Automatización"],
    destacado: true,
    manual: `## ¿Qué hace AECOD Design Plugin?

AECOD Design Plugin es un add-in para Revit que integra cuatro herramientas en una sola instalación, accesibles desde dos pestañas dedicadas en la cinta de Revit.

## Requisitos

- Revit 2022 o superior
- Conexión a internet (para la funcionalidad de IA)
- Licencia AECOD activa (incluida durante 365 días)

## Instalación

1. Descarga el instalador \`.exe\`
2. Cierra Revit si está abierto
3. Ejecuta el instalador como administrador
4. Abre Revit — aparecerán las pestañas **Design** y **AECOD**

## Funcionalidades

### Pestaña Design

#### Generate (IA + modelo 3D)
Genera propuestas de diseño asistidas por inteligencia artificial a partir del modelo 3D activo. Analiza la geometría existente y sugiere alternativas optimizadas.

### Pestaña AECOD

#### Maquetar — Acotación automática
Genera automáticamente todas las cotas necesarias en planta, alzado y sección siguiendo los criterios del proyecto. Ahorra horas de trabajo manual.

#### Print/Export — Exportar a PDF/DWG
Exporta planos por lotes a PDF o DWG con nomenclatura automática según ISO 19650. Configura una vez, exporta todos los planos con un clic.

#### LOD — Evaluación ISO 19650
Evalúa el nivel de desarrollo (LOD) de cada elemento del modelo y genera un informe de cumplimiento con los requisitos de información de la norma ISO 19650.

## Licencia

> Cada instalación incluye una licencia activa de **365 días**. Pasado ese período se puede renovar desde el panel de AECOD.

## Notas

> ⚠️ Ejecutar el instalador con permisos de administrador para que Revit registre el add-in correctamente.
`,
    ejemplos: [
      { titulo: "Interfaz del plugin en Revit", imagen: "/plugins/aecod-design/captura.jpg" },
    ],
    descargas: [
      { label: "Descargar instalador (.exe)", url: "https://github.com/AecoDigital/AECODigital-Web/releases/download/v1.0.0/AECOD_DesignPlugin_Installer.exe", tipo: "zip" },
    ],
  },
  {
    slug: "civil3d-tools-pack",
    nombre: "Civil 3D Tools Pack",
    categoria: "Civil 3D",
    descripcion:
      "Pack de herramientas para Civil 3D que automatiza las tareas más repetitivas en proyectos de infraestructura: exportación de perfiles, movimiento de tierras, generación de cunetas, interoperabilidad GIS/IFC y planos automáticos planta-perfil.",
    version: "v1.0.0",
    fecha: "May 2026",
    tags: ["Civil 3D", "GIS", "IFC", "Excel", "Infraestructura", "Automatización"],
    destacado: true,
    manual: `## ¿Qué hace Civil 3D Tools Pack?

Civil 3D Tools Pack añade un panel dedicado en Civil 3D con herramientas agrupadas en cuatro áreas: Productividad, Cálculo, Interoperabilidad y Reportes.

## Requisitos

- AutoCAD Civil 3D 2022 o superior
- .NET Framework 4.8
- Licencia AECOD activa (incluida durante 365 días)

## Instalación

1. Descarga el instalador \`.exe\`
2. Cierra Civil 3D si está abierto
3. Ejecuta el instalador como administrador
4. Abre Civil 3D — aparecerá el panel **AECOD Civil Tools**

## Herramientas incluidas

### Productividad
- **Exportar Perfiles → Excel** — exporta los perfiles longitudinales del proyecto a una hoja Excel estructurada
- **Verificar Normas** — comprueba que el diseño cumple las normas configurables del proyecto (radios mínimos, pendientes, etc.)
- **Renombrar con patrón** — renombra alineaciones, perfiles y superficies siguiendo un patrón personalizable

### Cálculo
- **Movimiento de Tierras** — calcula volúmenes de desmonte y terraplén y genera el diagrama de masas automáticamente
- **Generar Cunetas 3D** — crea la geometría 3D de cunetas a partir de los perfiles transversales
- **Interferencias entre redes** — detecta conflictos entre redes de drenaje, saneamiento y servicios

### Interoperabilidad
- **Exportar GIS (Shapefile)** — exporta alineaciones, perfiles y superficies a Shapefile compatible con ArcGIS/QGIS
- **Sincronizar Excel (bidireccional)** — lee y escribe parámetros de elementos Civil 3D desde/hacia Excel
- **Exportar IFC 2x3** — exporta el modelo Civil 3D a formato IFC 2x3 para coordinación BIM

### Reportes
- **Planos Automáticos** — genera los layouts de planta-perfil automáticamente con cajetín y escala configurables
- **Extractor de Metrados** — genera el listado de metrados del proyecto en Excel listo para presupuesto

## Notas

> ⚠️ Ejecutar el instalador con permisos de administrador para que Civil 3D registre el add-in correctamente.

## Instalación alternativa (ZIP)

Si el instalador .exe es bloqueado por tu empresa o antivirus, puedes usar el paquete ZIP:

1. Extrae el ZIP en cualquier carpeta
2. Doble clic en **Instalar.bat**
3. Si Windows muestra "¿Ejecutar de todas formas?" → clic en **Más información** → **Ejecutar de todas formas**
4. Reinicia Civil 3D → aparece la pestaña **Civil Tools Pack**
`,
    ejemplos: [],
    descargas: [
      { label: "Descargar instalador (.exe)", url: "https://github.com/AecoDigital/AECODigital-Web/releases/download/civil3d-v1.0.0/Civil3DToolsPack_Setup.exe", tipo: "zip" },
      { label: "Descargar ZIP (instalación manual)", url: "https://github.com/AecoDigital/AECODigital-Web/releases/download/civil3d-v1.0.0/Civil3DToolsPack_v1.0.zip", tipo: "zip" },
    ],
  },
  {
    slug: "bim-dashboard",
    nombre: "BIM Dashboard KPIs",
    categoria: "Python",
    descripcion:
      "Script Python que extrae KPIs de modelos BIM (LOD, completitud de propiedades, nº de elementos, volúmenes) y los visualiza en un dashboard interactivo.",
    version: "v1.1.0",
    fecha: "Abr 2025",
    tags: ["Python", "KPIs", "IFC", "Dashboard", "Plotly"],
    destacado: true,
    manual: `## ¿Qué hace BIM Dashboard?

BIM Dashboard analiza uno o varios modelos IFC y genera un dashboard web interactivo con los principales indicadores de calidad y avance del modelo BIM.

## Requisitos

- Python 3.10+
- \`ifcopenshell\`, \`plotly\`, \`dash\`

## Instalación

\`\`\`bash
pip install ifcopenshell plotly dash pandas
\`\`\`

## Ejecutar el dashboard

\`\`\`bash
python bim_dashboard.py --models modelo1.ifc modelo2.ifc
\`\`\`

Abre automáticamente \`http://localhost:8050\` en el navegador.

## KPIs disponibles

| Indicador | Descripción |
|---|---|
| Completitud LOD | % de elementos con LOD declarado |
| Cobertura de propiedades | % de parámetros obligatorios rellenos |
| Nº de elementos por disciplina | Desglose ARQ / EST / MEP |
| Volumen total por tipo | m³ de hormigón, acero, vidrio... |
| Distribución por planta | Elementos agrupados por nivel |
| Tendencia temporal | Evolución del modelo entre versiones |

## Comparativa multi-modelo

Si se pasan varios archivos IFC, el dashboard muestra un panel comparativo entre versiones del mismo proyecto o entre disciplinas.
`,
    ejemplos: [
      { titulo: "Dashboard de KPIs en navegador", imagen: "/plugins/bim-dashboard/ejemplo-dashboard.png" },
      { titulo: "Gráfico de completitud LOD", imagen: "/plugins/bim-dashboard/ejemplo-lod.png" },
    ],
    descargas: [
      { label: "Ver en GitHub", url: "#", tipo: "github" },
      { label: "Descargar ZIP", url: "#", tipo: "zip" },
      { label: "Documentación completa", url: "#", tipo: "zip" },
    ],
  },
];

export function getPlugin(slug: string): Plugin | undefined {
  return plugins.find((p) => p.slug === slug);
}

export function getPluginsDestacados(): Plugin[] {
  return plugins.filter((p) => p.destacado);
}
