"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const BimViewerClient = dynamic(
  () => import("@/components/BimViewerClient"),
  { ssr: false }
);

export default function BimViewerPage() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#0066cc]">AECO</span>
            <span className="text-gray-900">Digital</span>
          </span>
        </Link>
      </header>
      <main className="fixed inset-x-0 top-14 bottom-0 flex">
        <BimViewerClient />
      </main>
    </>
  );
}
