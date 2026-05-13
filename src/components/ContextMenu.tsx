"use client";

import { useEffect, useRef, useState } from "react";
import { EyeOff, Palette, X } from "lucide-react";

interface Props {
  x: number;
  y: number;
  elementName: string;
  onHide: () => void;
  onColor: (color: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#0066cc", "#8b5cf6",
  "#ec4899", "#ffffff",
];

export default function ContextMenu({ x, y, elementName, onHide, onColor, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [showPicker, setShowPicker] = useState(false);

  // Ajustar para que no salga de pantalla
  useEffect(() => {
    if (!ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    setPos({
      x: Math.min(x, window.innerWidth - width - 8),
      y: Math.min(y, window.innerHeight - height - 8),
    });
  }, [x, y, showPicker]);

  // Cerrar al hacer clic fuera o pulsar Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-52"
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-700 truncate pr-2">{elementName}</p>
        <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-600">
          <X size={13} />
        </button>
      </div>

      {/* Acciones */}
      <div className="py-1">
        <button
          onClick={() => { onHide(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <EyeOff size={14} className="text-gray-400" />
          Ocultar elemento
        </button>

        <button
          onClick={() => setShowPicker((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Palette size={14} className="text-gray-400" />
          Colorear elemento
        </button>

        {/* Selector de color */}
        {showPicker && (
          <div className="px-3 pb-2.5 pt-1 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Elige un color</p>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { onColor(c); onClose(); }}
                  style={{ backgroundColor: c }}
                  className="w-8 h-8 rounded-lg border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                  title={c}
                />
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-500">Personalizado:</span>
              <input
                type="color"
                defaultValue="#0066cc"
                onChange={(e) => { onColor(e.target.value); onClose(); }}
                className="w-8 h-7 rounded border border-gray-200 cursor-pointer p-0.5"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
