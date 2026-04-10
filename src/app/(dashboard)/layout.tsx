"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Capa de seguridad client-side (el proxy ya redirige, esto es respaldo)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
        <span
          className="text-sm tracking-widest uppercase text-[var(--color-muted)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Cargando...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-[#f4f4f5] px-4 md:hidden">
        <button
          type="button"
          className="rounded-lg p-2 text-foreground hover:bg-black/5"
          aria-label="Abrir menú"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-sm font-semibold text-foreground">Beauty Center</span>
      </header>

      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex min-h-screen flex-col pt-14 md:pt-0 md:pl-64">
        <main className="dashboard flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
