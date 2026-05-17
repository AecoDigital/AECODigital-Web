"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { FolderOpen, Search, Copy, Check, X, Share2, Loader2 } from "lucide-react";
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
    new THREE.LineBasicMaterial({ color: 0x0066cc, depthTest: false })
  );
  wire.renderOrder = 999;
  group.add(wire);

  // Caras como BoxGeometry finas (mucho más fiables para raycasting que PlaneGeometry)
  // Cada caja cubre la cara completa del section box con grosor mínimo en la dirección normal
  // El grosor real en escena se aplica vía scale: la dim en la dirección del eje = ~0.05 * tamaño
  // Aquí creamos cajas 1×1×1; el scale se aplica en updateSectionBox/updateBoxFromRef
  // X faces: scale.x mínimo, Y faces: scale.y mínimo, Z faces: scale.z mínimo
  const FACE_COLORS = [0xef4444, 0xef4444, 0x22c55e, 0x22c55e, 0x3b82f6, 0x3b82f6];

  const handles: THREE.Mesh[] = [];
  for (const color of FACE_COLORS) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
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
  const currentModelIdRef = useRef<string | null>(null);

  const sectionRef = useRef<{ x: SectionAxis; y: SectionAxis; z: SectionAxis }>({
    x: { enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 },
    y: { enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 },
    z: { enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 },
  });
  const sectionBoxGroupRef   = useRef<THREE.Group | null>(null);
  const sectionBoxWireRef    = useRef<THREE.LineSegments | null>(null);
  const sectionBoxHandlesRef = useRef<THREE.Mesh[]>([]);
  const sectionBoxEnabledRef = useRef(false);
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
  const [error, setError] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<"tree" | "cats" | "section">("tree");
  const [categories, setCategories] = useState<CatItem[]>([]);
  const [sectionBoxActive, setSectionBoxActive] = useState(false);
  const [sectionX, setSectionX] = useState<SectionAxis>({ enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 });
  const [sectionY, setSectionY] = useState<SectionAxis>({ enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 });
  const [sectionZ, setSectionZ] = useState<SectionAxis>({ enabled: false, minVal: 0, maxVal: 0, bboxMin: 0, bboxMax: 0 });

  // Sincronizar ref con estado React (accesible en closures de useEffect)
  useEffect(() => {
    sectionRef.current = { x: sectionX, y: sectionY, z: sectionZ };
    sectionBoxEnabledRef.current = sectionBoxActive;
  }, [sectionX, sectionY, sectionZ, sectionBoxActive]);

  const applyClippingPlanes = useCallback(() => {
    const r = worldRef.current?.renderer as any;
    const renderer: THREE.WebGLRenderer | undefined = r?.three;
    if (!renderer) return;
    renderer.localClippingEnabled = true;
    const { x, y, z } = sectionRef.current;
    const planes: THREE.Plane[] = [];
    if (x.enabled) {
      planes.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), -x.minVal));
      planes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), x.maxVal));
    }
    if (y.enabled) {
      planes.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), -y.minVal));
      planes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), y.maxVal));
    }
    if (z.enabled) {
      planes.push(new THREE.Plane(new THREE.Vector3(0, 0, 1), -z.minVal));
      planes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), z.maxVal));
    }
    renderer.clippingPlanes = planes;
  }, []);

  const updateSectionBox = useCallback(() => {
    const { x, y, z } = sectionRef.current;
    const cx = (x.minVal + x.maxVal) / 2;
    const cy = (y.minVal + y.maxVal) / 2;
    const cz = (z.minVal + z.maxVal) / 2;
    const sx = Math.max(x.maxVal - x.minVal, 0.001);
    const sy = Math.max(y.maxVal - y.minVal, 0.001);
    const sz = Math.max(z.maxVal - z.minVal, 0.001);
    const wire = sectionBoxWireRef.current;
    if (wire) { wire.position.set(cx, cy, cz); wire.scale.set(sx, sy, sz); }
    const [xMinH, xMaxH, yMinH, yMaxH, zMinH, zMaxH] = sectionBoxHandlesRef.current;
    // Cajas finas: la dim del eje normal es 0.05*tamaño para ser fácilmente clicables
    const tx = Math.max(sx * 0.05, 0.05);
    const ty = Math.max(sy * 0.05, 0.05);
    const tz = Math.max(sz * 0.05, 0.05);
    // X faces: finas en X, cubre todo Y y Z
    if (xMinH) { xMinH.position.set(x.minVal, cy, cz); xMinH.scale.set(tx, sy, sz); }
    if (xMaxH) { xMaxH.position.set(x.maxVal, cy, cz); xMaxH.scale.set(tx, sy, sz); }
    // Y faces: finas en Y, cubre todo X y Z
    if (yMinH) { yMinH.position.set(cx, y.minVal, cz); yMinH.scale.set(sx, ty, sz); }
    if (yMaxH) { yMaxH.position.set(cx, y.maxVal, cz); yMaxH.scale.set(sx, ty, sz); }
    // Z faces: finas en Z, cubre todo X y Y
    if (zMinH) { zMinH.position.set(cx, cy, z.minVal); zMinH.scale.set(sx, sy, tz); }
    if (zMaxH) { zMaxH.position.set(cx, cy, z.maxVal); zMaxH.scale.set(sx, sy, tz); }
  }, []);

  // Reaplicar colores persistidos tras cualquier resetHighlight
  const reapplyColors = useCallback(async (fragments: OBC.FragmentsManager) => {
    for (const { modelId, localId, hex } of coloredItemsRef.current) {
      await fragments.highlight(
        { color: new THREE.Color(hex), opacity: 1, transparent: false, renderedFaces: FRAGS.RenderedFaces.TWO },
        { [modelId]: new Set([localId]) }
      );
    }
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
      world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
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

      const onMouseUp = async (e: MouseEvent) => {
        if (e.button !== 0) return;
        const dx = Math.abs(e.clientX - mouseDownX);
        const dy = Math.abs(e.clientY - mouseDownY);
        if (dx > 5 || dy > 5) return;

        const isMulti = e.ctrlKey || e.metaKey;
        const result = (await caster.castRay()) as any;

        if (!result || !result.fragments?.modelId) {
          if (!isMulti) {
            selectedItemsRef.current = [];
            await fragments.resetHighlight();
            await reapplyColors(fragments);
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

        // Reset → reaplicar colores persistidos → reaplicar selección completa
        await fragments.resetHighlight();
        await reapplyColors(fragments);
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
        const planes: THREE.Plane[] = [];
        if (x.enabled) {
          planes.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), -x.minVal));
          planes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), x.maxVal));
        }
        if (y.enabled) {
          planes.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), -y.minVal));
          planes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), y.maxVal));
        }
        if (z.enabled) {
          planes.push(new THREE.Plane(new THREE.Vector3(0, 0, 1), -z.minVal));
          planes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), z.maxVal));
        }
        renderer.clippingPlanes = planes;
      };

      const updateBoxFromRef = () => {
        const { x, y, z } = sectionRef.current;
        const cx = (x.minVal + x.maxVal) / 2;
        const cy = (y.minVal + y.maxVal) / 2;
        const cz = (z.minVal + z.maxVal) / 2;
        const sx = Math.max(x.maxVal - x.minVal, 0.001);
        const sy = Math.max(y.maxVal - y.minVal, 0.001);
        const sz = Math.max(z.maxVal - z.minVal, 0.001);
        const wire = sectionBoxWireRef.current;
        if (wire) { wire.position.set(cx, cy, cz); wire.scale.set(sx, sy, sz); }
        const [xMinH, xMaxH, yMinH, yMaxH, zMinH, zMaxH] = sectionBoxHandlesRef.current;
        const tx = Math.max(sx * 0.05, 0.05);
        const ty = Math.max(sy * 0.05, 0.05);
        const tz = Math.max(sz * 0.05, 0.05);
        if (xMinH) { xMinH.position.set(x.minVal, cy, cz); xMinH.scale.set(tx, sy, sz); }
        if (xMaxH) { xMaxH.position.set(x.maxVal, cy, cz); xMaxH.scale.set(tx, sy, sz); }
        if (yMinH) { yMinH.position.set(cx, y.minVal, cz); yMinH.scale.set(sx, ty, sz); }
        if (yMaxH) { yMaxH.position.set(cx, y.maxVal, cz); yMaxH.scale.set(sx, ty, sz); }
        if (zMinH) { zMinH.position.set(cx, cy, z.minVal); zMinH.scale.set(sx, sy, tz); }
        if (zMaxH) { zMaxH.position.set(cx, cy, z.maxVal); zMaxH.scale.set(sx, sy, tz); }
      };

      const getCam = () => {
        const camAny = world.camera as any;
        return (camAny.three ?? camAny.activeCamera ?? camAny.camera) as THREE.Camera | undefined;
      };
      const getCtrl = () => (world.camera as any).controls ?? (world.camera as any).orbitControls ?? null;

      const onSectionPointerDown = (e: PointerEvent) => {
        if (!sectionBoxEnabledRef.current || sectionBoxHandlesRef.current.length === 0) return;
        const cam = getCam();
        if (!cam) return;
        sectionRaycaster.setFromCamera(getNDC(e), cam);
        // Update world matrices before raycasting
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
        const axisDir = axis === "x"
          ? new THREE.Vector3(1, 0, 0)
          : axis === "y" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
        // View-plane: constraint perpendicular to camera → intersección siempre válida
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
          // Proyectar desplazamiento sobre el eje del drag
          const displacement = newHit.clone().sub(drag.startHit).dot(drag.axisDir);
          const raw = drag.startVal + displacement;
          const { axis, dir } = drag;
          const s = sectionRef.current;
          const clamped = Math.max(s[axis].bboxMin, Math.min(s[axis].bboxMax, raw));
          const newAxis: SectionAxis = dir === "min"
            ? { ...s[axis], minVal: Math.min(clamped, s[axis].maxVal - 0.01) }
            : { ...s[axis], maxVal: Math.max(clamped, s[axis].minVal + 0.01) };
          sectionRef.current = { ...s, [axis]: newAxis };
          if (axis === "x") setSectionX(newAxis);
          else if (axis === "y") setSectionY(newAxis);
          else setSectionZ(newAxis);
          updateBoxFromRef();
          applyPlanesFromRef();
          return;
        }

        // ── Hover highlight ──
        if (!sectionBoxEnabledRef.current || sectionBoxHandlesRef.current.length === 0) return;
        const hits = sectionRaycaster.intersectObjects(sectionBoxHandlesRef.current, false);
        const hovIdx = hits.length > 0 ? sectionBoxHandlesRef.current.indexOf(hits[0].object as THREE.Mesh) : -1;
        sectionBoxHandlesRef.current.forEach((h, i) => {
          (h.material as THREE.MeshBasicMaterial).opacity = i === hovIdx ? 0.45 : 0.15;
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
    }

    init();

    return () => {
      disposed = true;
      readyRef.current = false;
      if (componentsRef.current) {
        componentsRef.current.dispose();
        componentsRef.current = null;
        worldRef.current = null;
      }
    };
  }, [reapplyColors, reapplySelection]);

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
          const nx: SectionAxis = { enabled: false, minVal: box.min.x, maxVal: box.max.x, bboxMin: box.min.x, bboxMax: box.max.x };
          const ny: SectionAxis = { enabled: false, minVal: box.min.y, maxVal: box.max.y, bboxMin: box.min.y, bboxMax: box.max.y };
          const nz: SectionAxis = { enabled: false, minVal: box.min.z, maxVal: box.max.z, bboxMin: box.min.z, bboxMax: box.max.z };
          setSectionX(nx); setSectionY(ny); setSectionZ(nz);
          sectionRef.current = { x: nx, y: ny, z: nz };

          // Crear o reinicializar la caja de sección
          if (sectionBoxGroupRef.current) {
            world.scene.three.remove(sectionBoxGroupRef.current);
          }
          const { group, wire, handles } = createSectionBox(world.scene.three);
          sectionBoxGroupRef.current = group;
          sectionBoxWireRef.current  = wire;
          sectionBoxHandlesRef.current = handles;

          // Posicionar la caja en el bbox completo del modelo
          const cx = (box.min.x + box.max.x) / 2;
          const cy = (box.min.y + box.max.y) / 2;
          const cz = (box.min.z + box.max.z) / 2;
          const sx = Math.max(box.max.x - box.min.x, 0.001);
          const sy = Math.max(box.max.y - box.min.y, 0.001);
          const szv = Math.max(box.max.z - box.min.z, 0.001);
          wire.position.set(cx, cy, cz);
          wire.scale.set(sx, sy, szv);
          const [xMinH, xMaxH, yMinH, yMaxH, zMinH, zMaxH] = handles;
          const tx = Math.max(sx * 0.05, 0.05);
          const ty = Math.max(sy * 0.05, 0.05);
          const tz = Math.max(szv * 0.05, 0.05);
          if (xMinH) { xMinH.position.set(box.min.x, cy, cz); xMinH.scale.set(tx, sy, szv); }
          if (xMaxH) { xMaxH.position.set(box.max.x, cy, cz); xMaxH.scale.set(tx, sy, szv); }
          if (yMinH) { yMinH.position.set(cx, box.min.y, cz); yMinH.scale.set(sx, ty, szv); }
          if (yMaxH) { yMaxH.position.set(cx, box.max.y, cz); yMaxH.scale.set(sx, ty, szv); }
          if (zMinH) { zMinH.position.set(cx, cy, box.min.z); zMinH.scale.set(sx, sy, tz); }
          if (zMaxH) { zMaxH.position.set(cx, cy, box.max.z); zMaxH.scale.set(sx, sy, tz); }
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
  }, [reapplyColors]);

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

    // Resetear estado
    coloredItemsRef.current = [];
    selectedItemsRef.current = [];
    setColoredCount(0);
    setHiddenItems([]);
    setPanel(null);
    setContextMenu(null);
  }, [hiddenItems]);

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
  }, [reapplyColors, reapplySelection]);

  const closePanel = useCallback(async () => {
    setPanel(null);
    setPanelFilter("");
    setTreeSelectedId(null);
    selectedItemsRef.current = [];
    if (componentsRef.current) {
      const fragments = componentsRef.current.get(OBC.FragmentsManager);
      await fragments.resetHighlight();
      await reapplyColors(fragments);
    }
  }, [reapplyColors]);

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
            <button
              onClick={handleShare}
              disabled={shareState === "uploading"}
              className={`mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors select-none ${
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
                <>Error al compartir</>
              ) : (
                <><Share2 size={12} /> {shareState === "ready" ? "Cerrar" : "Compartir"}</>
              )}
            </button>
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
                <p className="text-[9px] text-gray-400 mb-4 leading-relaxed">
                  Arrastra las caras de la caja en el visor para recortar el modelo.
                </p>
                <button
                  onClick={() => {
                    const nx = { ...sectionX, enabled: false, minVal: sectionX.bboxMin, maxVal: sectionX.bboxMax };
                    const ny = { ...sectionY, enabled: false, minVal: sectionY.bboxMin, maxVal: sectionY.bboxMax };
                    const nz = { ...sectionZ, enabled: false, minVal: sectionZ.bboxMin, maxVal: sectionZ.bboxMax };
                    setSectionX(nx); setSectionY(ny); setSectionZ(nz);
                    setSectionBoxActive(false);
                    sectionBoxEnabledRef.current = false;
                    if (sectionBoxGroupRef.current) sectionBoxGroupRef.current.visible = false;
                    sectionRef.current = { x: nx, y: ny, z: nz };
                    const r = worldRef.current?.renderer as any;
                    if (r?.three) r.three.clippingPlanes = [];
                  }}
                  className="w-full px-3 py-1.5 text-[11px] font-medium text-[#0066cc] border border-[#0066cc] rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Quitar sección
                </button>
              </>
            )}
          </div>
        )}

        {/* Espaciador cuando no hay modelo */}
        {!hasModel && <div className="flex-1" />}
      </div>

      {/* Canvas 3D */}
      <div
        className="relative flex-1 min-h-0"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div ref={containerRef} className="w-full h-full" />

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
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
