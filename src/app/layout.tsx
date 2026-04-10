import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Beauty Center Polanco | Belleza & Bienestar",
    template: "%s | Beauty Center Polanco",
  },
  description:
    "Centro de belleza y bienestar en Polanco, Ciudad de México. Servicios de cuidado facial, corporal, uñas y más.",
  keywords: ["beauty center", "polanco", "spa", "belleza", "cdmx", "cuidado personal"],
  openGraph: {
    title: "Beauty Center Polanco",
    description:
      "Centro de belleza y bienestar en Polanco, Ciudad de México.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
