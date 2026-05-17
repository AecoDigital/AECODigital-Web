"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { getPluginsDestacados } from "@/data/plugins";
import { useLang } from "@/lib/i18n";

const CATEGORIA_COLORS: Record<string, string> = {
  Dynamo: "#f59e0b",
  Python: "#3b82f6",
  Revit: "#8b5cf6",
  Excel: "#10b981",
  Grasshopper: "#ef4444",
};

export default function Plugins() {
  const { t } = useLang();
  const p = t.plugins;
  const destacados = getPluginsDestacados();

  return (
    <section id="plugins" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#00E5A3] bg-[#00E5A3]/10 px-3 py-1.5 rounded-full mb-4">
              <Download size={11} />
              {p.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F4F6F9] mb-2">{p.title}</h2>
            <p className="text-gray-300 max-w-lg">{p.subtitle}</p>
          </div>
          <Link
            href="/plugins"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm text-[#00E5A3] hover:text-[#00B882] font-medium transition-colors"
          >
            {p.viewAll} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {destacados.map((plugin) => {
            const catColor = CATEGORIA_COLORS[plugin.categoria] ?? "#00E5A3";
            return (
              <Link
                key={plugin.slug}
                href={`/plugins/${plugin.slug}`}
                className="group flex flex-col p-5 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-[#00E5A3] hover:shadow-[0_0_0_1px_#00E5A3,0_4px_24px_rgba(0,229,163,0.15)] transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: catColor, backgroundColor: `${catColor}18` }}
                  >
                    {plugin.categoria}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{plugin.version}</span>
                </div>

                <h3 className="font-semibold text-[#F4F6F9] mb-2 group-hover:text-[#00E5A3] transition-colors leading-snug">
                  {plugin.nombre}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed mb-4 flex-1 line-clamp-3">
                  {plugin.descripcion}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {plugin.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1F26] text-gray-400 border border-gray-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                  <span className="text-[10px] text-gray-300">{plugin.fecha}</span>
                  <span className="text-xs text-[#00E5A3] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.viewPlugin} <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
