import { notFound } from "next/navigation";
import { articulos, getArticulo } from "@/data/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NetworkBackground from "@/components/NetworkBackground";
import BlogDetalleClient from "./BlogDetalleClient";

export function generateStaticParams() {
  return articulos.map((a) => ({ slug: a.slug }));
}

export default async function BlogDetalle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articulo = getArticulo(slug);
  if (!articulo) notFound();

  return (
    <>
      <NetworkBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <BlogDetalleClient articulo={articulo} />
        <Footer />
      </div>
    </>
  );
}
