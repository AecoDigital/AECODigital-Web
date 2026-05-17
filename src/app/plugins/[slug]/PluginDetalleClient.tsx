"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Download, Calendar, Tag } from "lucide-react";
import { useLang } from "@/lib/i18n";

const CATEGORIA_COLORS: Record<string, string> = {
  Dynamo: "#f59e0b",
  Python: "#3b82f6",
  Revit: "#8b5cf6",
  Excel: "#10b981",
  Grasshopper: "#ef4444",
};

const TIPO_ICONS: Record<string, string> = {
  github: "GitHub",
  zip: "ZIP",
  dynamo: ".dyn",
  python: ".py",
};

type Plugin = {
  nombre: string;
  descripcion: string;
  categoria: string;
  version: string;
  fecha: string;
  tags: string[];
  manual: string;
  descargas: { label: string; url: string; tipo: string }[];
  ejemplos: { titulo: string; imagen?: string }[];
};

export default function PluginDetalleClient({ plugin }: { plugin: Plugin }) {
  const { t } = useLang();
  const pd = t.pluginDetail;
  const catColor = CATEGORIA_COLORS[plugin.categoria] ?? "#00E5A3";

  return (
    <main className="pt-20 sm:pt-28 pb-24 px-4 sm:px-6 min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#00E5A3] transition-colors">{pd.breadcrumbHome}</Link>
          <span>/</span>
          <Link href="/plugins" className="hover:text-[#00E5A3] transition-colors">{pd.breadcrumbSection}</Link>
          <span>/</span>
          <span className="text-[#F4F6F9]">{plugin.nombre}</span>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 min-w-0">
            <div className="p-5 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700">
              <span
                className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                style={{ color: catColor, backgroundColor: `${catColor}18` }}
              >
                {plugin.categoria}
              </span>
              <h1 className="text-xl font-bold text-[#F4F6F9] mb-1">{plugin.nombre}</h1>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{plugin.descripcion}</p>

              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Tag size={12} className="text-gray-500" />
                  <span>{plugin.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-gray-500" />
                  <span>{plugin.fecha}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-700/50">
                {plugin.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1F26] text-gray-400 border border-gray-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700">
              <h2 className="text-sm font-semibold text-[#F4F6F9] mb-3 flex items-center gap-2">
                <Download size={14} className="text-[#00E5A3]" />
                {pd.downloads}
              </h2>
              <div className="space-y-2">
                {plugin.descargas.map((d, i) => (
                  <a
                    key={i}
                    href={d.url}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border border-gray-700 bg-[#1A1F26] text-gray-300 hover:border-[#00E5A3] hover:text-[#00E5A3] transition-all group"
                  >
                    <span className="font-medium">{d.label}</span>
                    <span className="text-xs text-gray-500 group-hover:text-[#00E5A3] font-mono">
                      {TIPO_ICONS[d.tipo] ?? d.tipo}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <Link
              href="/plugins"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#00E5A3] transition-colors"
            >
              <ArrowLeft size={14} />
              {pd.back}
            </Link>
          </aside>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-8 min-w-0">
            <div className="p-6 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700">
              <h2 className="text-lg font-bold text-[#F4F6F9] mb-6 pb-4 border-b border-gray-700">
                {pd.manual}
              </h2>
              <div className="prose prose-invert prose-sm max-w-none overflow-x-auto
                prose-headings:font-semibold prose-headings:text-[#F4F6F9]
                prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-code:bg-[#00E5A3]/10 prose-code:text-[#00E5A3] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:break-all
                prose-pre:bg-[#1A1F26] prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:text-xs prose-pre:overflow-x-auto
                prose-a:text-[#00E5A3] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[#F4F6F9]
                prose-blockquote:border-l-[#00E5A3] prose-blockquote:text-gray-400
                prose-table:text-sm prose-th:bg-[#1A1F26] prose-th:text-[#F4F6F9] prose-td:text-gray-300
                prose-li:text-gray-300
              ">
                <ReactMarkdown>{plugin.manual}</ReactMarkdown>
              </div>
            </div>

            {plugin.ejemplos.length > 0 && (
              <div className="p-6 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700">
                <h2 className="text-lg font-bold text-[#F4F6F9] mb-6 pb-4 border-b border-gray-700">
                  {pd.examples}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {plugin.ejemplos.map((ej, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-gray-700">
                      {ej.imagen ? (
                        <img src={ej.imagen} alt={ej.titulo} className="w-full h-44 object-cover" />
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-[#252D3A] to-[#1A1F26] flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-black text-[#00E5A3] opacity-20 font-mono">IMG</div>
                            <div className="text-xs text-gray-500 mt-1">{pd.imageSoon}</div>
                          </div>
                        </div>
                      )}
                      <div className="px-3 py-2 bg-[#1A1F26]">
                        <p className="text-xs text-gray-400">{ej.titulo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
