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
        className="min-h-screen antialiased text-gray-900"
        style={{
          background:
            "linear-gradient(160deg, #c8e0f8 0%, #ddeeff 20%, #eef6ff 50%, #e8e4f8 80%, #d8cff5 100%)",
        }}
      >
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
