"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth";

interface NavItem {
  label: string;
  href: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/dashboard",             roles: ["admin", "receptionist", "stylist"] },
  { label: "Clientes",    href: "/dashboard/clientes",    roles: ["admin", "receptionist"] },
  { label: "Citas",       href: "/dashboard/citas",       roles: ["admin", "receptionist", "stylist"] },
  { label: "Servicios",   href: "/dashboard/servicios",   roles: ["admin", "receptionist"] },
  { label: "Productos",   href: "/dashboard/productos",   roles: ["admin", "receptionist"] },
  { label: "Ventas",      href: "/dashboard/ventas",      roles: ["admin", "receptionist"] },
  { label: "Estilistas",  href: "/dashboard/estilistas",  roles: ["admin", "receptionist"] },
  { label: "Comisiones",  href: "/dashboard/comisiones",  roles: ["admin"] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside className="flex flex-col w-60 shrink-0 min-h-screen bg-[var(--color-charcoal)] text-white">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/dashboard" className="flex flex-col leading-none">
          <span
            className="text-lg tracking-widest text-[var(--color-rose-light)] uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Beauty Center
          </span>
          <span
            className="text-[10px] tracking-[0.35em] text-[var(--color-gold)] uppercase"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Polanco
          </span>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2.5 text-sm tracking-widest uppercase transition-colors duration-150 ${
                isActive
                  ? "bg-[var(--color-rose)] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + logout */}
      <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-2">
        {user && (
          <div className="px-2">
            <p
              className="text-xs text-white font-medium truncate"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {user.name}
            </p>
            <p
              className="text-[10px] text-[var(--color-gold)] tracking-widest uppercase mt-0.5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {user.role}
            </p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-xs tracking-widest uppercase text-white/40 hover:text-white/80 transition-colors duration-150"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
