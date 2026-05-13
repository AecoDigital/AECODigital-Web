"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm" : "bg-white"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#0066cc]">AECO</span>
            <span className="text-gray-900">Digital</span>
          </span>
        </Link>

        {/* Links desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {t.navbar.links.map((l) => (
            <li key={l.href}>
              {l.href.startsWith("/") ? (
                <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* Right side: language selector + CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language selector */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
            <button
              onClick={() => setLang("es")}
              className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
                lang === "es"
                  ? "bg-[#0066cc] text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Globe size={11} />
              ES
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1.5 transition-colors ${
                lang === "en"
                  ? "bg-[#0066cc] text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="#contacto"
            className="inline-flex items-center px-4 py-2 bg-[#0066cc] text-white text-sm font-medium rounded-lg hover:bg-[#004d99] transition-colors"
          >
            {t.navbar.cta}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-500 hover:text-gray-900"
          aria-label="Menú"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 pb-5">
          <ul className="flex flex-col gap-4 pt-2">
            {t.navbar.links.map((l) => (
              <li key={l.href}>
                {l.href.startsWith("/") ? (
                  <Link href={l.href} onClick={() => setOpen(false)} className="text-sm text-gray-600 hover:text-gray-900">
                    {l.label}
                  </Link>
                ) : (
                  <a href={l.href} onClick={() => setOpen(false)} className="text-sm text-gray-600 hover:text-gray-900">
                    {l.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Language selector mobile */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden text-xs font-medium w-fit mt-4">
            <button
              onClick={() => setLang("es")}
              className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
                lang === "es" ? "bg-[#0066cc] text-white" : "text-gray-500"
              }`}
            >
              <Globe size={11} />
              ES
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1.5 transition-colors ${
                lang === "en" ? "bg-[#0066cc] text-white" : "text-gray-500"
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex px-4 py-2 bg-[#0066cc] text-white text-sm font-medium rounded-lg"
          >
            {t.navbar.cta}
          </a>
        </div>
      )}
    </header>
  );
}
