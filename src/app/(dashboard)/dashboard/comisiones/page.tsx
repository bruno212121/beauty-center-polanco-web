"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoleGuard from "@/components/RoleGuard";
import { api, ApiError } from "@/lib/api";
import type {
  Commission,
  CommissionSummary,
  CommissionSourceType,
  CommissionPeriod,
} from "@/types/commission";
import type { Stylist } from "@/types/stylist";

const SOURCE_LABELS: Record<CommissionSourceType, string> = {
  service: "Servicio",
  product: "Producto",
};

const SOURCE_COLORS: Record<CommissionSourceType, string> = {
  service: "bg-primary/15 text-primary",
  product: "bg-amber-100 text-amber-700",
};

const PERIOD_OPTIONS: { value: CommissionPeriod | ""; label: string }[] = [
  { value: "",        label: "Sin filtro de período" },
  { value: "weekly",  label: "Últimos 7 días" },
  { value: "monthly", label: "Últimos 30 días" },
];

export default function ComisionesPage() {
  const searchParams = useSearchParams();

  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<string>(
    searchParams.get("stylist_id") ?? "",
  );
  const [period, setPeriod] = useState<string>("");
  const [sourceType, setSourceType] = useState<string>("");

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Stylist[]>("/stylists/").then(setStylists).catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedStylistId) {
      setCommissions([]);
      setSummary(null);
      return;
    }

    async function fetchCommissions() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        const activePeriod = period === "_all" ? "" : period;
        const activeSource = sourceType === "_all" ? "" : sourceType;
        if (activePeriod) params.set("period", activePeriod);
        if (activeSource) params.set("source_type", activeSource);

        const [commData, summaryData] = await Promise.all([
          api.get<Commission[]>(`/commissions/stylist/${selectedStylistId}?${params}`),
          api.get<CommissionSummary>(`/commissions/stylist/${selectedStylistId}/summary?${params}`),
        ]);

        setCommissions(commData);
        setSummary(summaryData);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Error al cargar comisiones.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCommissions();
  }, [selectedStylistId, period, sourceType]);

  return (
    <RoleGuard
      allowed={["admin"]}
      fallback={
        <p className="text-sm text-muted-foreground">No tenés acceso a esta sección.</p>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Comisiones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reporte de comisiones por estilista
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="w-56">
            <Select value={selectedStylistId} onValueChange={setSelectedStylistId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estilista" />
              </SelectTrigger>
              <SelectContent>
                {stylists.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select
              value={period}
              onValueChange={setPeriod}
              disabled={!selectedStylistId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value === "" ? "_all" : opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Select
              value={sourceType}
              onValueChange={setSourceType}
              disabled={!selectedStylistId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos los tipos</SelectItem>
                <SelectItem value="service">Servicios</SelectItem>
                <SelectItem value="product">Productos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estado vacío */}
        {!selectedStylistId && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Seleccioná un estilista para ver sus comisiones.
          </p>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground">Cargando comisiones...</p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            {error}
          </p>
        )}

        {/* Tarjetas de resumen */}
        {!isLoading && summary && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Servicios", value: summary.total_service_commissions },
              { label: "Productos", value: summary.total_product_commissions },
              { label: "Total",     value: summary.total },
            ].map((item) => (
              <Card key={item.label} className="border-border/50">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">
                      ${Number(item.value).toLocaleString("es-MX")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabla de detalle */}
        {!isLoading && commissions.length > 0 && (
          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-accent/20">
                    {["Tipo", "Referencia", "Porcentaje", "Monto", "Fecha"].map((col) => (
                      <th
                        key={col}
                        className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground px-5 py-3"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-accent/20 transition-colors">
                      <td className="px-5 py-3">
                        <Badge
                          variant="secondary"
                          className={SOURCE_COLORS[c.source_type]}
                        >
                          {SOURCE_LABELS[c.source_type]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        #{c.source_id}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {c.percentage}%
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        ${Number(c.amount).toLocaleString("es-MX")}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {!isLoading && selectedStylistId && commissions.length === 0 && !error && (
          <p className="text-sm text-muted-foreground text-center py-10">
            No se encontraron comisiones con los filtros seleccionados.
          </p>
        )}
      </div>
    </RoleGuard>
  );
}
