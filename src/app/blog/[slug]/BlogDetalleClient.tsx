"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Articulo } from "@/data/blog";

const CATEGORIA_COLORS: Record<string, string> = {
  "BIM & Estándares": "#0066cc",
  "BIM & Standards": "#0066cc",
  "Digital Twin": "#8b5cf6",
  "Desarrollo Web": "#10b981",
  "Web Development": "#10b981",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CodeBlock({ className, children }: any) {
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");

  if (match) {
    return (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        customStyle={{
          borderRadius: "0.75rem",
          fontSize: "13px",
          lineHeight: "1.7",
          margin: "1.5rem 0",
          padding: "1.25rem 1.5rem",
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-geist-sans), 'Consolas', monospace" } }}
      >
        {code}
      </SyntaxHighlighter>
    );
  }

  return (
    <code className="bg-[#e8f1fb] text-[#0066cc] px-1.5 py-0.5 rounded text-[13px] font-medium">
      {children}
    </code>
  );
}

export default function BlogDetalleClient({ articulo }: { articulo: Articulo }) {
  const { lang, t } = useLang();
  const bd = t.blogDetail;

  const titulo = lang === "es" ? articulo.titulo : articulo.tituloEn;
  const categoria = lang === "es" ? articulo.categoria : articulo.categoriaEn;
  const resumen = lang === "es" ? articulo.resumen : articulo.resumenEn;
  const contenido = lang === "es" ? articulo.contenido : articulo.contenidoEn;
  const fecha = lang === "es" ? articulo.fecha : articulo.fechaEn;
  const catColor = CATEGORIA_COLORS[categoria] ?? "#0066cc";

  return (
    <main className="pt-28 pb-24 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#0066cc] transition-colors">{bd.breadcrumbHome}</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#0066cc] transition-colors">{bd.breadcrumbSection}</Link>
          <span>/</span>
          <span className="text-gray-700 line-clamp-1">{titulo}</span>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
            <div className="p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <span
                className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                style={{ color: catColor, backgroundColor: `${catColor}18` }}
              >
                {categoria}
              </span>
              <h1 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{titulo}</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{resumen}</p>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-gray-400" />
                  <span>{fecha}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-400" />
                  <span>{articulo.lectura}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
                {articulo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/blog"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0066cc] transition-colors"
            >
              <ArrowLeft size={14} />
              {bd.back}
            </Link>
          </aside>

          {/* Contenido */}
          <div className="lg:col-span-3">
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <div className="prose prose-gray max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
                prose-h3:text-base prose-h3:mt-7 prose-h3:mb-3 prose-h3:text-[#0066cc]
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-[15px]
                prose-pre:!p-0 prose-pre:!bg-transparent prose-pre:!rounded-none prose-pre:!shadow-none
                prose-a:text-[#0066cc] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-[#0066cc] prose-blockquote:bg-[#e8f1fb]/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:text-gray-600 prose-blockquote:not-italic
                prose-table:text-sm prose-table:w-full
                prose-thead:bg-[#e8f1fb] prose-th:text-gray-700 prose-th:font-semibold prose-th:px-4 prose-th:py-2
                prose-td:text-gray-600 prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-gray-100
                prose-tr:even:bg-gray-50/50
                prose-li:text-gray-600 prose-li:text-[15px]
                prose-hr:border-gray-200 prose-hr:my-8
                prose-img:rounded-xl
              ">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ code: CodeBlock }}
                >
                  {contenido}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
