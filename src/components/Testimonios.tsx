"use client";

import { useRef } from "react";
import { useLang } from "@/lib/i18n";

const CARD_W = 240;
const GAP = 12;

type TestimonioItem = {
  nombre: string;
  cargo: string;
  texto: string;
  initials: string;
  color: string;
};

function Card({ nombre, cargo, texto, initials, color }: TestimonioItem) {
  return (
    <div
      className="flex-shrink-0 p-4 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-[#00E5A3] hover:shadow-[0_0_0_1px_#00E5A3,0_4px_20px_rgba(0,229,163,0.15)] transition-all duration-200"
      style={{ width: CARD_W }}
    >
      <p className="text-xs text-gray-300 leading-relaxed mb-4">{texto}</p>
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div>
          <div className="text-xs font-semibold text-[#F4F6F9]">{nombre}</div>
          <div className="text-[10px] text-gray-400">{cargo}</div>
        </div>
      </div>
    </div>
  );
}

function ScrollRow({ items, direction, duration }: {
  items: TestimonioItem[];
  direction: "left" | "right";
  duration: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const pause  = () => { if (rowRef.current) rowRef.current.style.animationPlayState = "paused"; };
  const resume = () => { if (rowRef.current) rowRef.current.style.animationPlayState = "running"; };

  const doubled = [...items, ...items];
  const trackW  = doubled.length * (CARD_W + GAP);

  return (
    <div className="overflow-hidden w-full">
      <div
        ref={rowRef}
        className="flex"
        style={{
          width: trackW,
          gap: GAP,
          animation: `scroll-${direction} ${duration}s linear infinite`,
        }}
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        {doubled.map((t, i) => (
          <Card key={`${t.nombre}-${i}`} {...t} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonios() {
  const { t } = useLang();
  const tm = t.testimonios;

  const row1 = tm.items.slice(0, 3) as TestimonioItem[];
  const row2 = tm.items.slice(3, 6) as TestimonioItem[];

  return (
    <section className="py-24">
      <style>{`
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div className="text-center mb-12 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[#F4F6F9] mb-4">{tm.title}</h2>
        <p className="text-gray-300 max-w-xl mx-auto">{tm.subtitle}</p>
      </div>

      <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl border border-gray-700/50 bg-[#252D3A]/30 backdrop-blur-sm p-6 flex flex-col gap-3">
        <ScrollRow items={row1} direction="left"  duration={28} />
        <ScrollRow items={row2} direction="right" duration={22} />
      </div>
    </section>
  );
}
