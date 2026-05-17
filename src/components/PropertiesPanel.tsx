"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Copy, Check, X, GripVertical, Search } from "lucide-react";

interface Property {
  key: string;
  value: string;
  allValues?: string[]; // distintos valores en selección múltiple
}

interface Props {
  elementName: string;
  elementType: string | null;
  properties: Property[];
  initialX: number;
  initialY: number;
  onClose: () => void;
}

export default function PropertiesPanel({
  elementName,
  elementType,
  properties,
  initialX,
  initialY,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, ox: 0, oy: 0 });
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Ajustar posición inicial para que no salga de la pantalla
  useEffect(() => {
    if (!panelRef.current) return;
    const { width, height } = panelRef.current.getBoundingClientRect();
    setPos((p) => ({
      x: Math.min(p.x, window.innerWidth - width - 16),
      y: Math.min(p.y, window.innerHeight - height - 16),
    }));
  }, []);

  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragState.current = {
      active: true,
      ox: e.clientX - rect.left,
      oy: e.clientY - rect.top,
    };
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current.active) return;
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragState.current.ox, window.innerWidth - (panelRef.current?.offsetWidth ?? 320))),
        y: Math.max(0, Math.min(e.clientY - dragState.current.oy, window.innerHeight - (panelRef.current?.offsetHeight ?? 400))),
      });
    };
    const onUp = () => { dragState.current.active = false; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  const copyValue = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const filtered = filter.trim()
    ? properties.filter(
        (p) =>
          p.key.toLowerCase().includes(filter.toLowerCase()) ||
          p.value.toLowerCase().includes(filter.toLowerCase())
      )
    : properties;

  return (
    <div
      ref={panelRef}
      style={{ left: pos.x, top: pos.y, width: 320 }}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden select-none"
    >
      {/* Cabecera arrastrable */}
      <div
        onMouseDown={onHeaderMouseDown}
        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} className="text-gray-300 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{elementName}</p>
          {elementType && (
            <p className="text-[10px] text-[#00E5A3] font-medium">{elementType}</p>
          )}
        </div>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="shrink-0 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Filtro */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
          <Search size={12} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Filtrar parámetros…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400"
          />
          {filter && (
            <button onClick={() => setFilter("")} className="text-gray-400 hover:text-gray-600">
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Lista de propiedades */}
      <div className="overflow-y-auto max-h-72 p-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            {filter ? "Sin resultados para ese filtro" : "Sin propiedades"}
          </p>
        ) : (
          <div className="space-y-0.5">
            {filtered.map(({ key, value, allValues }) => (
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
                          <p key={i} className="text-xs text-gray-700 font-mono break-all leading-snug">
                            {v}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-800 font-mono break-all leading-snug">{value}</p>
                    )}
                  </div>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
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
          {filtered.length} de {properties.length} parámetros
        </p>
      </div>
    </div>
  );
}
