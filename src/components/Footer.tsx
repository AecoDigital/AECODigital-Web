"use client";

import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  const f = t.footer;

  return (
    <footer className="border-t border-gray-700/50 bg-[#1A1F26]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-base font-bold tracking-tight">
            <span className="text-[#F4F6F9]">AECO</span>
            <span className="text-[#00E5A3]">Digital</span>
          </span>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            {f.links.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-gray-200 transition-colors">
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
