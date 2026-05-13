import Navbar from "@/components/Navbar";
import NetworkBackground from "@/components/NetworkBackground";
import Hero from "@/components/Hero";
import Servicios from "@/components/Servicios";
import Testimonios from "@/components/Testimonios";
import Portfolio from "@/components/Portfolio";
import Equipo from "@/components/Equipo";
import Blog from "@/components/Blog";
import Plugins from "@/components/Plugins";
import Contacto from "@/components/Contacto";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <NetworkBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <main>
          <Hero />
          <Servicios />
          <Testimonios />
          <Portfolio />
          <Equipo />
          <Blog />
          <Plugins />
          <Contacto />
        </main>
        <Footer />
      </div>
    </>
  );
}
