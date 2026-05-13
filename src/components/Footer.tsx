"use client";

import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  const f = t.footer;

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-base font-bold tracking-tight">
            <span className="text-[#0066cc]">AECO</span>
            <span className="text-gray-900">Digital</span>
          </span>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            {f.links.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-gray-700 transition-colors">
                {label}
              </a>
            ))}
          </div>

          <div className="text-xs text-gray-400">{f.copy}</div>
        </div>
      </div>
    </footer>
  );
}
