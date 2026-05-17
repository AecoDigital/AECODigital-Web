"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// THREE.BoxGeometry materialIndex order: +x, -x, +y, -y, +z, -z
const FACE_DATA = [
  { label: "Dcha.",  worldDir: new THREE.Vector3( 1,  0,  0) },
  { label: "Izda.",  worldDir: new THREE.Vector3(-1,  0,  0) },
  { label: "Planta", worldDir: new THREE.Vector3( 0,  1,  0) },
  { label: "Suelo",  worldDir: new THREE.Vector3( 0, -1,  0) },
  { label: "Frente", worldDir: new THREE.Vector3( 0,  0,  1) },
  { label: "Fondo",  worldDir: new THREE.Vector3( 0,  0, -1) },
];

function makeTexture(label: string, hovered: boolean): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = hovered ? "#00E5A3" : "#1a3a5c";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = hovered ? "rgba(120,180,255,0.8)" : "rgba(255,255,255,0.2)";
  ctx.lineWidth = 5;
  ctx.strokeRect(3, 3, 122, 122);
  ctx.fillStyle = "#ffffff";
  const fontSize = label.length > 5 ? 20 : 24;
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 64, 64);
  return new THREE.CanvasTexture(c);
}

interface ViewCubeProps {
  getCameraQuaternion: () => THREE.Quaternion | null;
  onFaceClick: (worldDir: THREE.Vector3) => void;
}

export default function ViewCube({ getCameraQuaternion, onFaceClick }: ViewCubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use refs to always call the latest callbacks without re-creating the Three.js scene
  const getCamQRef = useRef(getCameraQuaternion);
  getCamQRef.current = getCameraQuaternion;
  const onFaceClickRef = useRef(onFaceClick);
  onFaceClickRef.current = onFaceClick;

  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    camera: THREE.OrthographicCamera;
    scene: THREE.Scene;
    cube: THREE.Mesh;
    baseMats: THREE.MeshBasicMaterial[];
    hovMats: THREE.MeshBasicMaterial[];
    raycaster: THREE.Raycaster;
    hovIdx: number | null;
    raf: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const SIZE = 100;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SIZE, SIZE);

    const scene = new THREE.Scene();

    const d = 0.9;
    const camera = new THREE.OrthographicCamera(-d, d, d, -d, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 2));

    const geo = new THREE.BoxGeometry(1.3, 1.3, 1.3);

    const baseMats = FACE_DATA.map(f =>
      new THREE.MeshBasicMaterial({ map: makeTexture(f.label, false) })
    );
    const hovMats = FACE_DATA.map(f =>
      new THREE.MeshBasicMaterial({ map: makeTexture(f.label, true) })
    );

    const cube = new THREE.Mesh(geo, baseMats as THREE.Material[]);
    scene.add(cube);

    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
    );
    cube.add(line);

    const raycaster = new THREE.Raycaster();
    let hovIdx: number | null = null;
    let raf = 0;

    function loop() {
      raf = requestAnimationFrame(loop);
      const q = getCamQRef.current();
      if (q) {
        cube.quaternion.copy(q);
        cube.quaternion.invert();
      }
      renderer.render(scene, camera);
    }
    loop();

    stateRef.current = { renderer, camera, scene, cube, baseMats, hovMats, raycaster, hovIdx, raf };

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      geo.dispose();
      edges.dispose();
      baseMats.forEach(m => { m.map?.dispose(); m.dispose(); });
      hovMats.forEach(m => { m.map?.dispose(); m.dispose(); });
      stateRef.current = null;
    };
  }, []);

  const getNDC = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const st = stateRef.current;
    if (!st) return;
    st.raycaster.setFromCamera(getNDC(e), st.camera);
    const hits = st.raycaster.intersectObject(st.cube);
    const newIdx = hits.length > 0 ? hits[0].face!.materialIndex : null;
    if (newIdx !== st.hovIdx) {
      if (st.hovIdx !== null) {
        (st.cube.material as THREE.Material[])[st.hovIdx] = st.baseMats[st.hovIdx];
      }
      if (newIdx !== null) {
        (st.cube.material as THREE.Material[])[newIdx] = st.hovMats[newIdx];
      }
      st.hovIdx = newIdx;
    }
  };

  const handleMouseLeave = () => {
    const st = stateRef.current;
    if (!st || st.hovIdx === null) return;
    (st.cube.material as THREE.Material[])[st.hovIdx] = st.baseMats[st.hovIdx];
    st.hovIdx = null;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const st = stateRef.current;
    if (!st) return;
    st.raycaster.setFromCamera(getNDC(e), st.camera);
    const hits = st.raycaster.intersectObject(st.cube);
    if (hits.length === 0) return;
    const idx = hits[0].face!.materialIndex;
    onFaceClickRef.current(FACE_DATA[idx].worldDir.clone());
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10 bg-black/20 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        width={100}
        height={100}
        className="block cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </div>
  );
}
