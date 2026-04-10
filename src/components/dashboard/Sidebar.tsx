"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  Scissors,
  Package,
  DollarSign,
  LayoutDashboard,
  UserCircle,
  LogOut,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const navigation: NavItem[] = [
  { name: "Dashboard",  href: "/dashboard",            icon: LayoutDashboard, roles: ["admin", "receptionist", "stylist"] },
  { name: "Citas",      href: "/dashboard/citas",      icon: Calendar,        roles: ["admin", "receptionist", "stylist"] },
  { name: "Clientes",   href: "/dashboard/clientes",   icon: Users,           roles: ["admin", "receptionist"] },
  { name: "Estilistas", href: "/dashboard/estilistas", icon: UserCircle,      roles: ["admin", "receptionist"] },
  { name: "Servicios",  href: "/dashboard/servicios",  icon: Scissors,        roles: ["admin", "receptionist"] },
  { name: "Productos",  href: "/dashboard/productos",  icon: Package,         roles: ["admin", "receptionist"] },
  { name: "Ventas",     href: "/dashboard/ventas",     icon: DollarSign,      roles: ["admin", "receptionist"] },
  { name: "Comisiones", href: "/dashboard/comisiones", icon: Percent,         roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleItems = navigation.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-[var(--color-sidebar)] border-[var(--color-sidebar-border)]">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6 border-[var(--color-sidebar-border)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-rose)]">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span
            className="font-semibold text-[var(--color-sidebar-foreground)] tracking-wide"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Beauty Center
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-0.5 p-4">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-primary)]"
                    : "text-[var(--color-sidebar-foreground-muted)] hover:bg-[var(--color-sidebar-accent)] hover:text-[var(--color-sidebar-foreground)]",
                )}
                style={{ fontFamily: "var(--font-body)" }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Usuario + logout */}
        <div className="border-t p-4 border-[var(--color-sidebar-border)]">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-sidebar-accent)]">
              <UserCircle className="h-5 w-5 text-[var(--color-sidebar-foreground)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="truncate text-sm font-medium text-[var(--color-sidebar-foreground)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {user?.name ?? "—"}
              </p>
              <p
                className="truncate text-xs text-[var(--color-muted-foreground)] capitalize"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {user?.role ?? ""}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-[var(--color-muted-foreground)] hover:bg-[var(--color-sidebar-accent)] hover:text-[var(--color-sidebar-foreground)] transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
