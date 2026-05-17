"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { plugins } from "@/data/plugins";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NetworkBackground from "@/components/NetworkBackground";
import { useLang } from "@/lib/i18n";

const CATEGORIAS_ES = ["Todas", ...Array.from(new Set(plugins.map((p) => p.categoria)))];
const CATEGORIAS_EN = ["All", ...Array.from(new Set(plugins.map((p) => p.categoria)))];

const CATEGORIA_COLORS: Record<string, string> = {
  Dynamo: "#f59e0b",
  Python: "#3b82f6",
  Revit: "#8b5cf6",
  Excel: "#10b981",
  Grasshopper: "#ef4444",
};

export default function PluginsPage() {
  const { lang, t } = useLang();
  const pp = t.pluginsPage;

  const categorias = lang === "es" ? CATEGORIAS_ES : CATEGORIAS_EN;
  const [categoria, setCategoria] = useState(categorias[0]);
  const [busqueda, setBusqueda] = useState("");

  const filterAll = pp.filterAll;

  const filtrados = plugins.filter((p) => {
    const matchCat = categoria === filterAll || p.categoria === categoria;
    const q = busqueda.toLowerCase();
    const matchQ =
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  return (
    <>
      <NetworkBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />

        <main className="pt-28 pb-24 px-6 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
              <Link href="/" className="hover:text-[#00E5A3] transition-colors">{pp.breadcrumbHome}</Link>
              <span>/</span>
              <span className="text-[#F4F6F9]">{pp.breadcrumbSection}</span>
            </div>

            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-[#F4F6F9] mb-4">{pp.title}</h1>
              <p className="text-gray-300 max-w-2xl">{pp.subtitle}</p>
            </div>

            {/* Filtros + Buscador */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={pp.searchPlaceholder}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-600 rounded-lg bg-[#252D3A]/70 text-[#F4F6F9] placeholder-gray-500 focus:outline-none focus:border-[#00E5A3] transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                      categoria === cat
                        ? "bg-[#00E5A3] text-[#1A1F26] border-[#00E5A3]"
                        : "bg-[#252D3A] text-gray-400 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {filtrados.length === 0 ? (
              <div className="text-center py-24 text-gray-400">{pp.empty}</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrados.map((plugin) => {
                  const catColor = CATEGORIA_COLORS[plugin.categoria] ?? "#00E5A3";
                  return (
                    <Link
                      key={plugin.slug}
                      href={`/plugins/${plugin.slug}`}
                      className="group flex flex-col p-6 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-[#00E5A3] hover:shadow-[0_0_0_1px_#00E5A3,0_4px_24px_rgba(0,229,163,0.15)] transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: catColor, backgroundColor: `${catColor}18` }}
                        >
                          {plugin.categoria}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{plugin.version}</span>
                      </div>

                      <h2 className="font-semibold text-[#F4F6F9] mb-2 group-hover:text-[#00E5A3] transition-colors">
                        {plugin.nombre}
                      </h2>

                      <p className="text-sm text-gray-300 leading-relaxed mb-4 flex-1 line-clamp-3">
                        {plugin.descripcion}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {plugin.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded bg-[#1A1F26] text-gray-400 border border-gray-700/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                        <span className="text-xs text-gray-300">{plugin.fecha}</span>
                        <span className="text-xs text-[#00E5A3] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {pp.viewPlugin} <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
