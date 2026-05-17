"use client";

import { useState } from "react";
import { Send, Mail, MapPin } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function Contacto() {
  const { t } = useLang();
  const c = t.contacto;

  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setEstado("ok");
      setForm({ nombre: "", email: "", asunto: "", mensaje: "" });
      setTimeout(() => setEstado("idle"), 5000);
    } catch {
      setEstado("error");
      setTimeout(() => setEstado("idle"), 5000);
    }
  };

  return (
    <section id="contacto" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F4F6F9] mb-4">{c.title}</h2>
          <p className="text-gray-300 max-w-md mx-auto">{c.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Mail, label: c.labelEmail, value: "info@aecodigital.com", href: "mailto:info@aecodigital.com" },
              { icon: MapPin, label: c.labelLocation, value: c.location, href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#00E5A3]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#00E5A3]" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                  {href ? (
                    <a href={href} className="text-sm text-gray-300 hover:text-[#00E5A3] transition-colors">
                      {value}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-300">{value}</span>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-700/50">
              <div className="text-xs text-gray-400 mb-3">{c.followUs}</div>
              <div className="flex gap-2">
                {["LinkedIn", "Instagram", "Twitter/X"].map((red) => (
                  <a
                    key={red}
                    href="#"
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-[#00E5A3] hover:text-[#00E5A3] transition-all"
                  >
                    {red}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">{c.fieldName}</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder={c.placeholderName}
                  className="w-full bg-[#252D3A]/70 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-[#F4F6F9] placeholder-gray-500 focus:outline-none focus:border-[#00E5A3] focus:bg-[#252D3A] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">{c.fieldEmail}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={c.placeholderEmail}
                  className="w-full bg-[#252D3A]/70 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-[#F4F6F9] placeholder-gray-500 focus:outline-none focus:border-[#00E5A3] focus:bg-[#252D3A] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">{c.fieldSubject}</label>
              <input
                type="text"
                value={form.asunto}
                onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                placeholder={c.placeholderSubject}
                className="w-full bg-white/70 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00E5A3] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">{c.fieldMessage}</label>
              <textarea
                required
                rows={5}
                value={form.mensaje}
                onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                placeholder={c.placeholderMessage}
                className="w-full bg-white/70 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00E5A3] focus:bg-white transition-colors resize-none"
              />
            </div>
            {estado === "error" && (
              <p className="text-sm text-red-500 text-center">
                Error al enviar. Inténtalo de nuevo o escríbenos a info@aecodigital.com
              </p>
            )}
            <button
              type="submit"
              disabled={estado === "loading" || estado === "ok"}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#00E5A3] text-white text-sm font-semibold rounded-lg hover:bg-[#00B882] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {estado === "loading" ? (
                <span>Enviando…</span>
              ) : estado === "ok" ? (
                <span>{c.submitted}</span>
              ) : (
                <><span>{c.submit}</span><Send size={14} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
