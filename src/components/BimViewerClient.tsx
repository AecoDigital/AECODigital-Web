"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { FolderOpen, Search, Copy, Check, X, Share2, Loader2, Camera, Ruler } from "lucide-react";
import ContextMenu from "./ContextMenu";
import ModelTree, { type TreeNode } from "./ModelTree";
import { supabase, IFC_BUCKET } from "@/lib/supabase";


function _typeCode(d: any): number {
  const t = d?.type;
  if (typeof t === "number") return t;
  if (t?.value !== undefined) return Number(t.value);
  return 0;
}
function _name(d: any): string | null {
  const n = d?.Name ?? d?.LongName;
  if (typeof n === "string") return n;
  if (n?.value) return String(n.value);
  return null;
}
function _refId(r: any): number | null {
  if (typeof r === "number") return r;
  if (r?.value !== undefined) return Number(r.value);
  return null;
}
function _refIds(arr: any): number[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(_refId).filter((v): v is number => v !== null);
}

// Categorías IFC → etiqueta legible (por string, no por código numérico)
const CAT_LABELS: Record<string, string> = {
  IFCPROJECT: "Proyecto", IFCSITE: "Emplazamiento",
  IFCBUILDING: "Edificio", IFCBUILDINGSTOREY: "Planta", IFCSPACE: "Espacio",
  IFCCOLUMN: "Columna", IFCWALL: "Muro", IFCWALLSTANDARDCASE: "Muro",
  IFCWALLTYPE: "Tipo Muro", IFCSLAB: "Forjado", IFCROOF: "Cubierta",
  IFCDOOR: "Puerta", IFCWINDOW: "Ventana", IFCBEAM: "Viga",
  IFCSTAIR: "Escalera", IFCSTAIRFLIGHT: "Tramo de escalera",
  IFCRAMP: "Rampa", IFCRAMPFLIGHT: "Tramo de rampa",
  IFCRAILING: "Barandilla", IFCPLATE: "Placa", IFCMEMBER: "Perfil",
  IFCCOVERING: "Revestimiento", IFCFURNISHINGELEMENT: "Mobiliario",
  IFCFLOWSEGMENT: "Tubería", IFCFLOWFITTING: "Accesorio",
  IFCFLOWEQUIPMENT: "Equipo MEP", IFCPIPESEQMENT: "Tubería",
  IFCDUCTSEQMENT: "Conducto", IFCOPENINGELEMENT: "Hueco",
};
const SPATIAL_CATS = new Set([
  "IFCPROJECT","IFCSITE","IFCBUILDING","IFCBUILDINGSTOREY","IFCSPACE"
]);

function parseSpatialStructure(node: any, modelId: string): TreeNode[] {
  if (!node) return [];
  let _key = 0;

  // El árbol alterna: nodo CATEGORY (category!=null, localId=null)
  // y nodo INSTANCE (category=null, localId!=null)
  function conv(n: any, parentCat: string | null): TreeNode | null {
    if (!n) return null;
    const cat  = n.category as string | null;
    const lid  = n.localId  as number | null;
    const kids = (n.children ?? []) as any[];

    if (cat !== null) {
      // ── NODO CATEGORÍA ──
      const label     = CAT_LABELS[cat] ?? cat;
      const isSpatial = SPATIAL_CATS.has(cat);

      if (isSpatial) {
        // Espacial: fusionar con el único hijo instancia
        const converted = kids.map(k => conv(k, cat)).filter(Boolean) as TreeNode[];
        if (converted.length === 0) return null;
        if (converted.length === 1) return { ...converted[0], type: label };
        return { key: `sp-${_key++}`, localId: null, name: label, type: "", children: converted };
      } else {
        // Elemento: mostrar como grupo con conteo
        const leaves = kids.map(k => conv(k, cat)).filter(Boolean) as TreeNode[];
        if (leaves.length === 0) return null;
        return {
          key: `grp-${cat}-${_key++}`,
          localId: null,
          name: `${label} (${leaves.length})`,
          type: "",
          cat,
          children: leaves,
        };
      }
    } else {
      // ── NODO INSTANCIA ──
      const label    = parentCat ? (CAT_LABELS[parentCat] ?? parentCat) : "";
      const instKids = kids.map(k => conv(k, null)).filter(Boolean) as TreeNode[];
      return {
        key:      lid !== null ? `${modelId}-${lid}` : `in-${_key++}`,
        localId:  lid,
        name:     lid !== null ? `${label} #${lid}` : label,
        type:     "",
        children: instKids,
      };
    }
  }

  const root = conv(node, null);
  return root ? [root] : [];
}

async function buildModelTree(model: any, modelId: string): Promise<TreeNode[]> {
  try {
    if (typeof model.getSpatialStructure !== "function") return [];

    const spatial = await model.getSpatialStructure();
    if (!spatial) return [];

    // 1. Construir estructura desde getSpatialStructure
    const tree = parseSpatialStructure(spatial, modelId);

    // 2. Recopilar todos los localIds del árbol para batch-fetch de nombres
    const treeIds: number[] = [];
    function collectIds(nodes: TreeNode[]) {
      for (const n of nodes) {
        if (n.localId !== null) treeIds.push(n.localId);
        collectIds(n.children);
      }
    }
    collectIds(tree);

    // 3. Batch-fetch de nombres (getItemsData acepta array de ids)
    if (treeIds.length > 0) {
      const dataArr: any[] = await model.getItemsData(treeIds);
      const nameMap = new Map<number, string>();
      for (let i = 0; i < treeIds.length; i++) {
        const n = _name(dataArr[i]);
        if (n) nameMap.set(treeIds[i], n);
      }

      // 4. Aplicar nombres al árbol
      function applyNames(nodes: TreeNode[]) {
        for (const n of nodes) {
          if (n.localId !== null && nameMap.has(n.localId)) {
            n.name = nameMap.get(n.localId)!;
          }
          applyNames(n.children);
        }
      }
      applyNames(tree);
    }

    return tree;
  } catch (e) {
    console.error("buildModelTree error:", e);
    return [];
  }
}

function buildCategoryItems(tree: TreeNode[]): CatItem[] {
  const catMap = new Map<string, { label: string; localIds: number[] }>();

  function traverse(node: TreeNode) {
    if (node.localId === null && node.cat) {
      const localIds: number[] = [];
      function collectLeaves(n: TreeNode) {
        if (n.localId !== null) localIds.push(n.localId);
        n.children.forEach(collectLeaves);
      }
      node.children.forEach(collectLeaves);
      if (!catMap.has(node.cat)) {
        catMap.set(node.cat, { label: CAT_LABELS[node.cat] ?? node.cat, localIds: [] });
      }
      catMap.get(node.cat)!.localIds.push(...localIds);
    }
    node.children.forEach(traverse);
  }
  tree.forEach(traverse);

  return Array.from(catMap.entries())
    .map(([cat, { label, localIds }]) => ({ cat, label, visible: true, count: localIds.length, localIds }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

interface Property {
  key: string;
  value: string;
  allValues?: string[];
}

interface PanelState {
  name: string;
  type: string | null;
  properties: Property[];
}

interface ContextState {
  name: string;
  modelId: string;
  localId: number;
  x: number;
  y: number;
}

interface HiddenItem {
  modelId: string;
  localId: number;
}

interface ColoredItem {
  modelId: string;
  localId: number;
  hex: string;
}

interface CatItem {
  cat: string;
  label: string;
  visible: boolean;
  count: number;
  localIds: number[];
}

interface MeasurementEntry {
  p1: THREE.Vector3;
  p2: THREE.Vector3;
  distance: number;
  objects: THREE.Object3D[];
  labelEl: HTMLDivElement;
}

interface SectionAxis {
  enabled: boolean;
  minVal: number;
  maxVal: number;
  bboxMin: number;
  bboxMax: number;
}

function createSectionBox(scene: THREE.Scene): {
  group: THREE.Group;
  wire: THREE.LineSegments;
  handles: THREE.Mesh[];
} {
  const group = new THREE.Group();

  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  const wire = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xff2222, depthTest: false })
  );
  wire.renderOrder = 999;
  group.add(wire);

  const handles: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff2222,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 998;
    group.add(mesh);
    handles.push(mesh);
  }

  scene.add(group);
  group.visible = false;
  return { group, wire, handles };
}

// ── ViewCube ──────────────────────────────────────────────────────────────────
const _vcSz = new THREE.Vector2(); // reusable — avoids per-frame allocation
// materialIndex order para BoxGeometry: +x, -x, +y, -y, +z, -z
const VC_FACE_DATA = [
  { label: "R", worldDir: new THREE.Vector3( 1,  0,  0), base: "#8B1A1A", hov: "#cc3333" },
  { label: "L", worldDir: new THREE.Vector3(-1,  0,  0), base: "#6B1414", hov: "#aa2828" },
  { label: "T", worldDir: new THREE.Vector3( 0,  1,  0), base: "#1A5C1A", hov: "#2a8a2a" },
  { label: "B", worldDir: new THREE.Vector3( 0, -1,  0), base: "#144814", hov: "#1d6b1d" },
  { label: "F", worldDir: new THREE.Vector3( 0,  0,  1), base: "#1A3A7A", hov: "#2a5ab8" },
  { label: "Bk", worldDir: new THREE.Vector3( 0,  0, -1), base: "#132958", hov: "#1e3e84" },
];

function makeVCTexture(label: string, hovered: boolean, base: string, hov: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hovered ? hov : base;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 124, 124);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${label.length > 1 ? "36px" : "48px"} system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 64, 64);
  return new THREE.CanvasTexture(c);
}

function collectAllLocalIds(nodes: TreeNode[], modelId: string): { modelId: string; localId: number }[] {
  const result: { modelId: string; localId: number }[] = [];
  function walk(n: TreeNode) {
    if (n.localId !== null) result.push({ modelId, localId: n.localId });
    n.children?.forEach(walk);
  }
  nodes.forEach(walk);
  return result;
}

export default function BimViewerClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const componentsRef = useRef<OBC.Components | null>(null);
  const worldRef = useRef<OBC.SimpleWorld<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  > | null>(null);
  const readyRef = useRef(false);

  // Ref siempre actualizado — accesible dentro de closures del useEffect
  const coloredItemsRef  = useRef<ColoredItem[]>([]);
  const selectedItemsRef = useRef<{ modelId: string; localId: number }[]>([]);
  const ghostedItemsRef  = useRef<{ modelId: string; localId: number }[]>([]);
  const ghostOpacityRef  = useRef(0.15);
  const currentModelIdRef = useRef<string | null>(null);
  const modelBboxRef = useRef<THREE.Box3 | null>(null);

  // ViewCube (renderizado en el mismo canvas con scissor)
  const vcSceneRef    = useRef<THREE.Scene | null>(null);
  const vcCameraRef   = useRef<THREE.OrthographicCamera | null>(null);
  const vcMeshRef     = useRef<THREE.Mesh | null>(null);
  const vcBaseMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);
  const vcHovMatsRef  = useRef<THREE.MeshBasicMaterial[]>([]);
  const vcHovIdxRef    = useRef<number | null>(null);
  const vcRaycasterRef = useRef(new THREE.Raycaster());
  const vcCleanupRef   = useRef<(() => void) | null>(null);

  const sectionRef = useRef<{ x: SectionAxis; y: SectionAxis; z: SectionAxis }>({
    x: { enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 },
    y: { enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 },
    z: { enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 },
  });
  const sectionBoxGroupRef   = useRef<THREE.Group | null>(null);
  const sectionBoxWireRef    = useRef<THREE.LineSegments | null>(null);
  const sectionBoxHandlesRef = useRef<THREE.Mesh[]>([]);
  const sectionBoxEnabledRef  = useRef(false);
  const sectionBoxVisibleRef  = useRef(true);
  const boxRotQRef = useRef(new THREE.Quaternion());

  // Medición de distancias
  const measureModeRef          = useRef(false);
  const measurePointsRef        = useRef<THREE.Vector3[]>([]);    // 0 o 1 puntos en curso
  const measureObjectsRef       = useRef<THREE.Object3D[]>([]);   // objetos del punto en curso
  const completedMeasurementsRef = useRef<MeasurementEntry[]>([]); // mediciones terminadas
  const measureDistRef          = useRef<number | null>(null);
  const modelObjectRef          = useRef<THREE.Object3D | null>(null);
  const measurePreviewLineRef   = useRef<THREE.Line | null>(null);
  const measureLastHitRef       = useRef<THREE.Vector3 | null>(null);
  const measureLabelDivRef      = useRef<HTMLDivElement>(null);
  const measureSnapDivRef       = useRef<HTMLDivElement>(null);

  const dragHandleDataRef    = useRef<{
    axis: "x" | "y" | "z";
    dir: "min" | "max";
    plane: THREE.Plane;
    axisDir: THREE.Vector3;
    startHit: THREE.Vector3;
    startVal: number;
  } | null>(null);

  const currentFileRef = useRef<File | null>(null);
  const [shareState, setShareState] = useState<"idle" | "uploading" | "ready" | "error">("idle");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasModel, setHasModel] = useState(false);
  const [modelTree, setModelTree] = useState<TreeNode[]>([]);
  const [treeSelectedId, setTreeSelectedId] = useState<number | null>(null);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const [panelFilter, setPanelFilter] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextState | null>(null);
  const [hiddenItems, setHiddenItems] = useState<HiddenItem[]>([]);
  const [coloredCount, setColoredCount] = useState(0);
  const [ghostMode, setGhostMode] = useState<"selected" | "others" | null>(null);
  const [ghostOpacity, setGhostOpacity] = useState(0.15);
  const [ghostCount, setGhostCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<"tree" | "cats" | "section">("tree");
  const [categories, setCategories] = useState<CatItem[]>([]);
  const [sectionBoxActive, setSectionBoxActive] = useState(false);
  const [sectionBoxVisible, setSectionBoxVisible] = useState(true);
  const [boxRotY, setBoxRotY] = useState(0);
  const [sectionX, setSectionX] = useState<SectionAxis>({ enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 });
  const [sectionY, setSectionY] = useState<SectionAxis>({ enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 });
  const [sectionZ, setSectionZ] = useState<SectionAxis>({ enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 });

  const [measureMode,     setMeasureMode]     = useState(false);
  const [measureStep,     setMeasureStep]     = useState<0 | 1>(0);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);
  const [measureCount,    setMeasureCount]    = useState(0);

  // Sincronizar ref con estado React (accesible en closures de useEffect)
  useEffect(() => {
    sectionRef.current = { x: sectionX, y: sectionY, z: sectionZ };
    sectionBoxEnabledRef.current = sectionBoxActive;
    sectionBoxVisibleRef.current = sectionBoxVisible;
  }, [sectionX, sectionY, sectionZ, sectionBoxActive, sectionBoxVisible]);

  const applyClippingPlanes = useCallback(() => {
    const r = worldRef.current?.renderer as any;
    const renderer: THREE.WebGLRenderer | undefined = r?.three;
    if (!renderer) return;
    renderer.localClippingEnabled = true;
    const { x, y, z } = sectionRef.current;
    const q = boxRotQRef.current;
    const lX = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const lY = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const lZ = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const planes: THREE.Plane[] = [];
    if (x.enabled) {
      planes.push(new THREE.Plane(lX.clone(), -x.minVal));
      planes.push(new THREE.Plane(lX.clone().negate(), x.maxVal));
    }
    if (y.enabled) {
      planes.push(new THREE.Plane(lY.clone(), -y.minVal));
      planes.push(new THREE.Plane(lY.clone().negate(), y.maxVal));
    }
    if (z.enabled) {
      planes.push(new THREE.Plane(lZ.clone(), -z.minVal));
      planes.push(new THREE.Plane(lZ.clone().negate(), z.maxVal));
    }
    renderer.clippingPlanes = planes;
  }, []);

  const updateSectionBox = useCallback(() => {
    const { x, y, z } = sectionRef.current;
    const q = boxRotQRef.current;
    const lX = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const lY = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const lZ = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const midX = (x.minVal + x.maxVal) / 2;
    const midY = (y.minVal + y.maxVal) / 2;
    const midZ = (z.minVal + z.maxVal) / 2;
    const center = new THREE.Vector3()
      .addScaledVector(lX, midX).addScaledVector(lY, midY).addScaledVector(lZ, midZ);
    const halfX = (x.maxVal - x.minVal) / 2;
    const halfY = (y.maxVal - y.minVal) / 2;
    const halfZ = (z.maxVal - z.minVal) / 2;
    const sx = Math.max(halfX * 2, 0.001);
    const sy = Math.max(halfY * 2, 0.001);
    const sz = Math.max(halfZ * 2, 0.001);
    const group = sectionBoxGroupRef.current;
    if (group) { group.position.copy(center); group.quaternion.copy(q); }
    const wire = sectionBoxWireRef.current;
    if (wire) { wire.position.set(0, 0, 0); wire.scale.set(sx, sy, sz); }
    const [xMinH, xMaxH, yMinH, yMaxH, zMinH, zMaxH] = sectionBoxHandlesRef.current;
    const tx = Math.max(sx * 0.05, 0.05);
    const ty = Math.max(sy * 0.05, 0.05);
    const tz = Math.max(sz * 0.05, 0.05);
    if (xMinH) { xMinH.position.set(-halfX, 0, 0); xMinH.scale.set(tx, sy, sz); }
    if (xMaxH) { xMaxH.position.set( halfX, 0, 0); xMaxH.scale.set(tx, sy, sz); }
    if (yMinH) { yMinH.position.set(0, -halfY, 0); yMinH.scale.set(sx, ty, sz); }
    if (yMaxH) { yMaxH.position.set(0,  halfY, 0); yMaxH.scale.set(sx, ty, sz); }
    if (zMinH) { zMinH.position.set(0, 0, -halfZ); zMinH.scale.set(sx, sy, tz); }
    if (zMaxH) { zMaxH.position.set(0, 0,  halfZ); zMaxH.scale.set(sx, sy, tz); }
  }, []);

  useEffect(() => { ghostOpacityRef.current = ghostOpacity; }, [ghostOpacity]);

  // Reaplicar colores persistidos tras cualquier resetHighlight
  const reapplyColors = useCallback(async (fragments: OBC.FragmentsManager) => {
    for (const { modelId, localId, hex } of coloredItemsRef.current) {
      await fragments.highlight(
        { color: new THREE.Color(hex), opacity: 1, transparent: false, renderedFaces: FRAGS.RenderedFaces.TWO },
        { [modelId]: new Set([localId]) }
      );
    }
  }, []);

  // Reaplicar ghost (transparencia) sobre los elementos ghosteados
  const reapplyGhost = useCallback(async (fragments: OBC.FragmentsManager) => {
    const items = ghostedItemsRef.current;
    if (items.length === 0) return;
    const ghostMap: Record<string, Set<number>> = {};
    for (const { modelId, localId } of items) {
      if (!ghostMap[modelId]) ghostMap[modelId] = new Set();
      ghostMap[modelId].add(localId);
    }
    await fragments.highlight(
      { color: new THREE.Color(0xdde8f5), opacity: ghostOpacityRef.current, transparent: true, renderedFaces: FRAGS.RenderedFaces.TWO },
      ghostMap
    );
  }, []);

  // Reaplicar highlight de selección (azul) sobre todos los elementos seleccionados
  const reapplySelection = useCallback(async (fragments: OBC.FragmentsManager) => {
    const items = selectedItemsRef.current;
    if (items.length === 0) return;
    const selMap: Record<string, Set<number>> = {};
    for (const { modelId, localId } of items) {
      if (!selMap[modelId]) selMap[modelId] = new Set();
      selMap[modelId].add(localId);
    }
    await fragments.highlight(
      { color: new THREE.Color(0x0066cc), opacity: 0.5, transparent: true, renderedFaces: FRAGS.RenderedFaces.TWO },
      selMap
    );
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    async function init() {
      if (!containerRef.current) return;

      const components = new OBC.Components();

      const worlds = components.get(OBC.Worlds);
      const world = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBC.SimpleRenderer
      >();

      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, containerRef.current, { preserveDrawingBuffer: true });
      world.camera = new OBC.SimpleCamera(components);

      components.init();

      world.scene.setup({
        backgroundColor: new THREE.Color(0xf1f5f9),
        ambientLight: { color: new THREE.Color(0xffffff), intensity: 1.5 },
        directionalLight: {
          color: new THREE.Color(0xffffff),
          intensity: 2,
          position: new THREE.Vector3(5, 10, 3),
        },
      });

      const fragments = components.get(OBC.FragmentsManager);
      const workerURL = await OBC.FragmentsManager.getWorker();
      if (disposed) { components.dispose(); return; }
      fragments.init(workerURL);

      const grids = components.get(OBC.Grids);
      grids.create(world);

      const casters = components.get(OBC.Raycasters);
      const caster = casters.get(world);

      componentsRef.current = components;
      worldRef.current = world;
      readyRef.current = true;

      // Necesario para que renderer.clippingPlanes funcione en Three.js
      world.renderer.three.localClippingEnabled = true;

      const canvas = world.renderer.three.domElement;
      let mouseDownX = 0;
      let mouseDownY = 0;

      const onMouseDown = (e: MouseEvent) => {
        mouseDownX = e.clientX;
        mouseDownY = e.clientY;
      };

      // ── Helpers de medición (THREE objects) ──────────────────────────
      const markerSize = () => {
        const bb = modelBboxRef.current;
        if (!bb) return 0.015;
        const sz = new THREE.Vector3(); bb.getSize(sz);
        return Math.max(sz.length() * 0.0015, 0.005);
      };

      const addMarker = (pt: THREE.Vector3) => {
        const r = markerSize();
        const geo = new THREE.SphereGeometry(r, 10, 10);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ccff, depthTest: false });
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(pt);
        m.renderOrder = 1000;
        world.scene.three.add(m);
        measureObjectsRef.current.push(m);
      };

      const addMeasureLine = (p1: THREE.Vector3, p2: THREE.Vector3) => {
        const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const mat = new THREE.LineBasicMaterial({ color: 0x00ccff, depthTest: false });
        const line = new THREE.Line(geo, mat);
        line.renderOrder = 1000;
        world.scene.three.add(line);
        measureObjectsRef.current.push(line);
      };

      const disposeMat = (mat: any) => {
        if (!mat) return;
        if (Array.isArray(mat)) mat.forEach((m: any) => m?.dispose?.());
        else mat.dispose?.();
      };

      // Línea de previsualización (primer punto → cursor)
      const previewGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const previewLine = new THREE.Line(
        previewGeo,
        new THREE.LineBasicMaterial({ color: 0x00ccff, depthTest: false, transparent: true, opacity: 0.55 })
      );
      previewLine.renderOrder = 1001;
      previewLine.visible = false;
      world.scene.three.add(previewLine);
      measurePreviewLineRef.current = previewLine;

      const clearMeasureObjects = () => {
        for (const obj of measureObjectsRef.current) {
          world.scene.three.remove(obj);
          (obj as any).geometry?.dispose();
          disposeMat((obj as any).material);
        }
        measureObjectsRef.current = [];
      };

      // ── Snap a vértices y aristas ──────────────────────────────────────
      const SNAP_PX = 20; // píxeles de pantalla para activar snap

      const computeSnapPoint = (result: any): { point: THREE.Vector3; snapped: boolean } => {
        const rawPt = (result.point as THREE.Vector3).clone();
        const fallback = { point: rawPt, snapped: false };
        try {
          if (!result.face || !result.object) return fallback;
          const mesh = result.object as THREE.Mesh;
          const posAttr = mesh.geometry?.attributes?.position;
          if (!posAttr || !posAttr.array) return fallback;

          const { a, b, c } = result.face as THREE.Face;
          const toWorld = (i: number) =>
            new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
              .applyMatrix4(mesh.matrixWorld);
          const verts = [toWorld(a), toWorld(b), toWorld(c)];

          const cam = (world.camera as any).three as THREE.Camera;
          const rect = canvas.getBoundingClientRect();
          const toScreen = (v: THREE.Vector3) => {
            const ndc = v.clone().project(cam);
            return new THREE.Vector2((ndc.x * 0.5 + 0.5) * rect.width, (-ndc.y * 0.5 + 0.5) * rect.height);
          };
          const ptScreen = toScreen(rawPt);

          // Prioridad: vértice
          for (const v of verts) {
            if (ptScreen.distanceTo(toScreen(v)) < SNAP_PX) return { point: v, snapped: true };
          }
          // Si no: arista más cercana
          let bestDist = SNAP_PX;
          let bestPt: THREE.Vector3 | null = null;
          const edges: [THREE.Vector3, THREE.Vector3][] = [[verts[0], verts[1]], [verts[1], verts[2]], [verts[2], verts[0]]];
          for (const [e0, e1] of edges) {
            const closest = new THREE.Vector3();
            new THREE.Line3(e0, e1).closestPointToPoint(rawPt, true, closest);
            const d = ptScreen.distanceTo(toScreen(closest));
            if (d < bestDist) { bestDist = d; bestPt = closest.clone(); }
          }
          if (bestPt) return { point: bestPt, snapped: true };
        } catch { /* geometría del fragmento no accesible, usar punto crudo */ }
        return fallback;
      };

      const updateSnapCursor = (snapPt: THREE.Vector3 | null, snapped = false) => {
        const div = measureSnapDivRef.current;
        if (!div) return;
        if (!snapPt) { div.style.display = "none"; return; }
        const cam = (world.camera as any).three as THREE.Camera;
        const rect = canvas.getBoundingClientRect();
        const ndc = snapPt.clone().project(cam);
        div.style.display = "block";
        div.style.left = `${(ndc.x * 0.5 + 0.5) * rect.width}px`;
        div.style.top  = `${(-ndc.y * 0.5 + 0.5) * rect.height}px`;
        // Snapped a vértice/arista: círculo sólido; punto libre: círculo hueco
        div.style.background = snapped ? "#00ccff" : "rgba(0,204,255,0.25)";
        div.style.borderColor = "#00ccff";
      };

      let snapBusy = false;
      const onMeasureMouseMove = async () => {
        if (!measureModeRef.current || snapBusy) return;
        snapBusy = true;
        try {
          const result = (await caster.castRay()) as any;
          if (!result?.point) { updateSnapCursor(null); return; }
          try {
            const { point, snapped } = computeSnapPoint(result);
            measureLastHitRef.current = point;
            updateSnapCursor(point, snapped);
          } catch {
            measureLastHitRef.current = result.point as THREE.Vector3;
            updateSnapCursor(result.point as THREE.Vector3);
          }
        } finally {
          snapBusy = false;
        }
      };
      canvas.addEventListener("mousemove", onMeasureMouseMove);
      canvas.addEventListener("mouseleave", () => {
        updateSnapCursor(null);
        measureLastHitRef.current = null;
        if (measurePreviewLineRef.current) measurePreviewLineRef.current.visible = false;
      });

      const onMouseUp = async (e: MouseEvent) => {
        if (e.button !== 0) return;
        const dx = Math.abs(e.clientX - mouseDownX);
        const dy = Math.abs(e.clientY - mouseDownY);
        if (dx > 5 || dy > 5) return;

        // ── MODO MEDICIÓN ──────────────────────────────────────────────
        if (measureModeRef.current) {
          const result = (await caster.castRay()) as any;
          if (!result?.point) return;
          let pt: THREE.Vector3;
          try { pt = computeSnapPoint(result).point; }
          catch { pt = (result.point as THREE.Vector3).clone(); }

          const pts = measurePointsRef.current;

          if (pts.length === 0) {
            // Primer punto: marcador en curso
            addMarker(pt);
            measurePointsRef.current = [pt];
            setMeasureStep(1);
          } else {
            // Segundo punto: completar medición y empezar nueva
            const p1 = pts[0];
            addMarker(pt);
            addMeasureLine(p1, pt);
            const dist = p1.distanceTo(pt);
            measureDistRef.current = dist;

            // Crear etiqueta DOM para esta medición
            const labelEl = document.createElement("div");
            labelEl.style.cssText = [
              "display:block", "position:absolute", "pointer-events:none",
              "transform:translate(-50%,-130%)", "z-index:20",
              "background:#0066cc", "color:#fff", "font-size:11px",
              "font-weight:600", "padding:3px 8px", "border-radius:6px",
              "box-shadow:0 2px 8px rgba(0,0,102,0.3)", "white-space:nowrap",
            ].join(";");
            labelEl.textContent = dist >= 1 ? `${dist.toFixed(3)} m` : `${(dist * 100).toFixed(1)} cm`;
            canvas.parentElement?.appendChild(labelEl);

            // Guardar medición completada
            completedMeasurementsRef.current = [
              ...completedMeasurementsRef.current,
              { p1, p2: pt, distance: dist, objects: [...measureObjectsRef.current], labelEl },
            ];
            measureObjectsRef.current = [];
            measurePointsRef.current  = [];

            setMeasureDistance(dist);
            setMeasureCount(completedMeasurementsRef.current.length);
            setMeasureStep(0); // listo para siguiente medición
          }
          return;
        }

        const isMulti = e.ctrlKey || e.metaKey;
        const result = (await caster.castRay()) as any;

        if (!result || !result.fragments?.modelId) {
          if (!isMulti) {
            selectedItemsRef.current = [];
            await fragments.resetHighlight();
            await reapplyColors(fragments);
            await reapplyGhost(fragments);
            setPanel(null);
          }
          return;
        }

        const modelId: string = result.fragments.modelId;
        const localId: number = result.localId;

        if (isMulti) {
          const idx = selectedItemsRef.current.findIndex(
            (s) => s.modelId === modelId && s.localId === localId
          );
          if (idx >= 0) {
            selectedItemsRef.current = selectedItemsRef.current.filter((_, i) => i !== idx);
          } else {
            selectedItemsRef.current = [...selectedItemsRef.current, { modelId, localId }];
          }
        } else {
          selectedItemsRef.current = [{ modelId, localId }];
        }

        // Reset → reaplicar colores persistidos → ghost → selección completa
        await fragments.resetHighlight();
        await reapplyColors(fragments);
        await reapplyGhost(fragments);
        await reapplySelection(fragments);

        // Construir propiedades mergeadas de todos los elementos seleccionados
        const allItems = selectedItemsRef.current;
        const propMap = new Map<string, string[]>();
        let displayName = "Elemento";
        let displayType: string | null = null;

        for (const { modelId: mid, localId: lid } of allItems) {
          const m = fragments.list.get(mid);
          if (!m) continue;
          const [data] = await m.getItemsData([lid]);
          if (!data) continue;

          if (mid === modelId && lid === localId) {
            const nameAttr = data.Name as { value?: unknown } | undefined;
            const typeVal = data.type as { value?: unknown } | undefined;
            const nm = nameAttr?.value ? String(nameAttr.value) : null;
            const tp = typeVal?.value ? String(typeVal.value) : null;
            displayName = nm ?? tp ?? "Elemento";
            displayType = tp !== nm ? tp : null;
          }

          for (const [key, val] of Object.entries(data)) {
            if (key === "type") continue;
            const v = (val as { value?: unknown })?.value;
            if (v === undefined || v === null || v === "") continue;
            const str = String(v);
            if (!propMap.has(key)) propMap.set(key, []);
            propMap.get(key)!.push(str);
          }
        }

        if (allItems.length > 1) {
          displayName = `${allItems.length} elementos`;
          displayType = null;
        }

        const entries: Property[] = [];
        for (const [key, vals] of propMap.entries()) {
          const unique = [...new Set(vals)];
          entries.push({
            key,
            value: unique[0],
            allValues: unique.length > 1 ? unique : undefined,
          });
        }

        setPanelFilter("");
        setPanel({
          name: displayName,
          type: displayType,
          properties: entries,
        });
      };

      const onContextMenu = async (e: MouseEvent) => {
        e.preventDefault();
        const result = (await caster.castRay()) as any;
        if (!result || !result.fragments?.modelId) {
          setContextMenu(null);
          return;
        }

        const modelId: string = result.fragments.modelId;
        const localId: number = result.localId;
        const model = fragments.list.get(modelId);
        if (!model) return;

        const [data] = await model.getItemsData([localId]);
        const nameAttr = data?.Name as { value?: unknown } | undefined;
        const typeVal = data?.type as { value?: unknown } | undefined;
        const name = nameAttr?.value
          ? String(nameAttr.value)
          : typeVal?.value ? String(typeVal.value) : "Elemento";

        setContextMenu({ name, modelId, localId, x: e.clientX, y: e.clientY });
      };

      canvas.addEventListener("mousedown", onMouseDown);
      canvas.addEventListener("mouseup", onMouseUp);
      canvas.addEventListener("contextmenu", onContextMenu);

      // ── Section box drag ──────────────────────────────────────────────
      const HANDLE_AXES: Array<{ axis: "x" | "y" | "z"; dir: "min" | "max" }> = [
        { axis: "x", dir: "min" }, { axis: "x", dir: "max" },
        { axis: "y", dir: "min" }, { axis: "y", dir: "max" },
        { axis: "z", dir: "min" }, { axis: "z", dir: "max" },
      ];
      const sectionRaycaster = new THREE.Raycaster();
      let wasSectionDrag = false;

      const getNDC = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
      };

      const applyPlanesFromRef = () => {
        const r = worldRef.current?.renderer as any;
        const renderer: THREE.WebGLRenderer | undefined = r?.three;
        if (!renderer) return;
        const { x, y, z } = sectionRef.current;
        const q = boxRotQRef.current;
        const lX = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
        const lY = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
        const lZ = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
        const planes: THREE.Plane[] = [];
        if (x.enabled) {
          planes.push(new THREE.Plane(lX.clone(), -x.minVal));
          planes.push(new THREE.Plane(lX.clone().negate(), x.maxVal));
        }
        if (y.enabled) {
          planes.push(new THREE.Plane(lY.clone(), -y.minVal));
          planes.push(new THREE.Plane(lY.clone().negate(), y.maxVal));
        }
        if (z.enabled) {
          planes.push(new THREE.Plane(lZ.clone(), -z.minVal));
          planes.push(new THREE.Plane(lZ.clone().negate(), z.maxVal));
        }
        renderer.clippingPlanes = planes;
      };

      const updateBoxFromRef = () => {
        const { x, y, z } = sectionRef.current;
        const q = boxRotQRef.current;
        const lX = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
        const lY = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
        const lZ = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
        const midX = (x.minVal + x.maxVal) / 2;
        const midY = (y.minVal + y.maxVal) / 2;
        const midZ = (z.minVal + z.maxVal) / 2;
        const center = new THREE.Vector3()
          .addScaledVector(lX, midX).addScaledVector(lY, midY).addScaledVector(lZ, midZ);
        const halfX = (x.maxVal - x.minVal) / 2;
        const halfY = (y.maxVal - y.minVal) / 2;
        const halfZ = (z.maxVal - z.minVal) / 2;
        const sx = Math.max(halfX * 2, 0.001);
        const sy = Math.max(halfY * 2, 0.001);
        const sz = Math.max(halfZ * 2, 0.001);
        const group = sectionBoxGroupRef.current;
        if (group) { group.position.copy(center); group.quaternion.copy(q); }
        const wire = sectionBoxWireRef.current;
        if (wire) { wire.position.set(0, 0, 0); wire.scale.set(sx, sy, sz); }
        const [xMinH, xMaxH, yMinH, yMaxH, zMinH, zMaxH] = sectionBoxHandlesRef.current;
        const tx = Math.max(sx * 0.05, 0.05);
        const ty = Math.max(sy * 0.05, 0.05);
        const tz = Math.max(sz * 0.05, 0.05);
        if (xMinH) { xMinH.position.set(-halfX, 0, 0); xMinH.scale.set(tx, sy, sz); }
        if (xMaxH) { xMaxH.position.set( halfX, 0, 0); xMaxH.scale.set(tx, sy, sz); }
        if (yMinH) { yMinH.position.set(0, -halfY, 0); yMinH.scale.set(sx, ty, sz); }
        if (yMaxH) { yMaxH.position.set(0,  halfY, 0); yMaxH.scale.set(sx, ty, sz); }
        if (zMinH) { zMinH.position.set(0, 0, -halfZ); zMinH.scale.set(sx, sy, tz); }
        if (zMaxH) { zMaxH.position.set(0, 0,  halfZ); zMaxH.scale.set(sx, sy, tz); }
      };

      const getCam = () => {
        const camAny = world.camera as any;
        return (camAny.three ?? camAny.activeCamera ?? camAny.camera) as THREE.Camera | undefined;
      };
      const getCtrl = () => (world.camera as any).controls ?? (world.camera as any).orbitControls ?? null;

      const onSectionPointerDown = (e: PointerEvent) => {
        if (!sectionBoxEnabledRef.current || !sectionBoxVisibleRef.current || sectionBoxHandlesRef.current.length === 0) return;
        const cam = getCam();
        if (!cam) return;
        sectionRaycaster.setFromCamera(getNDC(e), cam);
        sectionBoxHandlesRef.current.forEach(h => h.updateMatrixWorld(true));
        const hits = sectionRaycaster.intersectObjects(sectionBoxHandlesRef.current, false);
        if (hits.length === 0) return;
        e.stopPropagation();
        const idx = sectionBoxHandlesRef.current.indexOf(hits[0].object as THREE.Mesh);
        if (idx < 0) return;
        const { axis, dir } = HANDLE_AXES[idx];
        const s = sectionRef.current;
        const startVal = dir === "min" ? s[axis].minVal : s[axis].maxVal;
        const startHit = hits[0].point.clone();
        // Eje en espacio local → mundo aplicando la rotación del box
        const localAxis = axis === "x"
          ? new THREE.Vector3(1, 0, 0)
          : axis === "y" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
        const axisDir = localAxis.applyQuaternion(boxRotQRef.current);
        const cameraDir = new THREE.Vector3();
        cam.getWorldDirection(cameraDir);
        const viewPlane = new THREE.Plane(cameraDir, -startHit.dot(cameraDir));
        dragHandleDataRef.current = { axis, dir, plane: viewPlane, axisDir, startHit, startVal };
        mouseDownX = -9999; mouseDownY = -9999;
        const ctrl = getCtrl();
        if (ctrl) ctrl.enabled = false;
        canvas.setPointerCapture(e.pointerId);
      };

      const onSectionPointerMove = (e: PointerEvent) => {
        const cam = getCam();
        if (!cam) return;
        sectionRaycaster.setFromCamera(getNDC(e), cam);

        const drag = dragHandleDataRef.current;
        if (drag) {
          wasSectionDrag = true;
          const newHit = new THREE.Vector3();
          if (!sectionRaycaster.ray.intersectPlane(drag.plane, newHit)) return;
          const displacement = newHit.clone().sub(drag.startHit).dot(drag.axisDir);
          const raw = drag.startVal + displacement;
          const { axis, dir } = drag;
          const s = sectionRef.current;
          const newAxis: SectionAxis = dir === "min"
            ? { ...s[axis], minVal: Math.min(raw, s[axis].maxVal - 0.01) }
            : { ...s[axis], maxVal: Math.max(raw, s[axis].minVal + 0.01) };
          sectionRef.current = { ...s, [axis]: newAxis };
          if (axis === "x") setSectionX(newAxis);
          else if (axis === "y") setSectionY(newAxis);
          else setSectionZ(newAxis);
          updateBoxFromRef();
          applyPlanesFromRef();
          return;
        }

        // ── Hover highlight ──
        if (!sectionBoxEnabledRef.current || !sectionBoxVisibleRef.current || sectionBoxHandlesRef.current.length === 0) return;
        const hits = sectionRaycaster.intersectObjects(sectionBoxHandlesRef.current, false);
        const hovIdx = hits.length > 0 ? sectionBoxHandlesRef.current.indexOf(hits[0].object as THREE.Mesh) : -1;
        sectionBoxHandlesRef.current.forEach((h, i) => {
          (h.material as THREE.MeshBasicMaterial).opacity = i === hovIdx ? 0.3 : 0;
        });
        canvas.style.cursor = hovIdx >= 0 ? "grab" : "";
      };

      const onSectionPointerUp = (e: PointerEvent) => {
        if (!dragHandleDataRef.current) return;
        dragHandleDataRef.current = null;
        canvas.style.cursor = "";
        try { canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
        const ctrl = getCtrl();
        if (ctrl) ctrl.enabled = true;
        setTimeout(() => { wasSectionDrag = false; }, 0);
      };

      // Override onMouseUp to skip selection after section drag
      const originalOnMouseUp = onMouseUp;
      const guardedOnMouseUp = async (e: MouseEvent) => {
        if (wasSectionDrag) return;
        await originalOnMouseUp(e);
      };
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.addEventListener("mouseup", guardedOnMouseUp);

      canvas.addEventListener("pointerdown", onSectionPointerDown);
      canvas.addEventListener("pointermove", onSectionPointerMove);
      canvas.addEventListener("pointerup", onSectionPointerUp);

      // ── ViewCube integrado en el mismo canvas ─────────────────────────
      const VC_CSS = 68; // tamaño en px CSS (top-right del canvas 3D)

      const vcScene = new THREE.Scene();
      vcScene.add(new THREE.AmbientLight(0xffffff, 2));
      const vcCamera = new THREE.OrthographicCamera(-0.9, 0.9, 0.9, -0.9, 0.1, 100);
      vcCamera.position.set(0, 0, 5);
      vcCamera.lookAt(0, 0, 0);

      const vcGeo   = new THREE.BoxGeometry(1.3, 1.3, 1.3);
      const vcBaseMats = VC_FACE_DATA.map(f =>
        new THREE.MeshBasicMaterial({ map: makeVCTexture(f.label, false, f.base, f.hov), transparent: true, opacity: 0.28 })
      );
      const vcHovMats = VC_FACE_DATA.map(f =>
        new THREE.MeshBasicMaterial({ map: makeVCTexture(f.label, true, f.base, f.hov), transparent: true, opacity: 0.82 })
      );
      const vcMesh = new THREE.Mesh(vcGeo, vcBaseMats as THREE.Material[]);
      const vcEdges = new THREE.EdgesGeometry(vcGeo);
      vcMesh.add(new THREE.LineSegments(
        vcEdges,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
      ));
      vcScene.add(vcMesh);

      vcSceneRef.current    = vcScene;
      vcCameraRef.current   = vcCamera;
      vcMeshRef.current     = vcMesh;
      vcBaseMatsRef.current = vcBaseMats;
      vcHovMatsRef.current  = vcHovMats;

      const renderer = world.renderer.three;

      // Renderizar el VC en el top-right del canvas tras cada frame principal
      const vcAfterRender = () => {
        const vc = vcMeshRef.current;
        const vcCam = vcCameraRef.current;
        const vcSc = vcSceneRef.current;
        if (!vc || !vcCam || !vcSc) return;

        const mainCam = world.camera.three as THREE.Camera;
        vc.quaternion.copy(mainCam.quaternion).invert();

        // getSize() devuelve píxeles CSS — que es lo que setViewport/setScissor esperan
        renderer.getSize(_vcSz);
        const cw = _vcSz.x;
        const ch = _vcSz.y;

        const prevAutoClear = renderer.autoClear;
        const prevPlanes = renderer.clippingPlanes;
        renderer.autoClear = false;
        renderer.clippingPlanes = [];
        renderer.setScissorTest(true);
        renderer.setScissor(cw - VC_CSS, ch - VC_CSS, VC_CSS, VC_CSS);
        renderer.setViewport(cw - VC_CSS, ch - VC_CSS, VC_CSS, VC_CSS);
        renderer.clearDepth();
        renderer.render(vcSc, vcCam);
        renderer.autoClear = prevAutoClear;
        renderer.clippingPlanes = prevPlanes;
        renderer.setScissor(0, 0, cw, ch);
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, cw, ch);
      };

      world.renderer.onAfterUpdate.add(vcAfterRender);

      // ── Actualizar etiqueta de medición cada frame (DOM directo, sin setState) ──
      const measureAfterRender = () => {
        const cam = (world.camera as any).three as THREE.Camera;
        const rect = canvas.getBoundingClientRect();

        // Etiquetas de mediciones completadas
        for (const m of completedMeasurementsRef.current) {
          const mid = new THREE.Vector3().addVectors(m.p1, m.p2).multiplyScalar(0.5);
          mid.project(cam);
          m.labelEl.style.left = `${(mid.x * 0.5 + 0.5) * rect.width}px`;
          m.labelEl.style.top  = `${(-mid.y * 0.5 + 0.5) * rect.height}px`;
        }

        // Línea de previsualización
        const pl = measurePreviewLineRef.current;
        if (pl) {
          const pts = measurePointsRef.current;
          const hit = measureLastHitRef.current;
          if (measureModeRef.current && pts.length === 1 && hit) {
            const pos = pl.geometry.attributes.position as THREE.BufferAttribute;
            pos.setXYZ(0, pts[0].x, pts[0].y, pts[0].z);
            pos.setXYZ(1, hit.x, hit.y, hit.z);
            pos.needsUpdate = true;
            pl.geometry.computeBoundingSphere();
            pl.visible = true;
          } else {
            pl.visible = false;
          }
        }
      };
      world.renderer.onAfterUpdate.add(measureAfterRender);

      // Eventos del ViewCube: capture phase para interceptar antes que camera-controls
      let vcPendingDir: THREE.Vector3 | null = null;

      // Devuelve rect + flags para evitar doble getBoundingClientRect()
      const vcHitInfo = (e: { clientX: number; clientY: number }) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const inVC = x >= rect.width - VC_CSS && y <= VC_CSS;
        const ndc = new THREE.Vector2(
          ((x - (rect.width - VC_CSS)) / VC_CSS) * 2 - 1,
          -(y / VC_CSS) * 2 + 1
        );
        return { inVC, ndc };
      };

      // pointerdown: interceptar + registrar la cara sobre la que se presionó
      const onVCPointerDown = (e: PointerEvent) => {
        const { inVC, ndc } = vcHitInfo(e);
        if (!inVC) return;
        e.stopImmediatePropagation();

        const mesh = vcMeshRef.current;
        const cam  = vcCameraRef.current;
        if (!mesh || !cam) return;
        vcRaycasterRef.current.setFromCamera(ndc, cam);
        const hits = vcRaycasterRef.current.intersectObject(mesh, false);
        vcPendingDir = (hits.length > 0 && hits[0].face)
          ? VC_FACE_DATA[hits[0].face.materialIndex].worldDir.clone()
          : null;
      };

      // pointerup: navegar si vcPendingDir está guardado
      const onVCPointerUp = (e: PointerEvent) => {
        const dir = vcPendingDir;
        vcPendingDir = null;
        if (!dir) return;
        e.stopImmediatePropagation();
        canvas.style.cursor = "";

        const box = modelBboxRef.current;
        const w2  = worldRef.current;
        if (!box || !w2) return;
        const center = new THREE.Vector3(); box.getCenter(center);
        const size   = new THREE.Vector3(); box.getSize(size);
        const d = Math.max(size.x, size.y, size.z) * 2;
        const controls = (w2.camera as any).controls;
        if (typeof controls?.setLookAt !== "function") return;
        const pos = center.clone().addScaledVector(dir, d);
        controls.setLookAt(pos.x, pos.y, pos.z, center.x, center.y, center.z, true);
      };

      // mousemove: solo para el hover visual (no afecta a camera-controls)
      const onVCMouseMove = (e: MouseEvent) => {
        const { inVC, ndc } = vcHitInfo(e);
        const mesh = vcMeshRef.current;
        const cam  = vcCameraRef.current;
        if (!mesh || !cam) return;

        if (!inVC) {
          const hi = vcHovIdxRef.current;
          if (hi !== null) {
            (mesh.material as THREE.Material[])[hi] = vcBaseMatsRef.current[hi];
            vcHovIdxRef.current = null;
            canvas.style.cursor = "";
          }
          return;
        }

        vcRaycasterRef.current.setFromCamera(ndc, cam);
        const hits = vcRaycasterRef.current.intersectObject(mesh, false);
        const newIdx = hits.length > 0 && hits[0].face ? hits[0].face.materialIndex : null;
        const hi = vcHovIdxRef.current;
        if (newIdx !== hi) {
          if (hi !== null) (mesh.material as THREE.Material[])[hi] = vcBaseMatsRef.current[hi];
          if (newIdx !== null) (mesh.material as THREE.Material[])[newIdx] = vcHovMatsRef.current[newIdx];
          vcHovIdxRef.current = newIdx;
        }
        canvas.style.cursor = newIdx !== null ? "pointer" : "default";
      };

      canvas.addEventListener("pointerdown", onVCPointerDown, { capture: true });
      canvas.addEventListener("pointerup",   onVCPointerUp,   { capture: true });
      canvas.addEventListener("mousemove",   onVCMouseMove,   { capture: true });

      vcCleanupRef.current = () => {
        world.renderer?.onAfterUpdate.remove(vcAfterRender);
        world.renderer?.onAfterUpdate.remove(measureAfterRender);
        canvas.removeEventListener("mousemove", onMeasureMouseMove);
        const pl = measurePreviewLineRef.current;
        if (pl) { world.scene.three.remove(pl); pl.geometry.dispose(); (pl.material as THREE.Material).dispose(); measurePreviewLineRef.current = null; }
        canvas.removeEventListener("pointerdown", onVCPointerDown, { capture: true });
        canvas.removeEventListener("pointerup",   onVCPointerUp,   { capture: true });
        canvas.removeEventListener("mousemove",   onVCMouseMove,   { capture: true });
        vcGeo.dispose();
        vcEdges.dispose();
        vcBaseMats.forEach(m => { m.map?.dispose(); m.dispose(); });
        vcHovMats.forEach(m => { m.map?.dispose(); m.dispose(); });
        vcSceneRef.current  = null;
        vcCameraRef.current = null;
        vcMeshRef.current   = null;
      };
    }

    init();

    return () => {
      disposed = true;
      readyRef.current = false;
      vcCleanupRef.current?.();
      vcCleanupRef.current = null;
      if (componentsRef.current) {
        componentsRef.current.dispose();
        componentsRef.current = null;
        worldRef.current = null;
      }
    };
  }, [reapplyColors, reapplyGhost, reapplySelection]);

  const loadIfc = useCallback(async (file: File) => {
    if (!readyRef.current || !componentsRef.current || !worldRef.current) return;

    setLoading(true);
    setError(null);
    setPanel(null);

    try {
      const components = componentsRef.current;
      const world = worldRef.current;

      const ifcLoader = components.get(OBC.IfcLoader);
      ifcLoader.settings.wasm.path = "/";
      ifcLoader.settings.wasm.absolute = true;
      ifcLoader.settings.autoSetWasm = false;
      await ifcLoader.setup();

      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const model = await ifcLoader.load(data, true, file.name, {
        instanceCallback: (importer) => {
          importer.addAllAttributes();
          importer.addAllRelations();
        },
      });

      world.scene.three.add(model.object);
      modelObjectRef.current = model.object;
      setHasModel(true);
      await world.camera.fitToItems();

      // Guardar modelId y construir árbol
      const frags = components.get(OBC.FragmentsManager);
      let modelId: string | null = null;
      for (const [id, m] of frags.list) {
        if (m === model) { modelId = id; break; }
      }
      currentModelIdRef.current = modelId;
      if (modelId) {
        const tree = await buildModelTree(model, modelId);
        setModelTree(tree);

        // Categorías derivadas del árbol (no necesitamos getCategories())
        setCategories(buildCategoryItems(tree));

        // Bounds para planos de sección — getMergedBox con fallback a setFromObject
        let box: THREE.Box3 | null = null;
        if (typeof (model as any).getMergedBox === "function") {
          try {
            const raw = await (model as any).getMergedBox();
            if (raw instanceof THREE.Box3 && !raw.isEmpty()) box = raw;
          } catch { /* ignorar */ }
        }
        if (!box) {
          model.object.updateMatrixWorld(true);
          const fb = new THREE.Box3().setFromObject(model.object);
          if (fb.min.x !== fb.max.x || fb.min.y !== fb.max.y || fb.min.z !== fb.max.z) box = fb;
        }
        if (box) {
          modelBboxRef.current = box;
          const nx: SectionAxis = { enabled: false, minVal: box.min.x, maxVal: box.max.x, bboxMin: box.min.x, bboxMax: box.max.x };
          const ny: SectionAxis = { enabled: false, minVal: box.min.y, maxVal: box.max.y, bboxMin: box.min.y, bboxMax: box.max.y };
          const nz: SectionAxis = { enabled: false, minVal: box.min.z, maxVal: box.max.z, bboxMin: box.min.z, bboxMax: box.max.z };
          setSectionX(nx); setSectionY(ny); setSectionZ(nz);
          sectionRef.current = { x: nx, y: ny, z: nz };

          // Crear o reinicializar la caja de sección
          if (sectionBoxGroupRef.current) {
            world.scene.three.remove(sectionBoxGroupRef.current);
          }
          boxRotQRef.current = new THREE.Quaternion();
          const { group, wire, handles } = createSectionBox(world.scene.three);
          sectionBoxGroupRef.current = group;
          sectionBoxWireRef.current  = wire;
          sectionBoxHandlesRef.current = handles;

          // Posicionar usando updateBoxFromRef (ya usa rotación y coordenadas locales)
          updateSectionBox();
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar el archivo. Comprueba que sea un IFC válido.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleHide = useCallback(async (modelId: string, localId: number) => {
    if (!componentsRef.current) return;
    const fragments = componentsRef.current.get(OBC.FragmentsManager);

    const inSelection = selectedItemsRef.current.some(
      (s) => s.modelId === modelId && s.localId === localId
    );
    const targets = inSelection && selectedItemsRef.current.length > 1
      ? selectedItemsRef.current
      : [{ modelId, localId }];

    const newHidden: HiddenItem[] = [];
    for (const { modelId: mid, localId: lid } of targets) {
      const model = fragments.list.get(mid);
      if (!model) continue;
      await model.setVisible([lid], false);
      newHidden.push({ modelId: mid, localId: lid });
    }
    setHiddenItems((prev) => [...prev, ...newHidden]);
  }, []);

  const handleColor = useCallback(async (modelId: string, localId: number, hex: string) => {
    if (!componentsRef.current) return;
    const fragments = componentsRef.current.get(OBC.FragmentsManager);

    const inSelection = selectedItemsRef.current.some(
      (s) => s.modelId === modelId && s.localId === localId
    );
    const targets = inSelection && selectedItemsRef.current.length > 1
      ? selectedItemsRef.current
      : [{ modelId, localId }];

    let next = [...coloredItemsRef.current];
    for (const { modelId: mid, localId: lid } of targets) {
      next = next.filter((i) => !(i.modelId === mid && i.localId === lid));
      next.push({ modelId: mid, localId: lid, hex });
    }
    coloredItemsRef.current = next;
    setColoredCount(next.length);

    await fragments.resetHighlight();
    await reapplyColors(fragments);
    await reapplyGhost(fragments);
  }, [reapplyColors, reapplyGhost]);

  const handleGhostSelected = useCallback(async (modelId: string, localId: number) => {
    if (!componentsRef.current) return;
    const fragments = componentsRef.current.get(OBC.FragmentsManager);
    const inSelection = selectedItemsRef.current.some(
      (s) => s.modelId === modelId && s.localId === localId
    );
    const targets = inSelection && selectedItemsRef.current.length > 1
      ? selectedItemsRef.current
      : [{ modelId, localId }];
    ghostedItemsRef.current = targets;
    setGhostMode("selected");
    setGhostCount(targets.length);
    setLeftTab("section");
    await fragments.resetHighlight();
    await reapplyColors(fragments);
    await reapplyGhost(fragments);
    await reapplySelection(fragments);
  }, [reapplyColors, reapplyGhost, reapplySelection]);

  const handleGhostOthers = useCallback(async (modelId: string, localId: number) => {
    if (!componentsRef.current) return;
    const fragments = componentsRef.current.get(OBC.FragmentsManager);
    const mid = currentModelIdRef.current;
    if (!mid) return;
    const inSelection = selectedItemsRef.current.some(
      (s) => s.modelId === modelId && s.localId === localId
    );
    const protected_ = inSelection && selectedItemsRef.current.length > 1
      ? new Set(selectedItemsRef.current.map((s) => s.localId))
      : new Set([localId]);
    const all = collectAllLocalIds(modelTree, mid);
    const targets = all.filter((i) => !protected_.has(i.localId));
    ghostedItemsRef.current = targets;
    setGhostMode("others");
    setGhostCount(targets.length);
    setLeftTab("section");
    await fragments.resetHighlight();
    await reapplyColors(fragments);
    await reapplyGhost(fragments);
    await reapplySelection(fragments);
  }, [reapplyColors, reapplyGhost, reapplySelection, modelTree]);

  const clearGhost = useCallback(async () => {
    if (!componentsRef.current) return;
    const fragments = componentsRef.current.get(OBC.FragmentsManager);
    ghostedItemsRef.current = [];
    setGhostMode(null);
    setGhostCount(0);
    await fragments.resetHighlight();
    await reapplyColors(fragments);
    await reapplySelection(fragments);
  }, [reapplyColors, reapplySelection]);

  const clearMeasure = useCallback(() => {
    const world = worldRef.current;
    const disposeObjs = (objs: THREE.Object3D[]) => {
      for (const obj of objs) {
        world?.scene.three.remove(obj);
        (obj as any).geometry?.dispose();
        const mat = (obj as any).material;
        if (mat) Array.isArray(mat) ? mat.forEach((m: any) => m?.dispose?.()) : mat.dispose?.();
      }
    };
    // Limpiar objetos en curso
    disposeObjs(measureObjectsRef.current);
    measureObjectsRef.current = [];
    // Limpiar mediciones completadas
    for (const m of completedMeasurementsRef.current) {
      disposeObjs(m.objects);
      m.labelEl.remove();
    }
    completedMeasurementsRef.current = [];
    measurePointsRef.current  = [];
    measureLastHitRef.current = null;
    measureDistRef.current    = null;
    if (measurePreviewLineRef.current) measurePreviewLineRef.current.visible = false;
    setMeasureStep(0);
    setMeasureDistance(null);
    setMeasureCount(0);
  }, []);

  const restoreAll = useCallback(async () => {
    if (!componentsRef.current) return;
    const fragments = componentsRef.current.get(OBC.FragmentsManager);

    // Restaurar visibilidad
    for (const { modelId, localId } of hiddenItems) {
      const model = fragments.list.get(modelId);
      if (model) await model.setVisible([localId], true);
    }

    // Limpiar todos los highlights (colores y selección)
    await fragments.resetHighlight();

    // Resetear section box
    const nx = { ...sectionX, enabled: false, minVal: sectionX.bboxMin, maxVal: sectionX.bboxMax };
    const ny = { ...sectionY, enabled: false, minVal: sectionY.bboxMin, maxVal: sectionY.bboxMax };
    const nz = { ...sectionZ, enabled: false, minVal: sectionZ.bboxMin, maxVal: sectionZ.bboxMax };
    setSectionX(nx); setSectionY(ny); setSectionZ(nz);
    setSectionBoxActive(false);
    setSectionBoxVisible(true);
    sectionBoxEnabledRef.current = false;
    sectionBoxVisibleRef.current = true;
    sectionRef.current = { x: nx, y: ny, z: nz };
    boxRotQRef.current = new THREE.Quaternion();
    setBoxRotY(0);
    if (sectionBoxGroupRef.current) {
      sectionBoxGroupRef.current.visible = false;
      sectionBoxGroupRef.current.quaternion.identity();
    }
    const r = worldRef.current?.renderer as any;
    if (r?.three) r.three.clippingPlanes = [];

    // Resetear estado
    coloredItemsRef.current = [];
    selectedItemsRef.current = [];
    ghostedItemsRef.current = [];
    setColoredCount(0);
    setHiddenItems([]);
    setGhostMode(null);
    setGhostCount(0);
    setPanel(null);
    setContextMenu(null);
  }, [hiddenItems, sectionX, sectionY, sectionZ]);

  const handleTreeSelect = useCallback(async (localId: number) => {
    if (!componentsRef.current) return;
    const modelId = currentModelIdRef.current;
    if (!modelId) return;

    const fragments = componentsRef.current.get(OBC.FragmentsManager);
    const model = fragments.list.get(modelId);
    if (!model) return;

    selectedItemsRef.current = [{ modelId, localId }];
    setTreeSelectedId(localId);

    await fragments.resetHighlight();
    await reapplyColors(fragments);
    await reapplyGhost(fragments);
    await reapplySelection(fragments);

    const [data] = await model.getItemsData([localId]);
    if (!data) return;

    const nameAttr = data.Name as { value?: unknown } | undefined;
    const typeVal  = data.type as { value?: unknown } | undefined;
    const name     = nameAttr?.value ? String(nameAttr.value) : null;
    const type     = typeVal?.value  ? String(typeVal.value)  : null;

    const entries: Property[] = [];
    for (const [key, val] of Object.entries(data)) {
      if (key === "type") continue;
      const v = (val as { value?: unknown })?.value;
      if (v !== undefined && v !== null && v !== "") {
        entries.push({ key, value: String(v) });
      }
    }

    setPanelFilter("");
    setPanel({
      name: name ?? type ?? "Elemento",
      type: type !== name ? type : null,
      properties: entries,
    });
  }, [reapplyColors, reapplyGhost, reapplySelection]);

  const closePanel = useCallback(async () => {
    setPanel(null);
    setPanelFilter("");
    setTreeSelectedId(null);
    selectedItemsRef.current = [];
    if (componentsRef.current) {
      const fragments = componentsRef.current.get(OBC.FragmentsManager);
      await fragments.resetHighlight();
      await reapplyColors(fragments);
      await reapplyGhost(fragments);
    }
  }, [reapplyColors, reapplyGhost]);

  const handleToggleCategory = useCallback(async (cat: string, visible: boolean) => {
    const modelId = currentModelIdRef.current;
    if (!modelId || !componentsRef.current) return;
    const fragments = componentsRef.current.get(OBC.FragmentsManager);
    const model = fragments.list.get(modelId);
    if (!model) return;

    setCategories((prev) => {
      const item = prev.find((c) => c.cat === cat);
      if (item && item.localIds.length > 0) {
        model.setVisible(item.localIds, visible);
      }
      return prev.map((c) => c.cat === cat ? { ...c, visible } : c);
    });
  }, []);

  const copyValue = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const handleScreenshot = useCallback(() => {
    const r = worldRef.current?.renderer as any;
    const renderer: THREE.WebGLRenderer | undefined = r?.three;
    if (!renderer) return;
    const glCanvas = renderer.domElement;
    const w = glCanvas.width;
    const h = glCanvas.height;

    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext("2d")!;

    // Capa WebGL
    ctx.drawImage(glCanvas, 0, 0);

    // Superponer etiquetas de medición
    const measurements = completedMeasurementsRef.current;
    if (measurements.length > 0) {
      const cam = (worldRef.current?.camera as any)?.three as THREE.Camera | undefined;
      if (cam) {
        const dpr = renderer.getPixelRatio();
        const fontSize = Math.round(12 * dpr);
        ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const roundRect = (x: number, y: number, bw: number, bh: number, rad: number) => {
          ctx.beginPath();
          ctx.moveTo(x + rad, y);
          ctx.lineTo(x + bw - rad, y);
          ctx.quadraticCurveTo(x + bw, y, x + bw, y + rad);
          ctx.lineTo(x + bw, y + bh - rad);
          ctx.quadraticCurveTo(x + bw, y + bh, x + bw - rad, y + bh);
          ctx.lineTo(x + rad, y + bh);
          ctx.quadraticCurveTo(x, y + bh, x, y + bh - rad);
          ctx.lineTo(x, y + rad);
          ctx.quadraticCurveTo(x, y, x + rad, y);
          ctx.closePath();
        };

        for (const m of measurements) {
          const mid = new THREE.Vector3().addVectors(m.p1, m.p2).multiplyScalar(0.5);
          mid.project(cam);
          const sx = (mid.x * 0.5 + 0.5) * w;
          const sy = (-mid.y * 0.5 + 0.5) * h;

          const text = m.distance >= 1
            ? `${m.distance.toFixed(3)} m`
            : `${(m.distance * 100).toFixed(1)} cm`;

          const tw = ctx.measureText(text).width;
          const px = 8 * dpr;
          const py = 4 * dpr;
          const bw = tw + px * 2;
          const bh = fontSize + py * 2;
          const bx = sx - bw / 2;
          const by = sy - bh - 10 * dpr;

          ctx.fillStyle = "#0066cc";
          roundRect(bx, by, bw, bh, 5 * dpr);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.fillText(text, sx, by + bh / 2);
        }
      }
    }

    const link = document.createElement("a");
    link.download = "visor-bim.png";
    link.href = offscreen.toDataURL("image/png");
    link.click();
  }, []);

  const handleShare = useCallback(async () => {
    if (shareState === "ready") { setShareState("idle"); setShareLink(null); return; }
    const file = currentFileRef.current;
    if (!file) return;
    setShareState("uploading");
    try {
      const id = crypto.randomUUID();
      const { error } = await supabase.storage.from(IFC_BUCKET).upload(`${id}.ifc`, file, {
        contentType: "application/octet-stream",
        upsert: false,
      });
      if (error) throw error;
      const link = `${window.location.origin}/bim-viewer?model=${id}`;
      setShareLink(link);
      setShareState("ready");
      setShareEmail("");
      setEmailState("idle");
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2000);
    }
  }, [shareState]);

  const handleCopyLink = useCallback(async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  }, [shareLink]);

  const handleSendEmail = useCallback(async () => {
    if (!shareLink || !shareEmail) return;
    setEmailState("sending");
    try {
      const res = await fetch("/api/share-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail, link: shareLink, filename: currentFileRef.current?.name }),
      });
      if (!res.ok) throw new Error();
      setEmailState("sent");
      setShareEmail("");
    } catch {
      setEmailState("error");
      setTimeout(() => setEmailState("idle"), 2000);
    }
  }, [shareLink, shareEmail]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { currentFileRef.current = file; loadIfc(file); }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { currentFileRef.current = file; loadIfc(file); }
  };

  // Auto-cargar modelo desde URL (?model=uuid)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modelId = params.get("model");
    if (!modelId) return;
    const load = async () => {
      try {
        const { data, error } = await supabase.storage.from(IFC_BUCKET).download(`${modelId}.ifc`);
        if (error || !data) return;
        const file = new File([data], `${modelId}.ifc`, { type: "application/octet-stream" });
        currentFileRef.current = file;
        loadIfc(file);
      } catch { /* ignorar */ }
    };
    // Esperar a que el visor esté listo
    const interval = setInterval(() => {
      if (readyRef.current) { clearInterval(interval); load(); }
    }, 200);
    return () => clearInterval(interval);
  }, [loadIfc]);

  // Escape cancela la medición
  useEffect(() => {
    if (!measureMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearMeasure();
        measureModeRef.current = false;
        setMeasureMode(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [measureMode, clearMeasure]);

  const hasOverrides = hiddenItems.length > 0 || coloredCount > 0;

  // Iconos esquemáticos del ratón para la guía de navegación
  const MouseLeftDrag = () => (
    <svg width="18" height="26" viewBox="0 0 18 26" fill="none" className="text-white">
      <rect x="1" y="5" width="16" height="19" rx="6" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45"/>
      <line x1="9" y1="5" x2="9" y2="15" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3"/>
      <rect x="1.6" y="5.6" width="6.8" height="9" rx="4" fill="currentColor" fillOpacity="0.75"/>
      <rect x="7.5" y="8" width="3" height="5" rx="1.5" fill="currentColor" fillOpacity="0.25"/>
      <path d="M4 0 L4 3 M4 3 L2.5 1.5 M4 3 L5.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
    </svg>
  );

  const MouseRightDrag = () => (
    <svg width="18" height="26" viewBox="0 0 18 26" fill="none" className="text-white">
      <rect x="1" y="5" width="16" height="19" rx="6" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45"/>
      <line x1="9" y1="5" x2="9" y2="15" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3"/>
      <rect x="9.6" y="5.6" width="6.8" height="9" rx="4" fill="currentColor" fillOpacity="0.75"/>
      <rect x="7.5" y="8" width="3" height="5" rx="1.5" fill="currentColor" fillOpacity="0.25"/>
      <path d="M14 0 L14 3 M14 3 L12.5 1.5 M14 3 L15.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
    </svg>
  );

  const MouseWheel = () => (
    <svg width="18" height="26" viewBox="0 0 18 26" fill="none" className="text-white">
      <rect x="1" y="5" width="16" height="19" rx="6" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45"/>
      <line x1="9" y1="5" x2="9" y2="15" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3"/>
      <rect x="7.5" y="7.5" width="3" height="6" rx="1.5" fill="currentColor" fillOpacity="0.85"/>
      <path d="M9 1 L9 4 M9 1 L7.5 2.5 M9 1 L10.5 2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
    </svg>
  );

  const MouseLeftClick = () => (
    <svg width="18" height="26" viewBox="0 0 18 26" fill="none" className="text-white">
      <rect x="1" y="5" width="16" height="19" rx="6" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45"/>
      <line x1="9" y1="5" x2="9" y2="15" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3"/>
      <rect x="1.6" y="5.6" width="6.8" height="9" rx="4" fill="currentColor" fillOpacity="0.75"/>
      <rect x="7.5" y="8" width="3" height="5" rx="1.5" fill="currentColor" fillOpacity="0.25"/>
    </svg>
  );

  const MouseRightClick = () => (
    <svg width="18" height="26" viewBox="0 0 18 26" fill="none" className="text-white">
      <rect x="1" y="5" width="16" height="19" rx="6" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45"/>
      <line x1="9" y1="5" x2="9" y2="15" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3"/>
      <rect x="9.6" y="5.6" width="6.8" height="9" rx="4" fill="currentColor" fillOpacity="0.75"/>
      <rect x="7.5" y="8" width="3" height="5" rx="1.5" fill="currentColor" fillOpacity="0.25"/>
    </svg>
  );

  const filteredProps = panelFilter.trim()
    ? (panel?.properties ?? []).filter(
        (p) =>
          p.key.toLowerCase().includes(panelFilter.toLowerCase()) ||
          p.value.toLowerCase().includes(panelFilter.toLowerCase())
      )
    : (panel?.properties ?? []);

  return (
    <div className="flex flex-1 min-h-0 w-full">

      {/* Panel izquierdo — solo visible en md+ */}
      <div className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col overflow-hidden shrink-0">
        {/* Cabecera + botón IFC */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Visor BIM</p>
          <label className="block w-full cursor-pointer">
            <input type="file" accept=".ifc" className="hidden" onChange={handleFileInput} />
            <div className="w-full px-3 py-2 bg-[#0066cc] text-white text-xs font-medium rounded-lg text-center hover:bg-[#004d99] transition-colors select-none">
              Abrir archivo IFC
            </div>
          </label>
          {hasModel && (
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={handleShare}
                disabled={shareState === "uploading"}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors select-none ${
                  shareState === "ready"
                    ? "border-[#0066cc] bg-blue-50 text-[#0066cc]"
                    : shareState === "error"
                    ? "border-red-300 text-red-500 bg-red-50"
                    : "border-[#0066cc] text-[#0066cc] hover:bg-blue-50"
                }`}
              >
                {shareState === "uploading" ? (
                  <><Loader2 size={12} className="animate-spin" /> Subiendo...</>
                ) : shareState === "error" ? (
                  <>Error</>
                ) : (
                  <><Share2 size={12} /> {shareState === "ready" ? "Cerrar" : "Compartir"}</>
                )}
              </button>
              <button
                onClick={handleScreenshot}
                title="Capturar pantalla"
                className="flex items-center justify-center px-2.5 py-2 text-xs font-medium rounded-lg border border-[#0066cc] text-[#0066cc] hover:bg-blue-50 transition-colors select-none"
              >
                <Camera size={12} />
              </button>
              <button
                onClick={() => {
                  const next = !measureModeRef.current;
                  measureModeRef.current = next;
                  setMeasureMode(next);
                  if (!next) clearMeasure();
                  else { setMeasureStep(0); setMeasureDistance(null); }
                }}
                title={measureMode ? "Salir de medición" : "Medir distancia"}
                className={`flex items-center justify-center px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors select-none ${
                  measureMode
                    ? "border-[#0066cc] bg-[#0066cc] text-white"
                    : "border-[#0066cc] text-[#0066cc] hover:bg-blue-50"
                }`}
              >
                <Ruler size={12} />
              </button>
            </div>
          )}

          {/* Panel de compartir */}
          {shareState === "ready" && shareLink && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              {/* Link copiable */}
              <div>
                <p className="text-[10px] text-gray-400 mb-1">Link del modelo</p>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-[#0066cc] transition-colors group"
                >
                  <span className="flex-1 text-[10px] text-gray-500 truncate text-left font-mono">
                    {shareLink.replace("https://", "")}
                  </span>
                  {shareLinkCopied ? <Check size={11} className="text-green-500 shrink-0" /> : <Copy size={11} className="text-gray-400 shrink-0 group-hover:text-[#0066cc]" />}
                </button>
              </div>

              {/* Enviar por email */}
              <div>
                <p className="text-[10px] text-gray-400 mb-1">Enviar por email</p>
                <input
                  type="email"
                  placeholder="destinatario@email.com"
                  value={shareEmail}
                  onChange={(e) => { setShareEmail(e.target.value); setEmailState("idle"); }}
                  className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-[#0066cc] bg-white"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={!shareEmail || emailState === "sending"}
                  className={`mt-1.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                    emailState === "sent"
                      ? "bg-green-500 text-white"
                      : emailState === "error"
                      ? "bg-red-500 text-white"
                      : "bg-[#0066cc] text-white hover:bg-[#004d99] disabled:opacity-40"
                  }`}
                >
                  {emailState === "sending" ? <><Loader2 size={11} className="animate-spin" /> Enviando...</> :
                   emailState === "sent"    ? <><Check size={11} /> ¡Enviado!</> :
                   emailState === "error"   ? <>Error al enviar</> :
                                             <>Enviar</>}
                </button>
              </div>
            </div>
          )}
          {error && <p className="mt-1 text-[11px] text-red-500 leading-snug">{error}</p>}
        </div>

        {/* Overrides (ocultos / coloreados) */}
        {hasOverrides && (
          <div className="px-4 py-2 flex flex-col gap-1 shrink-0 border-b border-gray-100">
            {hiddenItems.length > 0 && (
              <p className="text-[11px] text-gray-400">
                {hiddenItems.length} oculto{hiddenItems.length > 1 ? "s" : ""}
              </p>
            )}
            {coloredCount > 0 && (
              <p className="text-[11px] text-gray-400">
                {coloredCount} coloreado{coloredCount > 1 ? "s" : ""}
              </p>
            )}
            <button
              onClick={restoreAll}
              className="w-full px-3 py-1.5 text-[11px] font-medium text-[#0066cc] border border-[#0066cc] rounded-lg hover:bg-blue-50 transition-colors"
            >
              Restaurar todo
            </button>
          </div>
        )}

        {/* Tabs — solo cuando hay modelo */}
        {hasModel && (
          <div className="flex border-b border-gray-100 shrink-0">
            {(["tree", "cats", "section"] as const).map((tab) => {
              const labels = { tree: "Árbol", cats: "Categ.", section: "Sección" };
              return (
                <button
                  key={tab}
                  onClick={() => setLeftTab(tab)}
                  className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                    leftTab === tab
                      ? "text-[#0066cc] border-b-2 border-[#0066cc] -mb-px bg-white"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab: Árbol */}
        {hasModel && leftTab === "tree" && (
          modelTree.length > 0 ? (
            <div className="flex-1 overflow-y-auto px-2 py-2">
              <ModelTree
                nodes={modelTree}
                selectedLocalId={treeSelectedId}
                onSelect={handleTreeSelect}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center px-4">
              <p className="text-[11px] text-gray-300 text-center">Cargando árbol…</p>
            </div>
          )
        )}

        {/* Tab: Categorías */}
        {hasModel && leftTab === "cats" && (
          <div className="flex-1 overflow-y-auto py-2">
            {categories.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-4 py-8">
                <p className="text-[11px] text-gray-300 text-center">Sin categorías disponibles</p>
              </div>
            ) : (
              <div className="space-y-0.5 px-2">
                {categories.map(({ cat, label, visible, count }) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(e) => handleToggleCategory(cat, e.target.checked)}
                      className="shrink-0 w-3 h-3"
                      style={{ accentColor: "#0066cc" }}
                    />
                    <span className={`text-[11px] flex-1 truncate ${visible ? "text-gray-700" : "text-gray-400 line-through"}`}>
                      {label}
                    </span>
                    <span className="text-[9px] text-gray-300 shrink-0">{count}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Sección */}
        {hasModel && leftTab === "section" && (
          <div className="flex-1 overflow-y-auto py-3 px-4">
            <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sectionBoxActive}
                onChange={(e) => {
                  const active = e.target.checked;
                  setSectionBoxActive(active);
                  if (!active) { setSectionBoxVisible(true); setBoxRotY(0); boxRotQRef.current = new THREE.Quaternion(); }
                  sectionBoxEnabledRef.current = active;
                  if (sectionBoxGroupRef.current) sectionBoxGroupRef.current.visible = active;
                  const nx = { ...sectionX, enabled: active };
                  const ny = { ...sectionY, enabled: active };
                  const nz = { ...sectionZ, enabled: active };
                  setSectionX(nx); setSectionY(ny); setSectionZ(nz);
                  sectionRef.current = { x: nx, y: ny, z: nz };
                  applyClippingPlanes();
                }}
                className="shrink-0 w-3.5 h-3.5"
                style={{ accentColor: "#0066cc" }}
              />
              <span className="text-[11px] font-semibold text-gray-700">Section Box</span>
            </label>

            {sectionBoxActive && (
              <>
                <button
                  onClick={() => {
                    const next = !sectionBoxVisible;
                    setSectionBoxVisible(next);
                    if (sectionBoxGroupRef.current) sectionBoxGroupRef.current.visible = next;
                  }}
                  className="w-full mb-3 px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sectionBoxVisible ? "Ocultar caja" : "Mostrar caja"}
                </button>

                {/* Rotación */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-gray-600">Rotación</span>
                    <input
                      type="number"
                      min={-180}
                      max={180}
                      step={1}
                      value={boxRotY}
                      onChange={(e) => {
                        const deg = Math.max(-180, Math.min(180, Number(e.target.value) || 0));
                        setBoxRotY(deg);
                        boxRotQRef.current.setFromEuler(new THREE.Euler(0, (deg * Math.PI) / 180, 0));
                        updateSectionBox();
                        applyClippingPlanes();
                      }}
                      className="w-14 text-right text-[10px] text-gray-600 border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-[#0066cc]"
                    />
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={boxRotY}
                    onChange={(e) => {
                      const deg = Number(e.target.value);
                      setBoxRotY(deg);
                      boxRotQRef.current.setFromEuler(new THREE.Euler(0, (deg * Math.PI) / 180, 0));
                      updateSectionBox();
                      applyClippingPlanes();
                    }}
                    className="w-full cursor-pointer"
                    style={{ accentColor: "#0066cc" }}
                  />
                </div>

                <p className="text-[9px] text-gray-400 mb-3 leading-relaxed">
                  Arrastra las caras de la caja en el visor para recortar el modelo.
                </p>
                <button
                  onClick={() => {
                    const nx = { ...sectionX, enabled: true, minVal: sectionX.bboxMin, maxVal: sectionX.bboxMax };
                    const ny = { ...sectionY, enabled: true, minVal: sectionY.bboxMin, maxVal: sectionY.bboxMax };
                    const nz = { ...sectionZ, enabled: true, minVal: sectionZ.bboxMin, maxVal: sectionZ.bboxMax };
                    setSectionX(nx); setSectionY(ny); setSectionZ(nz);
                    sectionRef.current = { x: nx, y: ny, z: nz };
                    setBoxRotY(0);
                    boxRotQRef.current = new THREE.Quaternion();
                    setSectionBoxVisible(true);
                    sectionBoxVisibleRef.current = true;
                    if (sectionBoxGroupRef.current) sectionBoxGroupRef.current.visible = true;
                    updateSectionBox();
                    applyClippingPlanes();
                  }}
                  className="w-full mb-2 px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Restablecer caja
                </button>
              </>
            )}

            {/* Transparencia */}
            {ghostMode !== null && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Transparencia</p>
                <p className="text-[9px] text-gray-400 mb-3">
                  {ghostMode === "selected" ? "Selección" : "Resto"} · {ghostCount} elemento{ghostCount !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-gray-500 shrink-0">Opacidad</span>
                  <input
                    type="range"
                    min={5}
                    max={70}
                    step={5}
                    value={Math.round(ghostOpacity * 100)}
                    onChange={(e) => setGhostOpacity(Number(e.target.value) / 100)}
                    onPointerUp={async () => {
                      if (!componentsRef.current) return;
                      const fragments = componentsRef.current.get(OBC.FragmentsManager);
                      await fragments.resetHighlight();
                      await reapplyColors(fragments);
                      await reapplyGhost(fragments);
                      await reapplySelection(fragments);
                    }}
                    className="flex-1 accent-[#0066cc] cursor-pointer"
                    style={{ accentColor: "#0066cc" }}
                  />
                  <span className="text-[10px] text-gray-500 w-7 text-right">{Math.round(ghostOpacity * 100)}%</span>
                </div>
              </div>
            )}

            {/* Restaurar todo — visible si hay sección o transparencia activa */}
            {(sectionBoxActive || ghostMode !== null) && (
              <button
                onClick={restoreAll}
                className="w-full mt-3 px-3 py-1.5 text-[11px] font-medium text-[#0066cc] border border-[#0066cc] rounded-lg hover:bg-blue-50 transition-colors"
              >
                Restaurar todo
              </button>
            )}
          </div>
        )}

        {/* Espaciador cuando no hay modelo */}
        {!hasModel && <div className="flex-1" />}
      </div>

      {/* Canvas 3D */}
      <div
        className="relative flex-1 min-h-0 overflow-hidden"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* Cursor de snap (vértice / arista) */}
        <div
          ref={measureSnapDivRef}
          style={{ display: "none", position: "absolute", pointerEvents: "none", transform: "translate(-50%, -50%)" }}
          className="z-20 w-3 h-3 rounded-full border-2 border-[#00ccff] bg-[#00ccff]/30 shadow"
        />

        {/* Los labels de medición se crean dinámicamente vía DOM en completedMeasurementsRef */}

        {/* Banner de instrucción cuando el modo medición está activo */}
        {measureMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#0066cc] text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none select-none">
            <Ruler size={13} />
            {measureStep === 0 && (
              measureCount > 0
                ? `${measureCount} medición${measureCount > 1 ? "es" : ""} · Clic para nueva · Esc para salir`
                : "Haz clic en el primer punto · Esc para salir"
            )}
            {measureStep === 1 && "Haz clic en el segundo punto · Esc para salir"}
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/10 border-4 border-dashed border-[#0066cc] flex items-center justify-center z-10 pointer-events-none">
            <p className="text-[#0066cc] text-xl font-semibold bg-white/80 px-6 py-3 rounded-xl">
              Suelta el archivo IFC aquí
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-600 text-sm font-medium">Procesando modelo IFC…</p>
            <p className="text-gray-400 text-xs mt-1">Los modelos grandes pueden tardar unos segundos</p>
          </div>
        )}

        {/* Guía de navegación flotante inferior */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-stretch divide-x divide-white/10 bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden pointer-events-none select-none">
          <div className="flex flex-col items-center gap-1 px-3 py-2">
            <MouseLeftDrag />
            <span className="text-white/60 text-[9px] leading-none">Rotar</span>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1 px-3 py-2">
            <MouseRightDrag />
            <span className="text-white/60 text-[9px] leading-none">Mover</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-3 py-2">
            <MouseWheel />
            <span className="text-white/60 text-[9px] leading-none">Zoom</span>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1 px-3 py-2">
            <MouseLeftClick />
            <span className="text-white/60 text-[9px] leading-none">Propiedades</span>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1 px-3 py-2">
            <MouseRightClick />
            <span className="text-white/60 text-[9px] leading-none">Menú</span>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1 px-3 py-2">
            <div className="flex items-end gap-0.5">
              <span className="text-white/55 text-[7px] font-mono border border-white/25 rounded px-[3px] py-[1px] leading-none mb-0.5">Ctrl</span>
              <MouseLeftClick />
            </div>
            <span className="text-white/60 text-[9px] leading-none">Multi</span>
          </div>
        </div>

        {!hasModel && !loading && (
          <div className="fixed md:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-center space-y-3 w-64 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            <p className="text-gray-400 text-sm">Carga un archivo IFC para empezar</p>
            <p className="text-gray-300 text-xs hidden md:block">Arrastra al canvas o usa el botón del panel izquierdo</p>
            <p className="text-gray-300 text-xs md:hidden">Usa el botón &ldquo;Abrir IFC&rdquo; de abajo</p>
          </div>
        )}
      </div>

      {/* Panel derecho — Propiedades — solo visible en md+ */}
      <div className="hidden md:flex w-64 bg-white border-l border-gray-200 flex-col overflow-hidden shrink-0">
        {/* Cabecera */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Propiedades</p>
            {panel && (
              <>
                <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{panel.name}</p>
                {panel.type && <p className="text-[10px] text-[#0066cc] font-medium">{panel.type}</p>}
              </>
            )}
          </div>
          {panel && (
            <button
              onClick={closePanel}
              className="shrink-0 mt-0.5 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!panel ? (
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-xs text-gray-300 text-center leading-relaxed">
              Haz clic en un elemento para ver sus propiedades
            </p>
          </div>
        ) : (
          <>
            {/* Filtro */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <Search size={12} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Filtrar parámetros…"
                  value={panelFilter}
                  onChange={(e) => setPanelFilter(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400"
                />
                {panelFilter && (
                  <button onClick={() => setPanelFilter("")} className="text-gray-400 hover:text-gray-600">
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>

            {/* Lista de propiedades */}
            <div className="overflow-y-auto flex-1 p-2">
              {filteredProps.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  {panelFilter ? "Sin resultados" : "Sin propiedades"}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {filteredProps.map(({ key, value, allValues }) => (
                    <div
                      key={key}
                      className="group rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 leading-none mb-0.5 flex items-center gap-1.5">
                            {key}
                            {allValues && (
                              <span className="inline-flex items-center px-1 py-0 rounded bg-amber-50 text-amber-500 text-[8px] font-semibold border border-amber-100">
                                {allValues.length} valores
                              </span>
                            )}
                          </p>
                          {allValues ? (
                            <div className="space-y-0.5">
                              {allValues.map((v, i) => (
                                <p key={i} className="text-xs text-gray-700 font-mono break-all leading-snug">{v}</p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-800 font-mono break-all leading-snug">{value}</p>
                          )}
                        </div>
                        <button
                          onClick={() => copyValue(allValues ? allValues.join(", ") : value, key)}
                          className="shrink-0 mt-0.5 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all"
                          title="Copiar valor"
                        >
                          {copied === key ? (
                            <Check size={11} className="text-green-500" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer contador */}
            <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400">
                {filteredProps.length} de {panel.properties.length} parámetros
              </p>
            </div>
          </>
        )}
      </div>

      {/* Botón flotante de carga — solo móvil */}
      <label className="md:hidden fixed bottom-5 right-5 z-40 cursor-pointer">
        <input type="file" accept=".ifc" className="hidden" onChange={handleFileInput} />
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0066cc] text-white text-sm font-medium rounded-full shadow-lg active:bg-[#004d99] select-none">
          <FolderOpen size={16} />
          Abrir IFC
        </div>
      </label>

      {/* Menú contextual clic derecho */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          elementName={contextMenu.name}
          onHide={() => handleHide(contextMenu.modelId, contextMenu.localId)}
          onColor={(hex) => handleColor(contextMenu.modelId, contextMenu.localId, hex)}
          onGhostSelected={() => handleGhostSelected(contextMenu.modelId, contextMenu.localId)}
          onGhostOthers={() => handleGhostOthers(contextMenu.modelId, contextMenu.localId)}
          onClose={() => setContextMenu(null)}
        />
      )}

    </div>
  );
}
