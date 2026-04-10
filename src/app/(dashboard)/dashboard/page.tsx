"use client";

import { useEffect, useState } from "react";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import { api } from "@/lib/api";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

/* ─── Helpers ─── */

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled:   "Agendada",
  in_progress: "En curso",
  completed:   "Completada",
  cancelled:   "Cancelada",
};

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled:   "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  in_progress: "bg-primary/15 text-primary hover:bg-primary/15",
  completed:   "bg-gray-100 text-gray-500 hover:bg-gray-100",
  cancelled:   "bg-red-50 text-red-400 hover:bg-red-50",
};

/* ─── Page ─── */

export default function DashboardPage() {
  const { user } = useAuth();

  const [citasHoy, setCitasHoy] = useState<Appointment[]>([]);
  const [pendientes, setPendientes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Traemos scheduled + in_progress y filtramos al día de hoy
        const [scheduled, inProgress] = await Promise.all([
          api.get<Appointment[]>("/appointments/?appointment_status=scheduled"),
          api.get<Appointment[]>("/appointments/?appointment_status=in_progress"),
        ]);

        const today = [...scheduled, ...inProgress].filter((a) =>
          isToday(a.start_time),
        );

        // Ordenar por hora
        today.sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
        );

        setCitasHoy(today);
        setPendientes(scheduled.filter((a) => isToday(a.start_time)).length);
      } catch {
        // Si el backend no está disponible, dejamos lista vacía
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const citasCount = isLoading ? "—" : String(citasHoy.length);
  const pendientesText = isLoading ? "Cargando..." : `${pendientes} agendada${pendientes !== 1 ? "s" : ""}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.name ? `Bienvenida, ${user.name}.` : "Resumen de tu salón de belleza"}
        </p>
      </div>

      {/* Stats */}
      <RoleGuard allowed={["admin", "receptionist"]}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Citas Hoy"
            value={citasCount}
            subtitle={pendientesText}
            icon={Calendar}
          />
          <StatCard
            title="Clientes Activos"
            value="—"
            subtitle="Próximamente"
            icon={Users}
          />
          <StatCard
            title="Ventas del Día"
            value="—"
            subtitle="Próximamente"
            icon={DollarSign}
          />
          <StatCard
            title="Ingresos del Mes"
            value="—"
            subtitle="Próximamente"
            icon={TrendingUp}
          />
        </div>
      </RoleGuard>

      {/* Citas de hoy */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Citas de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Cargando citas...
            </p>
          ) : citasHoy.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay citas programadas para hoy.
            </p>
          ) : (
            <div className="space-y-3">
              {citasHoy.map((cita) => {
                const hora = new Date(cita.start_time).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });

                return (
                  <div
                    key={cita.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                        {hora}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {cita.client.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {cita.service.name} · {cita.service.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={STATUS_BADGE[cita.status]}
                    >
                      {STATUS_LABELS[cita.status]}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
