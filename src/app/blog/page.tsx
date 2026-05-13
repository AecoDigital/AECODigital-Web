"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { articulos } from "@/data/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NetworkBackground from "@/components/NetworkBackground";
import { useLang } from "@/lib/i18n";

const CATEGORIA_COLORS: Record<string, string> = {
  "BIM & Estándares": "#0066cc",
  "BIM & Standards": "#0066cc",
  "Digital Twin": "#8b5cf6",
  "Desarrollo Web": "#10b981",
  "Web Development": "#10b981",
};

export default function BlogPage() {
  const { lang, t } = useLang();
  const bp = t.blogPage;
  const [busqueda, setBusqueda] = useState("");

  const filtrados = articulos.filter((a) => {
    const q = busqueda.toLowerCase();
    const titulo = lang === "es" ? a.titulo : a.tituloEn;
    const resumen = lang === "es" ? a.resumen : a.resumenEn;
    return (
      !q ||
      titulo.toLowerCase().includes(q) ||
      resumen.toLowerCase().includes(q) ||
      a.tags.some((tag) => tag.toLowerCase().includes(q))
    );
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
              <Link href="/" className="hover:text-[#0066cc] transition-colors">{bp.breadcrumbHome}</Link>
              <span>/</span>
              <span className="text-gray-700">{bp.breadcrumbSection}</span>
            </div>

            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{bp.title}</h1>
              <p className="text-gray-500 max-w-2xl">{bp.subtitle}</p>
            </div>

            {/* Buscador */}
            <div className="mb-10 max-w-sm">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={bp.searchPlaceholder}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white/80 focus:outline-none focus:border-[#0066cc] transition-colors"
                />
              </div>
            </div>

            {/* Grid */}
            {filtrados.length === 0 ? (
              <div className="text-center py-24 text-gray-400">{bp.empty}</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrados.map((articulo) => {
                  const titulo = lang === "es" ? articulo.titulo : articulo.tituloEn;
                  const categoria = lang === "es" ? articulo.categoria : articulo.categoriaEn;
                  const resumen = lang === "es" ? articulo.resumen : articulo.resumenEn;
                  const fecha = lang === "es" ? articulo.fecha : articulo.fechaEn;
                  const catColor = CATEGORIA_COLORS[categoria] ?? "#0066cc";

                  return (
                    <Link
                      key={articulo.slug}
                      href={`/blog/${articulo.slug}`}
                      className="group flex flex-col p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[#0066cc] hover:shadow-[0_0_0_1px_#0066cc,0_4px_24px_rgba(0,102,204,0.15)] transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: catColor, backgroundColor: `${catColor}18` }}
                        >
                          {categoria}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{articulo.lectura}</span>
                      </div>

                      <h2 className="font-semibold text-gray-900 leading-snug mb-3 group-hover:text-[#0066cc] transition-colors flex-1">
                        {titulo}
                      </h2>

                      <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                        {resumen}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {articulo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-300">{fecha}</span>
                        <span className="text-xs text-[#0066cc] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {bp.readArticle} <ArrowRight size={12} />
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
