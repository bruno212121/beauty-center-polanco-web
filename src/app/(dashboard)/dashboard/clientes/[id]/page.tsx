"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, Calendar, ShoppingBag, AlertCircle, Heart, StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import type { ClientHistory } from "@/types/client";
import type { AppointmentStatus } from "@/types/appointment";

/* ─── Helpers ─── */

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled:   "bg-blue-100 text-blue-700",
  in_progress: "bg-primary/15 text-primary",
  completed:   "bg-emerald-100 text-emerald-700",
  cancelled:   "bg-red-100 text-red-500",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled:   "Agendada",
  in_progress: "En curso",
  completed:   "Completada",
  cancelled:   "Cancelada",
};

/* ─── Page ─── */

export default function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [cliente, setCliente] = useState<ClientHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      setError(null);
      try {
        setCliente(await api.get<ClientHistory>(`/clients/${id}/history`));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Error al cargar el historial.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clientes">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Detalle del Cliente</h1>
        </div>
        <p className="text-sm text-muted-foreground">Cargando historial...</p>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clientes">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Detalle del Cliente</h1>
        </div>
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          {error ?? "No se encontró el cliente."}
        </p>
      </div>
    );
  }

  const citasCompletadas = cliente.appointments.filter((a) => a.status === "completed");
  const totalServicios = citasCompletadas.reduce((sum, a) => sum + Number(a.service?.price ?? 0), 0);
  const totalProductos = cliente.product_sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalGastado = totalServicios + totalProductos;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Detalle del Cliente</h1>
          <p className="text-sm text-muted-foreground">Historial completo de citas y compras</p>
        </div>
      </div>

      {/* Perfil */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Info básica */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                  {cliente.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{cliente.full_name}</h2>
                <p className="text-sm text-muted-foreground">
                  Cliente desde {formatDate(cliente.created_at)}
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {cliente.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" /> {cliente.phone}
                    </span>
                  )}
                  {cliente.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" /> {cliente.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Totales */}
            <div className="flex gap-3 shrink-0">
              <div className="rounded-lg bg-accent/50 px-4 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-semibold text-foreground">
                  ${totalGastado.toLocaleString("es-MX")}
                </p>
                <p className="text-xs text-muted-foreground">Total gastado</p>
              </div>
              <div className="rounded-lg bg-accent/50 px-4 py-3 text-center min-w-[72px]">
                <p className="text-2xl font-semibold text-foreground">
                  {citasCompletadas.length}
                </p>
                <p className="text-xs text-muted-foreground">Visitas</p>
              </div>
            </div>
          </div>

          {/* Preferencias / alergias / notas */}
          {(cliente.preferences || cliente.allergies || cliente.notes) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {cliente.preferences && (
                <div className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                    <Heart className="h-4 w-4 text-primary" /> Preferencias
                  </div>
                  <p className="text-sm text-muted-foreground">{cliente.preferences}</p>
                </div>
              )}
              {cliente.allergies && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-1">
                    <AlertCircle className="h-4 w-4" /> Alergias
                  </div>
                  <p className="text-sm text-red-600">{cliente.allergies}</p>
                </div>
              )}
              {cliente.notes && (
                <div className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                    <StickyNote className="h-4 w-4 text-muted-foreground" /> Notas
                  </div>
                  <p className="text-sm text-muted-foreground">{cliente.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Historial de citas */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              Historial de Citas
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {cliente.appointments.length} registradas
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente.appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Sin citas registradas.</p>
            ) : (
              cliente.appointments
                .slice()
                .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                .map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-start justify-between rounded-lg border border-border/50 p-3 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground text-sm">
                          {cita.service?.name ?? "Servicio eliminado"}
                        </p>
                        <Badge variant="secondary" className={STATUS_BADGE[cita.status]}>
                          {STATUS_LABELS[cita.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatDate(cita.start_time)} · {formatTime(cita.start_time)}
                        {cita.stylist?.specialty && ` · ${cita.stylist.specialty}`}
                      </p>
                      {cita.notes && (
                        <p className="mt-1 text-xs text-muted-foreground italic">{cita.notes}</p>
                      )}
                    </div>
                    {cita.service?.price && (
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        ${Number(cita.service.price).toLocaleString("es-MX")}
                      </span>
                    )}
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Historial de compras */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Historial de Compras
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {cliente.product_sales.length} ventas
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente.product_sales.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Sin compras registradas.</p>
            ) : (
              cliente.product_sales
                .slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((venta) => (
                  <div
                    key={venta.id}
                    className="rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{formatDate(venta.created_at)}</p>
                      <p className="font-semibold text-foreground text-sm">
                        ${Number(venta.total_amount).toLocaleString("es-MX")}
                      </p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {venta.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">
                            {item.product.name}
                            {item.product.brand && (
                              <span className="text-muted-foreground"> · {item.product.brand}</span>
                            )}
                            <span className="text-muted-foreground"> ×{item.quantity}</span>
                          </span>
                          <span className="text-muted-foreground">
                            ${Number(item.subtotal).toLocaleString("es-MX")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
