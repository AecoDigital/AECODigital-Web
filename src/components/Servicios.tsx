"use client";

import { Building2, Layers3, Cpu, MapPin, Database, Workflow } from "lucide-react";
import { useLang } from "@/lib/i18n";

const ICONS = [Layers3, Building2, Cpu, Database, MapPin, Workflow];

export default function Servicios() {
  const { t } = useLang();
  const s = t.servicios;

  return (
    <section id="servicios" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{s.title}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{s.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {s.items.map(({ title, description }, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={title}
                className="group p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[#0066cc] hover:shadow-[0_0_0_1px_#0066cc,0_4px_24px_rgba(0,102,204,0.18)] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-[#e8f1fb] flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#0066cc]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
