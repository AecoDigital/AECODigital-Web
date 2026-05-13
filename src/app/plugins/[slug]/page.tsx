import { notFound } from "next/navigation";
import { plugins, getPlugin } from "@/data/plugins";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NetworkBackground from "@/components/NetworkBackground";
import PluginDetalleClient from "./PluginDetalleClient";

export function generateStaticParams() {
  return plugins.map((p) => ({ slug: p.slug }));
}

export default async function PluginDetalle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) notFound();

  return (
    <>
      <NetworkBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <PluginDetalleClient plugin={plugin} />
        <Footer />
      </div>
    </>
  );
}
