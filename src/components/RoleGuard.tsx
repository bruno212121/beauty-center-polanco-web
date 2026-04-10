"use client";

import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth";

interface RoleGuardProps {
  allowed: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza `children` solo si el usuario tiene uno de los roles permitidos.
 * Usar dentro de rutas ya protegidas por el proxy (auth garantizada).
 */
export default function RoleGuard({
  allowed,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowed.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
