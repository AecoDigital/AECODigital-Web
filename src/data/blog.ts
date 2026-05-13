export interface Articulo {
  slug: string;
  titulo: string;
  tituloEn: string;
  categoria: string;
  categoriaEn: string;
  fecha: string;
  fechaEn: string;
  lectura: string;
  resumen: string;
  resumenEn: string;
  contenido: string;
  contenidoEn: string;
  tags: string[];
  destacado: boolean;
}

export const articulos: Articulo[] = [
  {
    slug: "iso-19650-guia-practica",
    titulo: "ISO 19650: guía práctica para implementar BIM en tu organización",
    tituloEn: "ISO 19650: a practical guide to implementing BIM in your organisation",
    categoria: "BIM & Estándares",
    categoriaEn: "BIM & Standards",
    fecha: "15 Abr 2025",
    fechaEn: "15 Apr 2025",
    lectura: "8 min",
    resumen:
      "La norma ISO 19650 establece el marco de trabajo para la gestión de información a lo largo del ciclo de vida de los activos. Te explicamos cómo implementarla paso a paso.",
    resumenEn:
      "ISO 19650 establishes the framework for information management throughout the asset lifecycle. We explain how to implement it step by step.",
    tags: ["ISO 19650", "BIM", "CDE", "Estándares"],
    destacado: true,
    contenido: `Hay una reunión de coordinación que se repite, con nombres distintos, en casi todos los proyectos de construcción. Alguien comparte pantalla con un plano. Alguien al otro lado dice "espera, yo tengo una versión diferente". El coordinador abre su carpeta. Hay cinco archivos con el mismo nombre y fechas distintas. La reunión lleva veinte minutos y todavía no se ha hablado del proyecto.

No es un problema de personas. Es un problema de sistema — o más exactamente, de la ausencia de uno.

La ISO 19650 nació para resolver exactamente esto. No es una norma burocrática pensada para llenar carpetas de auditoría: es un framework práctico que define cómo se crea, comparte y gestiona la información digital a lo largo de todo el ciclo de vida de un activo construido. Desde el primer boceto hasta la gestión del mantenimiento veinte años después de la entrega.

La promesa no es eliminar los problemas de coordinación — eso sería ingenuo. La promesa es más concreta: que cuando surja un conflicto, el equipo sepa exactamente dónde está la información válida, quién la aprobó y cuándo. Que el debate no sea sobre qué versión es la correcta, sino sobre cómo resolver el problema real.

En este artículo explicamos qué es la norma, qué conceptos hay que dominar y cómo implementarla en tu organización de forma que genere valor real desde el primer proyecto.

---

## ¿Qué es la ISO 19650?

La ISO 19650 es el estándar internacional para la organización y digitalización de información en edificios e infraestructuras mediante BIM. Se organiza en varias partes, cada una enfocada en una fase o aspecto diferente del proceso:

| Parte | Alcance |
|---|---|
| ISO 19650-1 | Conceptos y principios generales |
| ISO 19650-2 | Fase de entrega de activos (diseño y construcción) |
| ISO 19650-3 | Fase operacional (uso y mantenimiento) |
| ISO 19650-5 | Enfoque de seguridad para la información |

Las partes 1 y 2 son las más relevantes para la mayoría de los equipos de proyecto. La parte 3 entra en juego una vez que el activo está construido y se gestiona a lo largo de su vida útil.

---

## Los tres conceptos que lo sustentan todo

Antes de entrar en la implementación, hay tres conceptos que conviene entender bien porque todo lo demás se construye sobre ellos.

### EIR — Employer's Information Requirements

El cliente define qué información necesita, en qué formato y en qué momento del proyecto. Es el punto de partida de todo el proceso. Un EIR bien redactado responde preguntas concretas: ¿necesito el modelo georeferenciado? ¿En qué nivel de detalle quiero las instalaciones al final del proyecto? ¿Qué propiedades necesito para conectar el modelo al sistema de mantenimiento?

Sin un EIR claro, los equipos producen información que nadie ha pedido y omiten la que realmente importa.

### BEP — BIM Execution Plan

El equipo responde al EIR con un Plan de Ejecución BIM que detalla cómo se producirá, gestionará y entregará la información. El BEP no es un documento para el cajón: es el contrato técnico del proyecto. Incluye roles, convenciones de nomenclatura, niveles de información por fase, flujos de revisión y aprobación, y los formatos de entrega pactados.

### CDE — Common Data Environment

El entorno centralizado donde vive toda la información del proyecto. Puede ser una plataforma como Autodesk Construction Cloud, BIMcollab, o una solución propia. Lo esencial no es la plataforma sino cómo se gestiona el estado de la información:

> **En trabajo → En revisión → Aprobado → Publicado**

Estos cuatro estados no son formalidad. Son la diferencia entre que alguien trabaje con un plano desactualizado sin saberlo y que todos en el proyecto sepan exactamente con qué versión están trabajando.

---

## ¿Qué pasa cuando no se aplica?

Antes de pasar a los pasos de implementación, vale la pena ser concretos sobre el coste real de no tener un proceso definido.

Los estudios sectoriales estiman que entre el 30 % y el 40 % del tiempo de los técnicos en proyectos de construcción se dedica a buscar información, resolver conflictos de versiones o repetir trabajo que ya se había hecho. Las interferencias entre disciplinas que se descubren en obra — una tubería que pasa por donde va una viga, un falso techo que choca con las luminarias — pueden multiplicar por diez el coste de lo que habría sido una simple verificación en el modelo.

La ISO 19650 no elimina estos problemas de forma mágica. Lo que hace es crear las condiciones para que no ocurran.

---

## Cómo implementarla paso a paso

### 1. Diagnóstico inicial

Evalúa el nivel de madurez BIM actual de tu organización. ¿Tienes plantillas de Revit o Archicad? ¿Una nomenclatura definida y respetada? ¿Un CDE operativo o carpetas de Dropbox que "más o menos funcionan"? Identificar las brechas es el primer paso honesto.

### 2. Redactar el OIR

Define los Requisitos de Información Organizacional: qué información necesita tu empresa para operar y tomar decisiones. El OIR alimenta todos los EIR que generarás en los proyectos concretos.

### 3. Establecer el CDE

Elige o implementa la plataforma de datos común. La elección de herramienta importa menos que la disciplina en su uso: un equipo disciplinado con una plataforma sencilla supera a un equipo caótico con la mejor herramienta del mercado.

### 4. Crear las plantillas

Desarrolla plantillas de Revit, Archicad o Civil 3D alineadas con los estándares de nomenclatura y clasificación que hayas adoptado — Uniclass, OmniClass, o los que defina el cliente. Las plantillas son la forma más eficaz de garantizar la consistencia sin depender de que cada técnico recuerde las convenciones.

### 5. Formación y adopción

La tecnología es la parte fácil. El cambio cultural es el verdadero reto. Forma a todos los roles implicados: proyectistas, coordinadores, jefes de obra, facility managers. Cada uno necesita entender no solo cómo usar las herramientas sino por qué el proceso beneficia a su trabajo específico.

### 6. Auditoría y mejora continua

Define indicadores de calidad del modelo — completitud del LOD comprometido, cobertura de propiedades requeridas por el EIR — y revísalos en cada hito del proyecto. Lo que no se mide no mejora.

---

## Los errores más frecuentes

Después de acompañar implementaciones en organizaciones de distinto tamaño, hay cuatro patrones que se repiten:

- **Empezar por la herramienta antes que por el proceso.** Comprar ACC o BIMcollab sin haber definido el flujo de trabajo es un error caro.
- **No involucrar al cliente en la definición del EIR.** Si el cliente no sabe qué pedir, recibirá lo que el equipo decida darle — que no siempre es lo que necesita.
- **Crear un BEP que nadie lee después del día uno.** Un BEP útil es breve, concreto y se referencia activamente durante el proyecto.
- **Confundir el CDE con un servidor de archivos.** Un servidor de archivos almacena. Un CDE gestiona estados, versiones y permisos.

---

## Conclusión

ISO 19650 es una inversión, no un coste. Las organizaciones que la implementan correctamente reducen los RFIs, mejoran la coordinación entre disciplinas y entregan proyectos más predecibles. El estándar no garantiza proyectos perfectos — pero sí elimina categorías enteras de problemas que hoy se consideran inevitables.

El primer paso es el diagnóstico honesto de dónde estás ahora. El resto es proceso.
`,
    contenidoEn: `There is a coordination meeting that repeats itself, under different names, on almost every construction project. Someone shares a drawing on screen. Someone on the other side says "wait, I have a different version". The coordinator opens their folder. There are five files with the same name and different dates. The meeting has been running for twenty minutes and nobody has talked about the project yet.

This is not a people problem. It is a systems problem — or more precisely, the absence of one.

ISO 19650 was created precisely to solve this. It is not a bureaucratic standard designed to fill audit folders — it is a practical framework that defines how digital information is created, shared and managed throughout the entire lifecycle of a built asset. From the first sketch to maintenance management twenty years after handover.

The promise is not to eliminate coordination problems — that would be naive. The promise is more concrete: that when a conflict arises, the team knows exactly where the valid information is, who approved it and when. That the debate is not about which version is correct, but about how to solve the actual problem.

In this article we explain what the standard is, which concepts to master, and how to implement it in your organisation in a way that delivers real value from the very first project.

---

## What is ISO 19650?

ISO 19650 is the international standard for the organisation and digitalisation of information in buildings and infrastructure using BIM. It is structured in several parts, each focused on a different phase or aspect of the process:

| Part | Scope |
|---|---|
| ISO 19650-1 | Concepts and general principles |
| ISO 19650-2 | Delivery phase of assets (design and construction) |
| ISO 19650-3 | Operational phase (use and maintenance) |
| ISO 19650-5 | Security-minded approach to information |

Parts 1 and 2 are the most relevant for most project teams. Part 3 comes into play once the asset is built and managed throughout its useful life.

---

## The three concepts underpinning everything

Before moving to implementation, there are three concepts worth understanding well — everything else is built on top of them.

### EIR — Employer's Information Requirements

The client defines what information they need, in what format and at what point in the project. It is the starting point of the entire process. A well-written EIR answers concrete questions: does the model need to be georeferenced? What level of detail do I need for the installations at project completion? What properties do I need to connect the model to the maintenance system?

Without a clear EIR, teams produce information nobody asked for and omit what truly matters.

### BEP — BIM Execution Plan

The team responds to the EIR with a BIM Execution Plan that details how information will be produced, managed and delivered. The BEP is not a document for a drawer — it is the technical contract of the project. It includes roles, naming conventions, information levels per phase, review and approval workflows, and the agreed delivery formats.

### CDE — Common Data Environment

The centralised environment where all project information lives. It can be a platform such as Autodesk Construction Cloud, BIMcollab, or a bespoke solution. What matters is not the platform but how the state of information is managed:

> **In progress → In review → Approved → Published**

These four states are not formality. They are the difference between someone working from an outdated drawing without knowing it, and everyone on the project knowing exactly which version they are working from.

---

## What happens without it?

Before moving to the implementation steps, it is worth being concrete about the real cost of not having a defined process.

Industry studies estimate that between 30% and 40% of technical staff time on construction projects is spent searching for information, resolving version conflicts or repeating work that had already been done. Discipline clashes discovered on site — a pipe running through where a beam is, a suspended ceiling clashing with luminaires — can multiply by ten the cost of what would have been a simple model check.

ISO 19650 does not eliminate these problems by magic. What it does is create the conditions for them not to occur.

---

## How to implement it step by step

### 1. Initial diagnosis

Assess your organisation's current BIM maturity. Do you have Revit or Archicad templates? Defined and followed naming conventions? An operational CDE, or Dropbox folders that "more or less work"? Identifying the gaps is the first honest step.

### 2. Draft the OIR

Define the Organisational Information Requirements: what information does your company need to operate and make decisions? The OIR feeds into all the EIRs you will generate for specific projects.

### 3. Establish the CDE

Choose or implement the common data platform. The choice of tool matters less than the discipline in its use: a disciplined team with a simple platform outperforms a chaotic team with the best tool on the market.

### 4. Create templates

Develop Revit, Archicad or Civil 3D templates aligned with the naming and classification standards you have adopted — Uniclass, OmniClass, or those defined by the client. Templates are the most effective way to guarantee consistency without relying on every technician remembering the conventions.

### 5. Training and adoption

The technology is the easy part. The cultural change is the real challenge. Train all involved roles: designers, coordinators, site managers, facility managers. Each one needs to understand not just how to use the tools but why the process benefits their specific work.

### 6. Audit and continuous improvement

Define model quality indicators — LOD completeness, EIR property coverage — and review them at each project milestone. What is not measured does not improve.

---

## The most common mistakes

After accompanying implementations in organisations of different sizes, four patterns repeat themselves:

- **Starting with the tool before the process.** Buying ACC or BIMcollab without having defined the workflow is an expensive mistake.
- **Not involving the client in EIR definition.** If the client does not know what to ask for, they will receive what the team decides to give them — which is not always what they need.
- **Creating a BEP that nobody reads after day one.** A useful BEP is brief, concrete and actively referenced during the project.
- **Confusing the CDE with a file server.** A file server stores. A CDE manages states, versions and permissions.

---

## Conclusion

ISO 19650 is an investment, not a cost. Organisations that implement it correctly reduce RFIs, improve cross-discipline coordination and deliver more predictable projects. The standard does not guarantee perfect projects — but it does eliminate entire categories of problems currently considered inevitable.

The first step is an honest diagnosis of where you are now. The rest is process.
`,
  },
  {
    slug: "gemelos-digitales-bim-iot",
    titulo: "Gemelos digitales en edificios: del modelo BIM al sensor IoT",
    tituloEn: "Digital twins in buildings: from BIM model to IoT sensor",
    categoria: "Digital Twin",
    categoriaEn: "Digital Twin",
    fecha: "14 May 2025",
    fechaEn: "14 May 2025",
    lectura: "12 min",
    resumen:
      "Cómo conectar un modelo de Revit con sensores en tiempo real para crear un gemelo digital operativo. Arquitectura de referencia, código real con MQTT y Next.js, y tres casos de uso en producción.",
    resumenEn:
      "How to connect a Revit model with real-time sensors to create an operational digital twin. Reference architecture, real code with MQTT and Next.js, and three production use cases.",
    tags: ["Digital Twin", "IoT", "MQTT", "Next.js", "BIM", "APS"],
    destacado: true,
    contenido: `Imagina que puedes ver tu edificio como si fuera un organismo vivo. No los planos en papel, no el modelo 3D estático en el ordenador del proyectista — sino el edificio real, en este momento, respirando. Sabes qué temperatura hace en cada sala. Sabes qué equipos están al límite. Sabes qué zona lleva tres horas climatizada sin que haya nadie dentro. Y no lo sabes porque alguien ha ido a comprobarlo: lo sabes porque el edificio te lo está contando.

Eso es, en esencia, un gemelo digital.

La industria de la construcción ha invertido décadas en perfeccionar el modelo BIM. Hoy los proyectos se diseñan con un nivel de detalle extraordinario: cada tubería, cada viga, cada espacio tiene su representación digital. Pero hay un momento en que ese esfuerzo se detiene: el día de la entrega de obra. A partir de entonces, el modelo queda congelado en el tiempo, incapaz de reflejar que el HVAC de la planta 8 lleva tres días al 94 % de carga, que la bomba de calor del sótano empieza a vibrar de forma inusual, o que el aula 304 nunca alcanza los 21 °C aunque la calefacción lleve horas encendida.

La brecha entre el modelo que tenemos y el edificio que opera es, en muchos casos, total.

El gemelo digital nace precisamente para cerrar esa brecha. Conecta el modelo BIM — con toda su geometría y semántica — a una red de sensores que captura el estado real del edificio en tiempo real. El resultado no es solo un dashboard bonito: es un sistema que puede detectar problemas antes de que ocurran, optimizar el consumo energético de forma automática y generar documentación de mantenimiento sin intervención humana.

En este artículo explicamos cómo se construye esa conexión. Empezamos por los conceptos — pensando en quienes se acercan al tema por primera vez — y avanzamos hacia la implementación técnica real: protocolos, código y decisiones de arquitectura que hemos validado en proyectos en producción.

---

## ¿Qué es (y qué no es) un gemelo digital?

El término se usa con demasiada libertad. Un gemelo digital no es un modelo 3D bonito con datos pegados encima. Es un sistema con tres componentes inseparables: el **modelo de datos** (la geometría y semántica del BIM), el **flujo de datos en tiempo real** (los sensores) y la **capa de análisis** que une ambos para tomar decisiones.

> "El gemelo digital no replica el edificio: lo observa, aprende de él y eventualmente lo anticipa."

La diferencia entre un dashboard de FM y un gemelo real está en si el sistema puede cerrar el bucle: detectar una anomalía — correlacionarla con la geometría BIM — proponer o ejecutar una acción. Sin ese cierre, es solo monitorización.

---

## ¿Cómo funciona en la práctica?

Antes de entrar en código y protocolos, vale la pena entender el flujo de forma intuitiva. Piensa en tres actores que tienen que hablar entre sí:

**El edificio físico** tiene sensores repartidos por sus instalaciones: termómetros, medidores de CO₂, contadores eléctricos, detectores de ocupación. Cada uno de ellos genera datos continuamente — valores pequeños, sencillos, pero constantes.

**El modelo BIM** es el mapa. Sabe que la sala 304 está en la tercera planta, que tiene 48 m², que pertenece al circuito de climatización norte y que su ventana da al sur. Sin los sensores, ese mapa es estático. Sin el mapa, los datos de los sensores no tienen contexto espacial.

**La plataforma digital** es quien conecta ambos mundos. Recibe los datos del edificio, los sitúa en el modelo y ofrece una interfaz en la que cualquier persona — no solo ingenieros — puede entender de un vistazo qué está pasando y dónde.

El resultado es que cuando un sensor detecta una anomalía, el sistema no solo lanza una alerta: señala exactamente qué elemento del modelo está afectado, en qué planta, a qué sistema pertenece y cuál es su historial. El técnico de mantenimiento llega sabiendo ya lo que tiene que hacer.

Esta es la promesa. A continuación explicamos cómo se construye técnicamente.

---

## La arquitectura de referencia

Antes de escribir una línea de código, es útil tener claro el flujo de extremo a extremo. La siguiente pila es la que hemos validado en tres proyectos reales:

| Capa | Descripción | Tecnologías |
|------|-------------|-------------|
| Física | Sensores y actuadores | Zigbee · Modbus · LoRaWAN |
| Transporte | Broker de mensajes | MQTT (Mosquitto / HiveMQ) |
| Procesamiento | Backend IoT | Node.js · InfluxDB · TimescaleDB |
| Gemelo digital | Modelo BIM + datos en tiempo real | Forge / APS · IFC.js · Next.js · WebSocket |

La clave está en el mapeo entre el **sensor ID** físico y el **GUID de Revit**. Sin esa tabla de correspondencias —que parece trivial y no lo es— el dato llega pero no sabe a qué elemento del modelo pertenece.

---

## MQTT: el protocolo que mueve los datos

MQTT (Message Queuing Telemetry Transport) es el estándar de facto para redes de sensores en edificios. Ligero, asíncrono y diseñado para links inestables. Cada sensor publica en un *topic* jerárquico; el backend se suscribe y procesa.

### Convención de topics recomendada

\`\`\`
# estructura recomendada
edificio/{id_proyecto}/{planta}/{zona}/{tipo_sensor}/{sensor_id}

# ejemplos reales
edificio/p42/b3/sala-reuniones-01/temperatura/sens-0091
edificio/p42/b3/sala-reuniones-01/co2/sens-0092
edificio/p42/cubierta/hvac-principal/consumo/meter-001
\`\`\`

Esta jerarquía permite suscripciones con comodines (\`edificio/p42/b3/#\`) para procesar toda la planta 3 de un proyecto con una sola instrucción. Ahorrar tráfico innecesario en la capa de procesamiento es esencial cuando hay cientos de sensores activos.

### Suscripción desde Node.js

\`\`\`javascript
import mqtt from 'mqtt';
import { mapSensorToRevitGuid } from './bim-mapping.js';
import { writeMetric } from './influx-client.js';

const client = mqtt.connect('mqtts://broker.edificio.com:8883', {
  clientId: 'dt-backend-01',
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
});

client.on('connect', () => {
  client.subscribe('edificio/p42/#', { qos: 1 });
});

client.on('message', async (topic, payload) => {
  const [, proyecto, planta, zona, tipo, sensorId] = topic.split('/');
  const valor = parseFloat(payload.toString());

  // mapeo crítico: sensor → GUID de Revit
  const revitGuid = await mapSensorToRevitGuid(sensorId);
  if (!revitGuid) return; // sensor no registrado en BIM

  await writeMetric({ sensorId, revitGuid, tipo, zona, valor });

  // emitir via WebSocket al frontend Next.js
  wss.broadcast({ revitGuid, tipo, valor, ts: Date.now() });
});
\`\`\`

> **QoS 1 vs QoS 2:** en sensores de temperatura o CO₂ es suficiente QoS 1 (al menos una entrega). Para alarmas de incendio o control de acceso, usa QoS 2 (exactamente una entrega). El overhead de QoS 2 es real; no lo apliques de forma indiscriminada.

---

## Conectar el modelo Revit al frontend

El modelo de Revit necesita dos transformaciones: exportarse a un formato web-friendly (SVF2 o IFC) y exponerse a través de un API. Aquí es donde entra Autodesk Platform Services (APS, antes Forge) o, si buscas open source, **IFC.js** con su propio pipeline.

### Actualización de propiedades en Next.js vía WebSocket

\`\`\`typescript
// useDigitalTwin.ts
import { useEffect, useRef, useState } from 'react';

type SensorUpdate = {
  revitGuid: string;
  tipo: string;
  valor: number;
  ts: number;
};

export function useDigitalTwin() {
  const [updates, setUpdates] = useState<Map<string, SensorUpdate>>(
    new Map()
  );
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL!
    );

    wsRef.current.onmessage = (e) => {
      const update: SensorUpdate = JSON.parse(e.data);
      setUpdates(prev => {
        const next = new Map(prev);
        next.set(update.revitGuid, update);
        return next;
      });
    };

    return () => wsRef.current?.close();
  }, []);

  return updates;
}
\`\`\`

Este hook alimenta directamente el viewer de APS: cada vez que llega un mensaje, el componente llama a \`model.setThemingColor(dbId, color)\` para colorear el elemento según su valor. El usuario ve el edificio cambiar en tiempo real, elemento a elemento.

---

## Tres casos reales en producción

### Caso 01 — Oficinas corporativas · 42.000 m² · Madrid
*Monitorización energética & confort térmico por estancia*

387 sensores de temperatura, CO₂, ocupación y consumo eléctrico, todos publicando en un broker HiveMQ en la nube. El equipo de FM accede a un viewer BIM con código de colores: verde si el espacio cumple los KPIs de confort, ámbar si está en alerta, rojo si hay intervención necesaria.

**Resultado tras 8 meses:** reducción del 19 % en consumo HVAC al detectar zonas que se climatizaban sin ocupación.

Stack: \`Revit 2024 → APS\` · \`HiveMQ Cloud\` · \`InfluxDB\` · \`Next.js 14\` · \`Zigbee 3.0\`

---

### Caso 02 — Hospital universitario · fase de obra · Valencia
*Control de humedad y temperatura en zonas clínicas*

Durante la ejecución de las instalaciones, se instalaron sensores provisionales en quirófanos y UCIs. El modelo BIM de obra se actualizaba con las lecturas de humedad relativa, condición imprescindible para la validación de las salas blancas. La documentación de commissioning se generaba automáticamente desde el histórico de InfluxDB.

**Reto principal:** la red LoRaWAN del recinto hospitalario tenía interferencias que requerían buffer de mensajes en el edge antes de publicar a MQTT.

Stack: \`IFC.js\` · \`Mosquitto (edge)\` · \`LoRaWAN\` · \`TimescaleDB\` · \`Next.js + WebSocket\`

---

### Caso 03 — Centro logístico · 18.000 m² · Barcelona
*Gestión predictiva de mantenimiento en maquinaria*

Los PLCs de las cintas transportadoras y carruseles publicaban en MQTT datos de vibración y temperatura de motores. El gemelo correlacionaba esos valores con el histórico de averías y emitía alertas preventivas vinculadas al elemento BIM específico. El técnico recibía una notificación con la localización exacta en el modelo.

**Resultado:** el 73 % de las averías del primer año se anticiparon con al menos 48 horas de margen.

Stack: \`Revit MEP → APS\` · \`MQTT + Modbus gateway\` · \`Node-RED\` · \`PostgreSQL\` · \`Next.js\`

---

## Comparativa de brokers MQTT para edificios

| Broker | Despliegue | TLS nativo | Escalabilidad | Coste |
|--------|------------|------------|---------------|-------|
| **Mosquitto** | Self-hosted / edge | ✓ | Media (1 nodo) | Gratis |
| **HiveMQ Cloud** | SaaS | ✓ | Alta (clúster) | Freemium |
| **EMQX** | Self-hosted / cloud | ✓ | Muy alta | Open source / enterprise |
| **AWS IoT Core** | SaaS | ✓ | Muy alta | Por mensaje |

Para proyectos de edificio único con menos de 500 sensores, Mosquitto en un servidor edge es suficiente y elimina la dependencia de internet para datos críticos. Por encima de esa escala o con múltiples edificios, HiveMQ o EMQX en modo clúster son la opción natural.

---

## El error más frecuente: el mapeo BIM-sensor

El 80 % de los problemas en implementaciones reales no son de protocolo ni de código: son de *gobierno del dato*. El sensor ID que usa el instalador de obra raramente coincide con el naming del BIM coordinator. Sin un proceso formal de registro —una tabla mantenida desde el inicio, no añadida al final— el gemelo digital nace sin poder ubicar la mitad de sus sensores.

> ⚠️ **Recomendación práctica:** define el esquema de IDs antes de que empiece la instalación. Usa el GUID de Revit como clave primaria en toda la cadena: base de datos, broker MQTT y frontend. Nunca uses nombres humanos ("sensor sala grande") como identificadores en sistemas.

---

## Conclusión

La tecnología para construir gemelos digitales operativos de edificios existe, es madura y accesible: Revit exporta a web, MQTT transporta los datos, Next.js los muestra. La dificultad no está en la tecnología, sino en la disciplina de datos y en el alineamiento entre el equipo de construcción, el de instalaciones y el de software.

El gemelo digital no es el destino: es la infraestructura sobre la que se construyen los casos de uso que realmente importan —mantenimiento predictivo, gestión energética, simulación de emergencias— y que justifican la inversión inicial.
`,
    contenidoEn: `Imagine being able to see your building as a living organism. Not the paper drawings, not the static 3D model sitting on the designer's computer — but the real building, right now, breathing. You know the temperature in every room. You know which systems are running at their limit. You know which zone has been air-conditioned for three hours with nobody inside. And you know this not because someone went to check — but because the building is telling you.

That, in essence, is a digital twin.

The construction industry has spent decades perfecting the BIM model. Today, projects are designed with extraordinary detail: every pipe, every beam, every space has its digital representation. But there is a moment when that effort stops: handover day. From that point on, the model is frozen in time — unable to reflect that the floor 8 HVAC has been at 94% load for three days, that the basement heat pump is starting to vibrate unusually, or that classroom 304 never reaches 21°C despite the heating running for hours.

The gap between the model we have and the building that operates is, in many cases, total.

The digital twin exists precisely to close that gap. It connects the BIM model — with all its geometry and semantics — to a sensor network that captures the real state of the building in real time. The result is not just a pretty dashboard: it is a system that can detect problems before they occur, automatically optimise energy consumption and generate maintenance documentation without human intervention.

In this article we explain how to build that connection. We start with the concepts — with first-time readers in mind — and move towards real technical implementation: protocols, code and architecture decisions validated in production projects.

---

## What is (and what is not) a digital twin?

The term is used far too loosely. A digital twin is not a pretty 3D model with data stuck on top. It is a system with three inseparable components: the **data model** (the geometry and semantics of the BIM), the **real-time data stream** (the sensors), and the **analytics layer** that joins both to drive decisions.

> "The digital twin does not replicate the building: it observes it, learns from it, and eventually anticipates it."

The difference between an FM dashboard and a real twin lies in whether the system can close the loop: detect an anomaly — correlate it with the BIM geometry — propose or execute an action. Without that closure, it is simply monitoring.

---

## How it works in practice

Before getting into code and protocols, it helps to understand the flow intuitively. Think of three actors that need to talk to each other:

**The physical building** has sensors distributed across its systems: thermometers, CO₂ meters, electricity meters, occupancy detectors. Each one generates data continuously — small, simple values, but constant.

**The BIM model** is the map. It knows that room 304 is on the third floor, that it has 48 m², that it belongs to the north HVAC circuit and that its window faces south. Without the sensors, that map is static. Without the map, the sensor data has no spatial context.

**The digital platform** is what connects both worlds. It receives data from the building, places it in the model, and provides an interface where anyone — not just engineers — can understand at a glance what is happening and where.

The result is that when a sensor detects an anomaly, the system does not just raise an alert: it pinpoints exactly which model element is affected, on which floor, which system it belongs to, and what its history is. The maintenance technician arrives already knowing what needs to be done.

This is the promise. Below we explain how to build it technically.

---

## The reference architecture

Before writing a single line of code, it helps to have the end-to-end flow clear. The following stack is what we have validated across three real projects:

| Layer | Description | Technologies |
|-------|-------------|--------------|
| Physical | Sensors and actuators | Zigbee · Modbus · LoRaWAN |
| Transport | Message broker | MQTT (Mosquitto / HiveMQ) |
| Processing | IoT backend | Node.js · InfluxDB · TimescaleDB |
| Digital twin | BIM model + real-time data | Forge / APS · IFC.js · Next.js · WebSocket |

The critical piece is the mapping between the physical **sensor ID** and the **Revit GUID**. Without that correspondence table — which looks trivial and is not — the data arrives but has no idea which model element it belongs to.

---

## MQTT: the protocol that moves the data

MQTT (Message Queuing Telemetry Transport) is the de facto standard for building sensor networks. Lightweight, asynchronous and designed for unstable links. Each sensor publishes to a hierarchical *topic*; the backend subscribes and processes.

### Recommended topic convention

\`\`\`
# recommended structure
building/{project_id}/{floor}/{zone}/{sensor_type}/{sensor_id}

# real examples
building/p42/b3/meeting-room-01/temperature/sens-0091
building/p42/b3/meeting-room-01/co2/sens-0092
building/p42/rooftop/main-hvac/consumption/meter-001
\`\`\`

This hierarchy enables wildcard subscriptions (\`building/p42/b3/#\`) to process an entire floor with a single instruction.

### Node.js subscriber

\`\`\`javascript
import mqtt from 'mqtt';
import { mapSensorToRevitGuid } from './bim-mapping.js';
import { writeMetric } from './influx-client.js';

const client = mqtt.connect('mqtts://broker.building.com:8883', {
  clientId: 'dt-backend-01',
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
});

client.on('connect', () => {
  client.subscribe('building/p42/#', { qos: 1 });
});

client.on('message', async (topic, payload) => {
  const [, project, floor, zone, type, sensorId] = topic.split('/');
  const value = parseFloat(payload.toString());

  // critical mapping: sensor → Revit GUID
  const revitGuid = await mapSensorToRevitGuid(sensorId);
  if (!revitGuid) return;

  await writeMetric({ sensorId, revitGuid, type, zone, value });
  wss.broadcast({ revitGuid, type, value, ts: Date.now() });
});
\`\`\`

> **QoS 1 vs QoS 2:** for temperature or CO₂ sensors, QoS 1 (at least once) is sufficient. For fire alarms or access control, use QoS 2 (exactly once). The overhead is real; do not apply it indiscriminately.

---

## Connecting the Revit model to the frontend

The Revit model needs two transformations: exporting to a web-friendly format (SVF2 or IFC) and exposing it through an API. This is where Autodesk Platform Services (APS, formerly Forge) comes in, or — for open source — **IFC.js**.

### Real-time updates in Next.js via WebSocket

\`\`\`typescript
// useDigitalTwin.ts
import { useEffect, useRef, useState } from 'react';

type SensorUpdate = { revitGuid: string; tipo: string; valor: number; ts: number };

export function useDigitalTwin() {
  const [updates, setUpdates] = useState<Map<string, SensorUpdate>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    wsRef.current.onmessage = (e) => {
      const update: SensorUpdate = JSON.parse(e.data);
      setUpdates(prev => new Map(prev).set(update.revitGuid, update));
    };
    return () => wsRef.current?.close();
  }, []);

  return updates;
}
\`\`\`

This hook feeds the APS viewer directly: each message triggers \`model.setThemingColor(dbId, color)\`, colouring the element in real time.

---

## Three real production cases

### Case 01 — Corporate offices · 42,000 m² · Madrid
*Energy monitoring & thermal comfort per room*

387 sensors publishing to HiveMQ Cloud. The FM team accesses a colour-coded BIM viewer: green for KPI compliance, amber for alert, red for required intervention.

**Result after 8 months:** 19% reduction in HVAC consumption by detecting unoccupied conditioned zones.

Stack: \`Revit 2024 → APS\` · \`HiveMQ Cloud\` · \`InfluxDB\` · \`Next.js 14\` · \`Zigbee 3.0\`

---

### Case 02 — University hospital · construction phase · Valencia
*Humidity and temperature control in clinical areas*

Temporary sensors in operating theatres and ICUs updated the BIM model with relative humidity readings — mandatory for clean-room validation. Commissioning docs were generated automatically from InfluxDB history.

**Main challenge:** LoRaWAN interference required edge message buffering before publishing to MQTT.

Stack: \`IFC.js\` · \`Mosquitto (edge)\` · \`LoRaWAN\` · \`TimescaleDB\` · \`Next.js + WebSocket\`

---

### Case 03 — Logistics centre · 18,000 m² · Barcelona
*Predictive maintenance on machinery*

PLCs on conveyors published vibration and motor temperature data. The twin correlated those values against fault history and issued preventive alerts linked to the exact BIM element.

**Result:** 73% of first-year faults anticipated with at least 48 hours' notice.

Stack: \`Revit MEP → APS\` · \`MQTT + Modbus gateway\` · \`Node-RED\` · \`PostgreSQL\` · \`Next.js\`

---

## MQTT broker comparison for buildings

| Broker | Deployment | Native TLS | Scalability | Cost |
|--------|------------|------------|-------------|------|
| **Mosquitto** | Self-hosted / edge | ✓ | Medium (1 node) | Free |
| **HiveMQ Cloud** | SaaS | ✓ | High (cluster) | Freemium |
| **EMQX** | Self-hosted / cloud | ✓ | Very high | Open source / enterprise |
| **AWS IoT Core** | SaaS | ✓ | Very high | Per message |

For single-building projects under 500 sensors, Mosquitto on an edge server eliminates internet dependency for critical data. Beyond that scale, HiveMQ or EMQX in cluster mode are the natural choice.

---

## The most common mistake: BIM-sensor mapping

80% of real implementation problems are not about protocol or code — they are about *data governance*. The sensor ID used by the site installer rarely matches the BIM coordinator's naming. Without a formal registration process from day one, the twin is born unable to locate half its sensors.

> ⚠️ **Practical recommendation:** define the ID schema before installation begins. Use the Revit GUID as the primary key throughout: database, MQTT broker and frontend. Never use human-friendly names ("big room sensor") as system identifiers.

---

## Conclusion

The technology to build operational building digital twins exists, is mature and accessible: Revit exports to the web, MQTT transports the data, Next.js displays it. The difficulty lies not in the technology, but in data discipline and alignment between the construction, installations and software teams.

The digital twin is not the destination — it is the infrastructure on which the use cases that truly matter are built: predictive maintenance, energy management, emergency simulation.
`,
  },
  {
    slug: "ifcjs-visualizacion-bim-navegador",
    titulo: "IFC.js: visualización BIM en el navegador sin plugins",
    tituloEn: "IFC.js: browser-based BIM visualisation without plugins",
    categoria: "Desarrollo Web",
    categoriaEn: "Web Development",
    fecha: "10 Mar 2025",
    fechaEn: "10 Mar 2025",
    lectura: "10 min",
    resumen:
      "Tutorial completo para cargar y visualizar modelos IFC directamente en el navegador. Incluye gestión de propiedades y filtrado por disciplina.",
    resumenEn:
      "A complete tutorial for loading and visualising IFC models directly in the browser. Includes property management and discipline filtering.",
    tags: ["IFC.js", "BIM", "WebGL", "Three.js", "React"],
    destacado: true,
    contenido: `En algún momento de los últimos años, alguien de tu equipo exportó capturas de pantalla de un modelo BIM y las adjuntó a un correo. No porque no hubiera una manera mejor. Sino porque la manera mejor requería que el receptor tuviera instalado un software de varios miles de euros al año — que el cliente no tiene, que el jefe de obra no usa, que el facility manager nunca va a comprar.

Ese ha sido, durante décadas, el límite real del BIM: no la calidad de los modelos, sino quién puede abrirlos.

IFC.js es la respuesta técnica a ese límite. Es una librería open source escrita en JavaScript que permite cargar, visualizar e interrogar modelos IFC directamente en el navegador — sin plugins, sin instalaciones, sin licencias. La misma tecnología que usa Google Maps o Figma aplicada al modelo BIM: renderizado con WebGL, parseo con WebAssembly, y acceso completo a las propiedades de cada elemento.

El resultado práctico es que cualquier persona con un navegador puede hacer clic en una viga y ver su tipo de acero, navegar planta a planta, aislar las instalaciones de climatización o medir una distancia. Sin que el coordinador BIM tenga que estar presente para abrir el archivo.

En este artículo construimos un visor BIM funcional desde cero con React y Next.js, con selección de elementos y sus propiedades BIM, filtrado por disciplina, y las optimizaciones necesarias para que funcione con modelos reales.

---

## ¿Qué es IFC.js y por qué importa?

IFC.js es una librería JavaScript open source que permite cargar, visualizar y consultar modelos IFC directamente en el navegador, sin necesidad de instalar Revit, Navisworks ni ningún plugin. Se basa en Three.js para el renderizado WebGL y en WebAssembly para parsear el formato IFC.

Lo que lo diferencia de otras soluciones de visualización web es que preserva la semántica del modelo: no convierte el IFC a un mesh sin información, sino que mantiene el acceso a las propiedades BIM de cada elemento. Puedes hacer clic en una viga y obtener su tipo de acero, su longitud exacta, su fase de construcción. Esa información es la que hace útil un visor BIM — sin ella, es solo un modelo 3D bonito.

| Característica | IFC.js | Formato GLTF/OBJ | Autodesk Viewer (APS) |
|---|---|---|---|
| Preserva propiedades IFC | ✅ | ❌ | ✅ |
| Sin licencia de uso | ✅ | ✅ | ❌ (requiere cuenta APS) |
| Sin conversión previa | ✅ | ❌ | ❌ |
| Rendimiento con 500 MB+ | Requiere optimización | ✅ | ✅ |
| Self-hosted | ✅ | ✅ | ❌ |

---

## Instalación

\`\`\`bash
npm install web-ifc-three web-ifc three
\`\`\`

También necesitas copiar los archivos WASM al directorio público:

\`\`\`bash
cp node_modules/web-ifc/*.wasm public/
\`\`\`

Los archivos \`.wasm\` son los que hacen posible el parseo de IFC en el navegador. Sin ellos, el modelo no cargará.

---

## Configuración básica con React

\`\`\`tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { IFCLoader } from 'web-ifc-three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function VisorBIM() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(ambientLight, directionalLight);

    // Cargar IFC
    const loader = new IFCLoader();
    loader.ifcManager.setWasmPath('/');
    loader.load('/modelo.ifc', (model) => {
      scene.add(model);
    });

    camera.position.set(10, 10, 10);
    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => renderer.dispose();
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
}
\`\`\`

Este es el esqueleto mínimo. En menos de 50 líneas tienes un visor 3D funcional capaz de cargar cualquier modelo IFC estándar.

---

## Consultar propiedades de elementos

Una de las funcionalidades más potentes — y la que marca la diferencia frente a un simple visor 3D — es poder hacer clic en un elemento y obtener sus propiedades BIM:

\`\`\`tsx
const getElementProperties = async (event: MouseEvent) => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const expressID = await loader.ifcManager.getExpressId(
      intersects[0].object.geometry,
      intersects[0].faceIndex!
    );
    const props = await loader.ifcManager.getItemProperties(0, expressID);
    console.log(props);
  }
};
\`\`\`

El \`expressID\` es el identificador único de cada elemento en el archivo IFC. A partir de él puedes recuperar todas sus propiedades: tipo, material, Psets, relaciones con otros elementos y metadatos personalizados del modelo.

---

## Filtrado por disciplina

Puedes filtrar los elementos visibles por categoría IFC para separar disciplinas y reducir la carga cognitiva del modelo:

\`\`\`tsx
// Ocultar instalaciones MEP
const hideMEP = async () => {
  const mepCategories = [
    IFCDUCTFITTING,
    IFCPIPEFITTING,
    IFCFLOWSEGMENT,
  ];

  for (const category of mepCategories) {
    const ids = await loader.ifcManager.getAllItemsOfType(0, category, false);
    loader.ifcManager.createSubset({
      modelID: 0,
      ids,
      material: transparentMaterial,
      scene,
      removePrevious: false,
    });
  }
};
\`\`\`

Esta capacidad es especialmente valiosa en reuniones de coordinación: puedes mostrar solo la estructura, solo MEP, o cualquier combinación de disciplinas sin recargar el modelo.

---

## Rendimiento con modelos grandes

Para modelos IFC de más de 100 MB, la configuración básica puede resultar lenta o consumir demasiada memoria. Estas son las optimizaciones más efectivas:

- **Streaming:** Usa \`setOptimizeCoords\` para reducir el uso de memoria en geometrías complejas
- **Web Worker:** Parsea el IFC en un worker separado para no bloquear el hilo principal durante la carga
- **LOD dinámico:** Reduce la geometría de elementos lejanos a la cámara; impacto notable en modelos con alta densidad de elementos
- **Frustum culling:** Three.js lo gestiona automáticamente, pero verifica que \`mesh.frustumCulled = true\` en tus meshes personalizados

Para modelos por encima de 500 MB — habitual en proyectos de infraestructura — la estrategia más efectiva es dividir el modelo por disciplinas o zonas y cargarlas bajo demanda. La carga total de un IFC de 500 MB en un solo paso no es viable en el navegador actual.

---

## Integración con Next.js

El principal reto con Next.js es que IFC.js usa APIs del navegador (WebGL, WebAssembly) que no están disponibles durante el Server Side Rendering. La solución es cargarlo dinámicamente, solo en el cliente:

\`\`\`tsx
const VisorBIM = dynamic(() => import('@/components/VisorBIM'), {
  ssr: false,
  loading: () => <div>Cargando modelo...</div>,
});
\`\`\`

Si usas Next.js 15+ con App Router, la directiva \`'use client'\` en el componente del visor es suficiente para la mayoría de los casos. El \`dynamic\` con \`ssr: false\` es necesario cuando el componente se importa desde un Server Component.

---

## Casos de uso reales

El valor de IFC.js no está solo en el aspecto técnico. Está en lo que permite hacer que antes no era posible:

**Revisiones con el cliente** — En lugar de exportar capturas de pantalla o PDFs, el equipo comparte un enlace al visor. El cliente puede explorar el modelo, marcar dudas y comentarlas en contexto. El tiempo de reunión se invierte en decisiones, no en navegación.

**Coordinación en obra** — El jefe de obra accede al modelo desde tablet en campo. Puede ver la sección exacta de la zona donde está trabajando, consultar las propiedades de los elementos y verificar cotas sin depender del equipo de oficina.

**CDEs personalizados** — Una plataforma de gestión documental propia puede integrar el visor directamente, vinculando modelos con planos, especificaciones y registros de mantenimiento en una sola interfaz.

---

## Conclusión

IFC.js democratiza el acceso al BIM. Cualquier persona con un navegador puede explorar un modelo sin instalar nada, sin licencias y sin formación específica en herramientas propietarias. Para los equipos AECO, eso significa poder incluir en el proceso digital a todos los stakeholders — no solo a quienes tienen el presupuesto para comprar Revit.

El coste de entrada es bajo: unas horas de configuración y un modelo IFC exportado desde cualquier herramienta compatible con el estándar abierto. El potencial, en cambio, es transformador.
`,
    contenidoEn: `At some point in the last few years, someone on your team exported screenshots of a BIM model and attached them to an email. Not because there was no better way. But because the better way required the recipient to have software installed that costs several thousand euros a year — which the client does not have, which the site manager does not use, which the facility manager is never going to buy.

That has been, for decades, the real limit of BIM: not the quality of the models, but who can open them.

IFC.js is the technical answer to that limit. It is an open source JavaScript library that allows you to load, visualise and query IFC models directly in the browser — no plugins, no installations, no licences. The same technology that powers Google Maps or Figma applied to the BIM model: rendering with WebGL, parsing with WebAssembly, and full access to the properties of every element.

The practical result is that anyone with a browser can click on a beam and see its steel grade, navigate floor by floor, isolate the HVAC installations or measure a dimension. Without the BIM coordinator needing to be present to open the file.

In this article we build a functional BIM viewer from scratch using React and Next.js, with element selection and BIM property retrieval, discipline filtering, and the optimisations needed to make it work with real models.

---

## What is IFC.js and why does it matter?

IFC.js is an open source JavaScript library that allows you to load, visualise and query IFC models directly in the browser, without needing to install Revit, Navisworks or any plugin. It is based on Three.js for WebGL rendering and WebAssembly for parsing the IFC format.

What sets it apart from other web visualisation solutions is that it preserves the model's semantics: it does not convert the IFC to a featureless mesh, but maintains access to the BIM properties of every element. You can click on a beam and retrieve its steel grade, exact length and construction phase. That information is what makes a BIM viewer useful — without it, it is just a pretty 3D model.

| Feature | IFC.js | GLTF/OBJ format | Autodesk Viewer (APS) |
|---|---|---|---|
| Preserves IFC properties | ✅ | ❌ | ✅ |
| No usage licence | ✅ | ✅ | ❌ (requires APS account) |
| No prior conversion | ✅ | ❌ | ❌ |
| Performance with 500 MB+ | Requires optimisation | ✅ | ✅ |
| Self-hosted | ✅ | ✅ | ❌ |

---

## Installation

\`\`\`bash
npm install web-ifc-three web-ifc three
\`\`\`

You also need to copy the WASM files to the public directory:

\`\`\`bash
cp node_modules/web-ifc/*.wasm public/
\`\`\`

The \`.wasm\` files are what enable IFC parsing in the browser. Without them, the model will not load.

---

## Basic setup with React

\`\`\`tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { IFCLoader } from 'web-ifc-three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function BIMViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(ambientLight, directionalLight);

    // Load IFC
    const loader = new IFCLoader();
    loader.ifcManager.setWasmPath('/');
    loader.load('/model.ifc', (model) => {
      scene.add(model);
    });

    camera.position.set(10, 10, 10);
    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => renderer.dispose();
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
}
\`\`\`

This is the minimal skeleton. In under 50 lines you have a functional 3D viewer capable of loading any standard IFC model.

---

## Querying element properties

One of the most powerful features — and what sets it apart from a simple 3D viewer — is the ability to click on an element and retrieve its BIM properties:

\`\`\`tsx
const getElementProperties = async (event: MouseEvent) => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const expressID = await loader.ifcManager.getExpressId(
      intersects[0].object.geometry,
      intersects[0].faceIndex!
    );
    const props = await loader.ifcManager.getItemProperties(0, expressID);
    console.log(props);
  }
};
\`\`\`

The \`expressID\` is the unique identifier for each element in the IFC file. From it you can retrieve all properties: type, material, Psets, relationships with other elements and custom model metadata.

---

## Filtering by discipline

You can filter visible elements by IFC category to separate disciplines and reduce cognitive load:

\`\`\`tsx
// Hide MEP installations
const hideMEP = async () => {
  const mepCategories = [
    IFCDUCTFITTING,
    IFCPIPEFITTING,
    IFCFLOWSEGMENT,
  ];

  for (const category of mepCategories) {
    const ids = await loader.ifcManager.getAllItemsOfType(0, category, false);
    loader.ifcManager.createSubset({
      modelID: 0,
      ids,
      material: transparentMaterial,
      scene,
      removePrevious: false,
    });
  }
};
\`\`\`

This capability is especially valuable in coordination meetings: you can show just the structure, just MEP, or any combination of disciplines without reloading the model.

---

## Performance with large models

For IFC models over 100 MB, the basic setup can be slow or consume excessive memory. These are the most effective optimisations:

- **Streaming:** Use \`setOptimizeCoords\` to reduce memory usage with complex geometries
- **Web Worker:** Parse the IFC in a separate worker to avoid blocking the main thread during loading
- **Dynamic LOD:** Reduce geometry for elements far from the camera — significant impact in high-density models
- **Frustum culling:** Three.js handles this automatically; ensure \`mesh.frustumCulled = true\` on any custom meshes

For models above 500 MB — common in infrastructure projects — the most effective strategy is splitting the model by discipline or zone and loading them on demand. Loading a 500 MB IFC all at once is not viable in today's browser.

---

## Next.js integration

The main challenge with Next.js is that IFC.js uses browser APIs (WebGL, WebAssembly) that are not available during Server Side Rendering. The solution is dynamic loading, client-side only:

\`\`\`tsx
const BIMViewer = dynamic(() => import('@/components/BIMViewer'), {
  ssr: false,
  loading: () => <div>Loading model...</div>,
});
\`\`\`

If you use Next.js 15+ with App Router, the \`'use client'\` directive on the viewer component is sufficient for most cases. The \`dynamic\` with \`ssr: false\` is needed when the component is imported from a Server Component.

---

## Real use cases

The value of IFC.js is not just technical. It is in what it enables that was not possible before:

**Client reviews** — Instead of exporting screenshots or PDFs, the team shares a link to the viewer. The client can explore the model, mark queries and discuss them in context. Meeting time is spent on decisions, not navigation.

**On-site coordination** — The site manager accesses the model from a tablet in the field. They can view the exact section of the area they are working on, check element properties and verify dimensions without depending on the office team.

**Custom CDEs** — A bespoke document management platform can integrate the viewer directly, linking models with drawings, specifications and maintenance records in a single interface.

---

## Conclusion

IFC.js democratises access to BIM. Anyone with a browser can explore a model without installing anything, without licences and without specialist training in proprietary tools. For AECO teams, this means being able to include all stakeholders in the digital process — not just those with the budget to buy Revit.

The entry cost is low: a few hours of setup and an IFC model exported from any tool compatible with the open standard. The potential, on the other hand, is transformative.
`,
  },
];

export function getArticulo(slug: string): Articulo | undefined {
  return articulos.find((a) => a.slug === slug);
}
