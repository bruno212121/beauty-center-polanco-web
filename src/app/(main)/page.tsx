import Link from "next/link";
import { Scissors, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#E8DDD4]">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Beauty Center Polanco</span>
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Acceso Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Scissors className="h-8 w-8 text-primary-foreground" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Beauty Center Polanco
          </h1>

          <p className="mt-3 text-muted-foreground">
            Salón de belleza profesional en el corazón de Polanco
          </p>

          {/* Info */}
          <div className="mt-10 space-y-4 text-left">
            <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Ubicación</p>
                <p className="text-sm text-muted-foreground">Av. Presidente Masaryk 123, Polanco</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Horario</p>
                <p className="text-sm text-muted-foreground">Lunes a Sábado: 9:00 — 20:00</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Contacto</p>
                <p className="text-sm text-muted-foreground">55 1234 5678</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10">
            <a
              href="tel:5512345678"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <Phone className="h-4 w-4" />
              Llamar para reservar
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © 2026 Beauty Center Polanco - By Bruno Rosales
        </p>
      </footer>
    </div>
  );
}
