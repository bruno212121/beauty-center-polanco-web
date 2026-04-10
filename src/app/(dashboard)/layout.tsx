"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <main className="dashboard flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
