"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import RoleGuard from "@/components/RoleGuard";
import type { Commission, CommissionSummary, CommissionSourceType, CommissionPeriod } from "@/types/commission";
import type { Stylist } from "@/types/stylist";

const SOURCE_LABELS: Record<CommissionSourceType, string> = {
  service: "Servicio",
  product: "Producto",
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
  const [period, setPeriod] = useState<CommissionPeriod | "">("");
  const [sourceType, setSourceType] = useState<CommissionSourceType | "">("");

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de estilistas para el selector
  useEffect(() => {
    api.get<Stylist[]>("/stylists/").then(setStylists).catch(() => null);
  }, []);

  // Cargar comisiones cuando cambian los filtros
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
        if (period) params.set("period", period);
        if (sourceType) params.set("source_type", sourceType);

        const [commData, summaryData] = await Promise.all([
          api.get<Commission[]>(`/commissions/stylist/${selectedStylistId}?${params}`),
          api.get<CommissionSummary>(`/commissions/stylist/${selectedStylistId}/summary?${params}`),
        ]);

        setCommissions(commData);
        setSummary(summaryData);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar comisiones.");
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
        <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-body)" }}>
          No tenés acceso a esta sección.
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Encabezado */}
        <div>
          <p
            className="text-xs tracking-[0.3em] uppercase text-[var(--color-gold)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Dashboard · Admin
          </p>
          <h1
            className="text-4xl text-[var(--color-charcoal)] mt-0.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Comisiones
          </h1>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          {/* Selector de estilista */}
          <select
            value={selectedStylistId}
            onChange={(e) => setSelectedStylistId(e.target.value)}
            className="border border-[var(--color-rose-light)] bg-white px-4 py-2 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-rose)] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <option value="">Seleccionar estilista</option>
            {stylists.map((s) => (
              <option key={s.id} value={s.id}>
                {s.user.full_name}
              </option>
            ))}
          </select>

          {/* Período */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as CommissionPeriod | "")}
            disabled={!selectedStylistId}
            className="border border-[var(--color-rose-light)] bg-white px-4 py-2 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-rose)] transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Tipo de fuente */}
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as CommissionSourceType | "")}
            disabled={!selectedStylistId}
            className="border border-[var(--color-rose-light)] bg-white px-4 py-2 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-rose)] transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <option value="">Todos los tipos</option>
            <option value="service">Servicios</option>
            <option value="product">Productos</option>
          </select>
        </div>

        {/* Placeholder inicial */}
        {!selectedStylistId && (
          <p className="text-sm text-[var(--color-muted)] py-10 text-center" style={{ fontFamily: "var(--font-body)" }}>
            Seleccioná un estilista para ver sus comisiones.
          </p>
        )}

        {isLoading && (
          <p className="text-sm text-[var(--color-muted)] tracking-widest" style={{ fontFamily: "var(--font-body)" }}>
            Cargando...
          </p>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3" style={{ fontFamily: "var(--font-body)" }}>
            {error}
          </div>
        )}

        {/* Resumen */}
        {!isLoading && summary && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Servicios",  value: summary.total_service_commissions },
              { label: "Productos",  value: summary.total_product_commissions },
              { label: "Total",      value: summary.total },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-[var(--color-rose-light)]/40 px-5 py-4 flex flex-col gap-1"
              >
                <p
                  className="text-xs tracking-widest uppercase text-[var(--color-muted)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.label}
                </p>
                <p
                  className="text-3xl text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  ${Number(item.value).toLocaleString("es-MX")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tabla detalle */}
        {!isLoading && commissions.length > 0 && (
          <div className="bg-white border border-[var(--color-rose-light)]/40 overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="border-b border-[var(--color-rose-light)]/40">
                  {["Tipo", "Referencia", "Porcentaje", "Monto", "Fecha"].map((col) => (
                    <th
                      key={col}
                      className="text-left text-xs tracking-widest uppercase text-[var(--color-muted)] px-5 py-3 font-normal"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--color-rose-light)]/20 hover:bg-[var(--color-cream)] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${
                          c.source_type === "service"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {SOURCE_LABELS[c.source_type]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)]">#{c.source_id}</td>
                    <td className="px-5 py-3 text-[var(--color-muted)]">{c.percentage}%</td>
                    <td className="px-5 py-3 text-[var(--color-charcoal)] font-medium">
                      ${Number(c.amount).toLocaleString("es-MX")}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)] whitespace-nowrap">
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
        )}

        {!isLoading && selectedStylistId && commissions.length === 0 && !error && (
          <p className="text-sm text-[var(--color-muted)] py-6 text-center" style={{ fontFamily: "var(--font-body)" }}>
            No se encontraron comisiones con los filtros seleccionados.
          </p>
        )}
      </div>
    </RoleGuard>
  );
}
