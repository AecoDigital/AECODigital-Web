"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { articulos } from "@/data/blog";

const CATEGORIA_COLORS: Record<string, string> = {
  "BIM & Estándares": "#00E5A3",
  "BIM & Standards": "#00E5A3",
  "Digital Twin": "#8b5cf6",
  "Desarrollo Web": "#10b981",
  "Web Development": "#10b981",
};

export default function Blog() {
  const { lang, t } = useLang();
  const b = t.blog;

  return (
    <section id="blog" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F4F6F9] mb-2">{b.title}</h2>
            <p className="text-gray-300">{b.subtitle}</p>
          </div>
          <Link
            href="/blog"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm text-[#00E5A3] hover:text-[#00B882] font-medium transition-colors"
          >
            {b.viewAll} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {articulos.slice(0, 3).map((articulo) => {
            const titulo = lang === "es" ? articulo.titulo : articulo.tituloEn;
            const categoria = lang === "es" ? articulo.categoria : articulo.categoriaEn;
            const resumen = lang === "es" ? articulo.resumen : articulo.resumenEn;
            const fecha = lang === "es" ? articulo.fecha : articulo.fechaEn;
            const catColor = CATEGORIA_COLORS[categoria] ?? "#00E5A3";

            return (
              <Link
                key={articulo.slug}
                href={`/blog/${articulo.slug}`}
                className="group block p-6 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-[#00E5A3] hover:shadow-[0_0_0_1px_#00E5A3,0_4px_24px_rgba(0,229,163,0.18)] transition-all duration-200"
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
                <h3 className="font-semibold text-[#F4F6F9] leading-snug mb-3 group-hover:text-[#00E5A3] transition-colors">
                  {titulo}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-3">{resumen}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">{fecha}</span>
                  <span className="text-xs text-[#00E5A3] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {b.viewAll} <ArrowRight size={11} />
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
