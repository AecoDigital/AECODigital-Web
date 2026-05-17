import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AECO Digital — Transformación Digital del Sector AECO",
  description:
    "Consultoría BIM, modelado 3D y proyectos de infraestructura digital. Expertos en transformación digital para arquitectura, ingeniería, construcción y operaciones.",
  keywords: "BIM, consultoría BIM, modelado 3D, infraestructura, arquitectura digital, gemelos digitales, IFC",
  openGraph: {
    title: "AECO Digital",
    description: "Transformación digital del sector AECO",
    url: "https://aecodigital.com",
    siteName: "AECO Digital",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={spaceGrotesk.variable}>
      <body
        className="min-h-screen antialiased text-[#F4F6F9]"
        style={{ background: "#1A1F26" }}
      >
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
