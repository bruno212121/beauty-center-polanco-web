import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
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
    description: "Centro de belleza y bienestar en Polanco, Ciudad de México.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-foreground)]" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
