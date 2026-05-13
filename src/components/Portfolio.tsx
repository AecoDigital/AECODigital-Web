"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

const CATEGORIAS_ES = ["Todos", "Infraestructura", "Arquitectura", "Digital Twin", "GIS"];
const CATEGORIAS_EN = ["All", "Infrastructure", "Architecture", "Digital Twin", "GIS"];

export default function Portfolio() {
  const { lang, t } = useLang();
  const p = t.portfolio;

  const categorias = lang === "es" ? CATEGORIAS_ES : CATEGORIAS_EN;
  const [activa, setActiva] = useState(categorias[0]);

  const filterAll = p.filterAll;

  const filtrados =
    activa === filterAll
      ? p.items
      : p.items.filter((item) => {
          if (lang === "en") {
            const map: Record<string, string> = {
              Infrastructure: "Infraestructura",
              Architecture: "Arquitectura",
              "Digital Twin": "Digital Twin",
              GIS: "GIS",
            };
            return item.categoria === (map[activa] ?? activa);
          }
          return item.categoria === activa;
        });

  return (
    <section id="portfolio" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{p.title}</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">{p.subtitle}</p>

          <div className="flex flex-wrap justify-center gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiva(cat)}
                className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                  activa === cat
                    ? "bg-[#0066cc] text-white border-[#0066cc]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(({ title, categoria, descripcion, tags, año }) => (
            <div
              key={title}
              className="group p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[#0066cc] hover:shadow-[0_0_0_1px_#0066cc,0_4px_24px_rgba(0,102,204,0.18)] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#0066cc] bg-[#e8f1fb] px-2.5 py-1 rounded-full font-medium">
                  {categoria}
                </span>
                <span className="text-xs text-gray-400 font-mono">{año}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#0066cc] transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{descripcion}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
