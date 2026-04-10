"use client";

import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";

interface StatCard {
  label: string;
  value: string;
  hint: string;
}

const STATS: StatCard[] = [
  { label: "Citas hoy",       value: "—", hint: "Pendiente de conectar" },
  { label: "Clientes activos",value: "—", hint: "Pendiente de conectar" },
  { label: "Ventas del mes",  value: "—", hint: "Pendiente de conectar" },
  { label: "Estilistas",      value: "—", hint: "Pendiente de conectar" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      {/* Saludo */}
      <div>
        <p
          className="text-xs tracking-[0.3em] uppercase text-[var(--color-gold)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Panel de administración
        </p>
        <h1
          className="text-4xl text-[var(--color-charcoal)] mt-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Bienvenida{user?.name ? `, ${user.name}` : ""}.
        </h1>
      </div>

      {/* Stats — solo admin y receptionist */}
      <RoleGuard allowed={["admin", "receptionist"]}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[var(--color-rose-light)]/40 px-6 py-5 flex flex-col gap-2"
            >
              <p
                className="text-xs tracking-widest uppercase text-[var(--color-muted)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {stat.label}
              </p>
              <p
                className="text-3xl text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </p>
              <p
                className="text-[11px] text-[var(--color-muted)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {stat.hint}
              </p>
            </div>
          ))}
        </div>
      </RoleGuard>

      {/* Accesos rápidos */}
      <div>
        <h2
          className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Nueva cita",     href: "/dashboard/citas/nueva",    roles: ["admin", "receptionist", "stylist"] },
            { label: "Nuevo cliente",  href: "/dashboard/clientes/nuevo", roles: ["admin", "receptionist"] },
            { label: "Nueva venta",    href: "/dashboard/ventas/nueva",   roles: ["admin", "receptionist"] },
            { label: "Ver comisiones", href: "/dashboard/comisiones",     roles: ["admin"] },
          ]
            .filter((item) => user && (item.roles as string[]).includes(user.role))
            .map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="border border-[var(--color-rose-light)]/50 bg-white px-4 py-4 text-sm tracking-widest uppercase text-[var(--color-charcoal)] hover:border-[var(--color-rose)] hover:text-[var(--color-rose)] transition-colors duration-200"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.label}
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
