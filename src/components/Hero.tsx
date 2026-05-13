"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

const LOGOS = ["Revit", "IFC", "Speckle", "APS", "Navisworks", "Civil 3D"];

function TypewriterWord({ prefijos }: { prefijos: readonly string[] }) {
  const [prefijo, setPrefijo] = useState(prefijos[0]);
  const [displayed, setDisplayed] = useState("");
  const [fase, setFase] = useState<"escribiendo" | "pausa" | "borrando">("escribiendo");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setPrefijo(prefijos[0]);
    setDisplayed("");
    setFase("escribiendo");
    setIdx(0);
  }, [prefijos]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (fase === "escribiendo") {
      if (displayed.length < prefijo.length) {
        timeout = setTimeout(() => setDisplayed(prefijo.slice(0, displayed.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setFase("pausa"), 1600);
      }
    } else if (fase === "pausa") {
      timeout = setTimeout(() => setFase("borrando"), 400);
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
      } else {
        const next = (idx + 1) % prefijos.length;
        setIdx(next);
        setPrefijo(prefijos[next]);
        setFase("escribiendo");
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, fase, idx, prefijo, prefijos]);

  return (
    <span className="inline-flex flex-wrap items-baseline justify-center gap-0">
      <span className="text-gray-900">{displayed}</span>
      <span
        className="inline-block w-[3px] h-[0.85em] bg-gray-900 align-middle"
        style={{ animation: "blink-cursor 1s step-end infinite" }}
      />
      <span className="text-[#0066cc]">.</span>
      <span
        className="text-[#0066cc] font-black"
        style={{ letterSpacing: "-0.02em" }}
      >
        Digital
      </span>
    </span>
  );
}

export default function Hero() {
  const { t } = useLang();
  const h = t.hero;

  return (
    <section id="inicio" className="pt-32 pb-24 px-6">
      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0066cc] bg-[#e8f1fb] px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0066cc]" />
          {h.badge}
        </div>

        {/* Headline typewriter */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight mb-6 min-h-[2.2em] flex items-center justify-center px-2">
          <TypewriterWord prefijos={h.prefijos} />
        </h1>

        {/* Subtítulo */}
        <p className="text-base sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          {h.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066cc] text-white text-sm font-semibold rounded-lg hover:bg-[#004d99] transition-colors"
          >
            {h.ctaPrimary} <ArrowRight size={15} />
          </a>
          <a
            href="#portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            {h.ctaSecondary}
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-10 mb-16">
          {h.stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tech logos */}
        <div className="border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-5 font-medium">
            {h.techLabel}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {LOGOS.map((logo) => (
              <div
                key={logo}
                className="px-4 py-2 bg-gray-50 text-gray-500 text-sm font-medium rounded-lg border border-gray-100"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
