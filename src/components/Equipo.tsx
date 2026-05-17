"use client";

import { useLang } from "@/lib/i18n";

export default function Equipo() {
  const { t } = useLang();
  const e = t.equipo;

  return (
    <section id="equipo" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F4F6F9] mb-4">{e.title}</h2>
          <p className="text-gray-300 max-w-xl mx-auto">{e.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {e.members.map(({ nombre, rol, bio, initials }) => (
            <div
              key={nombre}
              className="p-6 bg-[#252D3A]/90 backdrop-blur-sm rounded-xl border border-gray-700 text-center hover:border-[#00E5A3] hover:shadow-[0_0_0_1px_#00E5A3,0_4px_24px_rgba(0,229,163,0.18)] transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-full bg-[#00E5A3]/10 flex items-center justify-center text-[#00E5A3] text-sm font-bold mx-auto mb-4">
                {initials}
              </div>
              <div className="font-semibold text-[#F4F6F9]">{nombre}</div>
              <div className="text-xs text-[#00E5A3] font-medium mt-0.5 mb-3">{rol}</div>
              <p className="text-sm text-gray-300 leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-gray-700/50">
          {e.values.map(({ titulo, desc }) => (
            <div key={titulo}>
              <div className="w-6 h-0.5 bg-[#00E5A3] mb-3" />
              <h4 className="font-semibold text-[#F4F6F9] text-sm mb-1">{titulo}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
