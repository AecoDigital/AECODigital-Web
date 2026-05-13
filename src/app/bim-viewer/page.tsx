"use client";

import dynamic from "next/dynamic";

const BimViewerClient = dynamic(
  () => import("@/components/BimViewerClient"),
  { ssr: false }
);

export default function BimViewerPage() {
  return (
    <main className="fixed inset-x-0 top-14 bottom-0 flex">
      <BimViewerClient />
    </main>
  );
}
