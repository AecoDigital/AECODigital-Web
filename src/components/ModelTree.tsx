"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Layers, Box } from "lucide-react";

export interface TreeNode {
  key: string;
  localId: number | null; // null = nodo agrupador (tipo)
  name: string;
  type: string;
  cat?: string; // categoría IFC original (solo en nodos agrupadores de elementos)
  children: TreeNode[];
}

interface Props {
  nodes: TreeNode[];
  selectedLocalId: number | null;
  onSelect: (localId: number) => void;
}

function TreeItem({
  node,
  depth,
  selectedLocalId,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedLocalId: number | null;
  onSelect: (localId: number) => void;
}) {
  const isGroup = node.localId === null;
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = !isGroup && node.localId === selectedLocalId;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-[3px] pr-2 rounded-md cursor-pointer transition-colors select-none
          ${isSelected
            ? "bg-[#00E5A3]/10 text-[#00E5A3]"
            : isGroup
              ? "text-gray-500 hover:bg-gray-50"
              : "text-gray-700 hover:bg-gray-50"}`}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
        onClick={() => {
          if (hasChildren) setOpen((v) => !v);
          if (!isGroup && node.localId !== null) onSelect(node.localId);
        }}
      >
        {/* Icono expand/collapse o leaf */}
        <span className="shrink-0 w-3 flex items-center justify-center">
          {hasChildren ? (
            open
              ? <ChevronDown size={10} className="text-gray-400" />
              : <ChevronRight size={10} className="text-gray-400" />
          ) : (
            <Box size={8} className="text-gray-300" />
          )}
        </span>

        {/* Nombre */}
        <span className={`text-[11px] truncate flex-1 leading-snug ${isSelected ? "font-semibold" : isGroup ? "font-medium" : ""}`}>
          {node.name}
        </span>

        {/* Etiqueta de tipo (solo en nodos hoja) */}
        {!isGroup && node.type && (
          <span className="text-[9px] text-gray-300 shrink-0 ml-1 hidden group-hover:inline">
            {node.type}
          </span>
        )}

        {/* Icono de grupo */}
        {isGroup && <Layers size={9} className="text-gray-300 shrink-0" />}
      </div>

      {open && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.key}
              node={child}
              depth={depth + 1}
              selectedLocalId={selectedLocalId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModelTree({ nodes, selectedLocalId, onSelect }: Props) {
  if (nodes.length === 0) return null;
  return (
    <div className="py-1">
      {nodes.map((node) => (
        <TreeItem
          key={node.key}
          node={node}
          depth={0}
          selectedLocalId={selectedLocalId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
