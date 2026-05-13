export type Lang = "es" | "en";

export const translations = {
  es: {
    navbar: {
      links: [
        { href: "#servicios", label: "Servicios" },
        { href: "#portfolio", label: "Portfolio" },
        { href: "#equipo", label: "Equipo" },
        { href: "/blog", label: "Blog" },
        { href: "/plugins", label: "Recursos" },
        { href: "/bim-viewer", label: "BIM Viewer" },
      ],
      cta: "Contactar",
    },
    hero: {
      badge: "Especialistas en transformación digital AECO",
      subtitle:
        "Consultoría BIM, modelado 3D, gemelos digitales y plataformas web para equipos de arquitectura, ingeniería y construcción.",
      ctaPrimary: "Hablar con nosotros",
      ctaSecondary: "Ver proyectos",
      prefijos: [
        "Construcción",
        "Industria",
        "Entorno",
        "AECO",
        "Conectividad",
        "Colaboración",
        "Innovación",
        "Arquitectura",
        "Desarrollo",
        "AECO",
        "Gemelo",
        "Ingeniería",
      ],
      stats: [
        { value: "150+", label: "Clientes" },
        { value: "15+", label: "Proyectos" },
        { value: "5+", label: "Años" },
      ],
      techLabel: "Tecnologías con las que trabajamos",
    },
    servicios: {
      title: "Qué hacemos",
      subtitle:
        "Cobertura completa del ciclo de vida del activo: desde el diseño hasta la gestión en operación.",
      items: [
        {
          title: "Consultoría BIM",
          description:
            "Implementación de metodología BIM según ISO 19650. PEB, flujos CDE y coordinación multidisciplinar.",
        },
        {
          title: "Proyectos de Infraestructura",
          description:
            "Modelado BIM federado, coordinación de disciplinas y detección de interferencias en proyectos de obra civil y arquitectura.",
        },
        {
          title: "Modelado 3D",
          description:
            "Modelos BIM LOD 300-500, renders fotorrealistas, recorridos virtuales e integración con visores web.",
        },
        {
          title: "Gemelos Digitales",
          description:
            "Digital Twins conectados a sensores IoT. Monitorización de activos, mantenimiento predictivo y FM en tiempo real.",
        },
        {
          title: "GIS e Integración GeoBIM",
          description:
            "Integración de BIM con cartografía. CityGML, ArcGIS y Mapbox para proyectos de escala territorial y urban.",
        },
        {
          title: "Plataformas Web AECO",
          description:
            "Aplicaciones sobre APS/Forge, Speckle e IFC.js. Visores BIM en el navegador, CDE personalizados y APIs REST.",
        },
      ],
    },
    testimonios: {
      title: "Lo que dicen nuestros clientes",
      subtitle: "Empresas del sector AECO que ya han digitalizado sus proyectos con nosotros.",
      items: [
        {
          nombre: "Carlos Martínez",
          cargo: "BIM Manager · Ferrovial",
          texto:
            "Implementaron nuestra estrategia BIM en menos de 3 meses. El 80% de los RFIs se resuelven antes de llegar a obra.",
          initials: "CM",
          color: "#0066cc",
        },
        {
          nombre: "Laura Sánchez",
          cargo: "Directora · Estudio Sánchez Arquitectos",
          texto:
            "El visor BIM cambió cómo presentamos proyectos. Los clientes navegan el modelo en el navegador sin instalar nada.",
          initials: "LS",
          color: "#0284c7",
        },
        {
          nombre: "Alejandro Ruiz",
          cargo: "Responsable FM · Sacyr Facilities",
          texto:
            "El gemelo digital redujo los costes de mantenimiento correctivo un 35%. Una herramienta que ya no concebimos no tener.",
          initials: "AR",
          color: "#0369a1",
        },
        {
          nombre: "Marta Gómez",
          cargo: "Coordinadora BIM · ARUP España",
          texto:
            "Dominan tanto BIM como desarrollo web, algo rarísimo. La integración GeoBIM para nuestro proyecto urbano fue perfecta.",
          initials: "MG",
          color: "#0066cc",
        },
        {
          nombre: "Pablo Torres",
          cargo: "Project Manager · Acciona",
          texto:
            "Cumplimos los requisitos BIM ISO 19650 de un cliente público. Proceso claro, entregables perfectos y sin sorpresas.",
          initials: "PT",
          color: "#0284c7",
        },
        {
          nombre: "Ana Belén Mora",
          cargo: "Gerente · Constructora Mora",
          texto:
            "Formaron a nuestros jefes de obra en tableta e integraron el modelo con el planning. No entendemos trabajar sin él.",
          initials: "AB",
          color: "#0369a1",
        },
      ],
    },
    portfolio: {
      title: "Proyectos",
      subtitle: "Una selección de trabajos recientes en el sector AECO.",
      filterAll: "Todos",
      items: [
        {
          title: "Viaducto BIM — Córdoba",
          categoria: "Infraestructura",
          descripcion:
            "Modelado BIM federado LOD 400 de viaducto de 2.3 km. Coordinación multidisciplinar y entrega ISO 19650.",
          tags: ["Civil 3D", "Revit", "IFC"],
          año: "2024",
        },
        {
          title: "Campus Universitario Digital",
          categoria: "Arquitectura",
          descripcion:
            "Implementación BIM completa: PEB, modelos por disciplina y coordinación de interferencias.",
          tags: ["Revit", "ISO 19650", "BCF"],
          año: "2024",
        },
        {
          title: "Gemelo Digital Hospital Central",
          categoria: "Digital Twin",
          descripcion:
            "Digital Twin hospitalario con 450 sensores IoT. Monitorización en tiempo real de MEP y consumos.",
          tags: ["IoT", "MQTT", "Next.js"],
          año: "2023",
        },
        {
          title: "GeoBIM — Plan Urbanístico",
          categoria: "GIS",
          descripcion:
            "Integración de BIM urbano con cartografía SIG. Análisis de impacto visual y visualización en CesiumJS.",
          tags: ["CesiumJS", "CityGML", "ArcGIS"],
          año: "2023",
        },
        {
          title: "CDE Personalizado",
          categoria: "Infraestructura",
          descripcion:
            "Common Data Environment a medida con visor IFC integrado y workflow de aprobación documental.",
          tags: ["IFC.js", "Next.js", "PostgreSQL"],
          año: "2024",
        },
        {
          title: "Rehabilitación Patrimonio — Sevilla",
          categoria: "Arquitectura",
          descripcion:
            "Scan-to-BIM de edificio patrimonial del s. XVIII. Modelo AS-BUILT LOD 500 para rehabilitación.",
          tags: ["Scan-to-BIM", "Revit", "LOD 500"],
          año: "2023",
        },
      ],
    },
    equipo: {
      title: "El equipo",
      subtitle:
        "Profesionales del sector AECO con experiencia real en obra, diseño y desarrollo digital.",
      members: [
        {
          nombre: "Javier C.",
          rol: "CEO & BIM Manager",
          bio: "Más de 10 años liderando proyectos AECO con metodología BIM. Especialista en estrategia de implementación y estándares ISO 19650.",
          initials: "JC",
        },
        {
          nombre: "Ángel R.",
          rol: "CEO & BIM Manager",
          bio: "Más de 10 años liderando proyectos AECO con metodología BIM. Especialista en estrategia de implementación y estándares ISO 19650.",
          initials: "AR",
        },
        {
          nombre: "Equipo BIM",
          rol: "BIM Coordinators",
          bio: "Coordinadores especializados en arquitectura, estructura e instalaciones MEP. Dominio de Revit, Navisworks e IFC.",
          initials: "BIM",
        },
        {
          nombre: "Desarrollo Digital",
          rol: "Web & Platform Engineers",
          bio: "Ingenieros especializados en plataformas web AECO: visores BIM, gemelos digitales, CDE y APIs sobre APS/Forge y Speckle.",
          initials: "DEV",
        },
      ],
      values: [
        { titulo: "Open BIM", desc: "Estándares IFC y formatos abiertos siempre." },
        { titulo: "Rigor ISO 19650", desc: "Procesos auditables y documentados." },
        { titulo: "Tecnología útil", desc: "Digital al servicio del proyecto, no al revés." },
        { titulo: "Colaboración real", desc: "Integrados con tu equipo desde el día uno." },
      ],
    },
    blog: {
      title: "Blog",
      subtitle: "Artículos sobre el sector AECO, digitalización y más.",
      viewAll: "Ver todos",
      articles: [
        {
          titulo: "ISO 19650: guía práctica para implementar BIM en tu organización",
          categoria: "BIM & Estándares",
          fecha: "15 Abr 2025",
          lectura: "8 min",
          resumen:
            "La norma ISO 19650 establece el marco de trabajo para la gestión de información a lo largo del ciclo de vida de los activos. Te explicamos cómo implementarla paso a paso.",
        },
        {
          titulo: "Gemelos Digitales en edificios: del modelo BIM al sensor IoT",
          categoria: "Digital Twin",
          fecha: "28 Mar 2025",
          lectura: "12 min",
          resumen:
            "Cómo conectar un modelo Revit con sensores en tiempo real para crear un gemelo digital operativo. Casos reales con MQTT y Next.js.",
        },
        {
          titulo: "IFC.js: visualización BIM en el navegador sin plugins",
          categoria: "Desarrollo Web",
          fecha: "10 Mar 2025",
          lectura: "10 min",
          resumen:
            "Tutorial completo para cargar y visualizar modelos IFC directamente en el navegador. Incluye gestión de propiedades y filtrado por disciplina.",
        },
      ],
    },
    plugins: {
      badge: "Herramientas gratuitas",
      title: "Recursos y Automatizaciones",
      subtitle:
        "Scripts, plugins y automatizaciones para equipos AECO. Descarga, usa y adapta libremente.",
      viewAll: "Ver todos",
      viewPlugin: "Ver plugin",
    },
    pluginsPage: {
      breadcrumbHome: "Inicio",
      breadcrumbSection: "Recursos",
      title: "Repositorio",
      subtitle:
        "Scripts, plugins y automatizaciones para equipos AECO. Todos de uso libre. Descarga, adapta y comparte.",
      searchPlaceholder: "Buscar plugin...",
      filterAll: "Todas",
      empty: "No se encontraron plugins con esos criterios.",
      viewPlugin: "Ver plugin",
    },
    pluginDetail: {
      breadcrumbHome: "Inicio",
      breadcrumbSection: "Recursos",
      downloads: "Descargas",
      back: "Volver a Recursos",
      manual: "Manual de uso",
      examples: "Ejemplos visuales",
      imageSoon: "Imagen próximamente",
    },
    contacto: {
      title: "Hablemos",
      subtitle:
        "Cuéntanos tu proyecto. Respondemos en menos de 24 horas con una propuesta sin compromiso.",
      labelEmail: "Email",
      labelLocation: "Ubicación",
      location: "España · Proyectos internacionales",
      followUs: "Síguenos",
      fieldName: "Nombre *",
      fieldEmail: "Email *",
      fieldSubject: "Asunto",
      fieldMessage: "Mensaje *",
      placeholderName: "Tu nombre",
      placeholderEmail: "tu@email.com",
      placeholderSubject: "Consultoría BIM, Proyecto web, Gemelo digital...",
      placeholderMessage: "Cuéntanos tu proyecto...",
      submit: "Enviar mensaje",
      submitted: "¡Mensaje enviado!",
    },
    blogPage: {
      breadcrumbHome: "Inicio",
      breadcrumbSection: "Blog",
      title: "Blog",
      subtitle: "Artículos sobre el sector AECO, digitalización y más.",
      searchPlaceholder: "Buscar artículo...",
      empty: "No se encontraron artículos con esa búsqueda.",
      readArticle: "Leer artículo",
    },
    blogDetail: {
      breadcrumbHome: "Inicio",
      breadcrumbSection: "Blog",
      back: "Volver al Blog",
    },
    footer: {
      links: [
        { href: "#servicios", label: "Servicios" },
        { href: "#portfolio", label: "Portfolio" },
        { href: "#equipo", label: "Equipo" },
        { href: "/blog", label: "Blog" },
        { href: "#contacto", label: "Contacto" },
      ],
      copy: "© 2025 AECODigital · info@aecodigital.com",
    },
  },

  en: {
    navbar: {
      links: [
        { href: "#servicios", label: "Services" },
        { href: "#portfolio", label: "Portfolio" },
        { href: "#equipo", label: "Team" },
        { href: "/blog", label: "Blog" },
        { href: "/plugins", label: "Resources" },
        { href: "/bim-viewer", label: "BIM Viewer" },
      ],
      cta: "Contact",
    },
    hero: {
      badge: "Specialists in AECO digital transformation",
      subtitle:
        "BIM consultancy, 3D modelling, digital twins and web platforms for architecture, engineering and construction teams.",
      ctaPrimary: "Talk to us",
      ctaSecondary: "View projects",
      prefijos: [
        "Construction",
        "Industry",
        "Environment",
        "AECO",
        "Connectivity",
        "Collaboration",
        "Innovation",
        "Architecture",
        "Development",
        "AECO",
        "Twin",
        "Engineering",
      ],
      stats: [
        { value: "150+", label: "Clients" },
        { value: "15+", label: "Projects" },
        { value: "5+", label: "Years" },
      ],
      techLabel: "Technologies we work with",
    },
    servicios: {
      title: "What we do",
      subtitle:
        "Full coverage of the asset lifecycle: from design to operational management.",
      items: [
        {
          title: "BIM Consultancy",
          description:
            "BIM methodology implementation per ISO 19650. BEP, CDE workflows and multidisciplinary coordination.",
        },
        {
          title: "Infrastructure Projects",
          description:
            "Federated BIM modelling, discipline coordination and clash detection in civil engineering and architecture projects.",
        },
        {
          title: "3D Modelling",
          description:
            "BIM models LOD 300-500, photorealistic renders, virtual walkthroughs and web viewer integration.",
        },
        {
          title: "Digital Twins",
          description:
            "Digital Twins connected to IoT sensors. Asset monitoring, predictive maintenance and real-time FM.",
        },
        {
          title: "GIS & GeoBIM Integration",
          description:
            "BIM integration with cartography. CityGML, ArcGIS and Mapbox for territorial and urban-scale projects.",
        },
        {
          title: "AECO Web Platforms",
          description:
            "Applications on APS/Forge, Speckle and IFC.js. Browser-based BIM viewers, custom CDEs and REST APIs.",
        },
      ],
    },
    testimonios: {
      title: "What our clients say",
      subtitle: "AECO sector companies that have already digitised their projects with us.",
      items: [
        {
          nombre: "Carlos Martínez",
          cargo: "BIM Manager · Ferrovial",
          texto:
            "They implemented our BIM strategy in under 3 months. 80% of RFIs are resolved before reaching site.",
          initials: "CM",
          color: "#0066cc",
        },
        {
          nombre: "Laura Sánchez",
          cargo: "Director · Estudio Sánchez Arquitectos",
          texto:
            "The BIM viewer changed how we present projects. Clients navigate the model in the browser without installing anything.",
          initials: "LS",
          color: "#0284c7",
        },
        {
          nombre: "Alejandro Ruiz",
          cargo: "FM Manager · Sacyr Facilities",
          texto:
            "The digital twin reduced corrective maintenance costs by 35%. A tool we can no longer imagine working without.",
          initials: "AR",
          color: "#0369a1",
        },
        {
          nombre: "Marta Gómez",
          cargo: "BIM Coordinator · ARUP Spain",
          texto:
            "They master both BIM and web development — an extremely rare combination. The GeoBIM integration for our urban project was perfect.",
          initials: "MG",
          color: "#0066cc",
        },
        {
          nombre: "Pablo Torres",
          cargo: "Project Manager · Acciona",
          texto:
            "We met the ISO 19650 BIM requirements for a public client. Clear process, perfect deliverables and no surprises.",
          initials: "PT",
          color: "#0284c7",
        },
        {
          nombre: "Ana Belén Mora",
          cargo: "Manager · Constructora Mora",
          texto:
            "They trained our site managers on tablet and integrated the model with the schedule. We can't imagine working without it.",
          initials: "AB",
          color: "#0369a1",
        },
      ],
    },
    portfolio: {
      title: "Projects",
      subtitle: "A selection of recent work in the AECO sector.",
      filterAll: "All",
      items: [
        {
          title: "BIM Viaduct — Córdoba",
          categoria: "Infrastructure",
          descripcion:
            "Federated BIM modelling LOD 400 of a 2.3 km viaduct. Multidisciplinary coordination and ISO 19650 delivery.",
          tags: ["Civil 3D", "Revit", "IFC"],
          año: "2024",
        },
        {
          title: "Digital University Campus",
          categoria: "Architecture",
          descripcion:
            "Full BIM implementation: BEP, discipline models and clash coordination.",
          tags: ["Revit", "ISO 19650", "BCF"],
          año: "2024",
        },
        {
          title: "Digital Twin — Central Hospital",
          categoria: "Digital Twin",
          descripcion:
            "Hospital digital twin with 450 IoT sensors. Real-time monitoring of MEP systems and energy consumption.",
          tags: ["IoT", "MQTT", "Next.js"],
          año: "2023",
        },
        {
          title: "GeoBIM — Urban Plan",
          categoria: "GIS",
          descripcion:
            "Urban BIM integration with GIS cartography. Visual impact analysis and visualisation in CesiumJS.",
          tags: ["CesiumJS", "CityGML", "ArcGIS"],
          año: "2023",
        },
        {
          title: "Custom CDE",
          categoria: "Infrastructure",
          descripcion:
            "Bespoke Common Data Environment with integrated IFC viewer and document approval workflow.",
          tags: ["IFC.js", "Next.js", "PostgreSQL"],
          año: "2024",
        },
        {
          title: "Heritage Renovation — Seville",
          categoria: "Architecture",
          descripcion:
            "Scan-to-BIM of an 18th-century heritage building. AS-BUILT LOD 500 model for renovation works.",
          tags: ["Scan-to-BIM", "Revit", "LOD 500"],
          año: "2023",
        },
      ],
    },
    equipo: {
      title: "The team",
      subtitle:
        "AECO sector professionals with real experience in construction, design and digital development.",
      members: [
        {
          nombre: "Javier C.",
          rol: "CEO & BIM Manager",
          bio: "Over 10 years leading AECO projects with BIM methodology. Specialist in implementation strategy and ISO 19650 standards.",
          initials: "JC",
        },
        {
          nombre: "Ángel R.",
          rol: "CEO & BIM Manager",
          bio: "Over 10 years leading AECO projects with BIM methodology. Specialist in implementation strategy and ISO 19650 standards.",
          initials: "AR",
        },
        {
          nombre: "BIM Team",
          rol: "BIM Coordinators",
          bio: "Coordinators specialised in architecture, structure and MEP installations. Proficient in Revit, Navisworks and IFC.",
          initials: "BIM",
        },
        {
          nombre: "Digital Development",
          rol: "Web & Platform Engineers",
          bio: "Engineers specialised in AECO web platforms: BIM viewers, digital twins, CDEs and APIs on APS/Forge and Speckle.",
          initials: "DEV",
        },
      ],
      values: [
        { titulo: "Open BIM", desc: "IFC standards and open formats, always." },
        { titulo: "ISO 19650 Rigour", desc: "Auditable and documented processes." },
        { titulo: "Useful technology", desc: "Digital at the service of the project, not the other way around." },
        { titulo: "Real collaboration", desc: "Integrated with your team from day one." },
      ],
    },
    blog: {
      title: "Blog",
      subtitle: "Articles on the AECO sector, digitalisation and more.",
      viewAll: "View all",
      articles: [
        {
          titulo: "ISO 19650: a practical guide to implementing BIM in your organisation",
          categoria: "BIM & Standards",
          fecha: "15 Apr 2025",
          lectura: "8 min",
          resumen:
            "ISO 19650 establishes the framework for information management throughout the asset lifecycle. We explain how to implement it step by step.",
        },
        {
          titulo: "Digital Twins in buildings: from BIM model to IoT sensor",
          categoria: "Digital Twin",
          fecha: "28 Mar 2025",
          lectura: "12 min",
          resumen:
            "How to connect a Revit model with real-time sensors to create an operational digital twin. Real-world cases with MQTT and Next.js.",
        },
        {
          titulo: "IFC.js: browser-based BIM visualisation without plugins",
          categoria: "Web Development",
          fecha: "10 Mar 2025",
          lectura: "10 min",
          resumen:
            "A complete tutorial for loading and visualising IFC models directly in the browser. Includes property management and discipline filtering.",
        },
      ],
    },
    plugins: {
      badge: "Free tools",
      title: "Resources & Automations",
      subtitle:
        "Scripts, plugins and automations for AECO teams. Download, use and adapt freely.",
      viewAll: "View all",
      viewPlugin: "View plugin",
    },
    pluginsPage: {
      breadcrumbHome: "Home",
      breadcrumbSection: "Resources",
      title: "Repository",
      subtitle:
        "Scripts, plugins and automations for AECO teams. All free to use. Download, adapt and share.",
      searchPlaceholder: "Search plugin...",
      filterAll: "All",
      empty: "No plugins found matching those criteria.",
      viewPlugin: "View plugin",
    },
    pluginDetail: {
      breadcrumbHome: "Home",
      breadcrumbSection: "Resources",
      downloads: "Downloads",
      back: "Back to Resources",
      manual: "User manual",
      examples: "Visual examples",
      imageSoon: "Image coming soon",
    },
    contacto: {
      title: "Let's talk",
      subtitle:
        "Tell us about your project. We respond within 24 hours with a no-commitment proposal.",
      labelEmail: "Email",
      labelLocation: "Location",
      location: "Spain · International projects",
      followUs: "Follow us",
      fieldName: "Name *",
      fieldEmail: "Email *",
      fieldSubject: "Subject",
      fieldMessage: "Message *",
      placeholderName: "Your name",
      placeholderEmail: "you@email.com",
      placeholderSubject: "BIM consultancy, Web project, Digital twin...",
      placeholderMessage: "Tell us about your project...",
      submit: "Send message",
      submitted: "Message sent!",
    },
    blogPage: {
      breadcrumbHome: "Home",
      breadcrumbSection: "Blog",
      title: "Blog",
      subtitle: "Articles on the AECO sector, digitalisation and more.",
      searchPlaceholder: "Search article...",
      empty: "No articles found for that search.",
      readArticle: "Read article",
    },
    blogDetail: {
      breadcrumbHome: "Home",
      breadcrumbSection: "Blog",
      back: "Back to Blog",
    },
    footer: {
      links: [
        { href: "#servicios", label: "Services" },
        { href: "#portfolio", label: "Portfolio" },
        { href: "#equipo", label: "Team" },
        { href: "/blog", label: "Blog" },
        { href: "#contacto", label: "Contact" },
      ],
      copy: "© 2025 AECODigital · info@aecodigital.com",
    },
  },
} as const;

export type Translations = (typeof translations)["es"];
