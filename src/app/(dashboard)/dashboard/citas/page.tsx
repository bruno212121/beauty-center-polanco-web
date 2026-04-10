"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled:   "Agendada",
  in_progress: "En curso",
  completed:   "Completada",
  cancelled:   "Cancelada",
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  scheduled:   "bg-blue-50 text-blue-600",
  in_progress: "bg-amber-50 text-amber-600",
  completed:   "bg-emerald-50 text-emerald-600",
  cancelled:   "bg-[var(--color-cream)] text-[var(--color-muted)]",
};

const STATUS_OPTIONS: { value: AppointmentStatus | ""; label: string }[] = [
  { value: "",            label: "Todos los estados" },
  { value: "scheduled",   label: "Agendadas" },
  { value: "in_progress", label: "En curso" },
  { value: "completed",   label: "Completadas" },
  { value: "cancelled",   label: "Canceladas" },
];

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("appointment_status", statusFilter);
        const data = await api.get<Appointment[]>(`/appointments/?${params}`);
        setAppointments(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar citas.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAppointments();
  }, [statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p
            className="text-xs tracking-[0.3em] uppercase text-[var(--color-gold)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Dashboard
          </p>
          <h1
            className="text-4xl text-[var(--color-charcoal)] mt-0.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Citas
          </h1>
        </div>

        {/* Filtro de estado */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "")}
          className="border border-[var(--color-rose-light)] bg-white px-4 py-2 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-rose)] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

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

      {!isLoading && !error && (
        <div className="bg-white border border-[var(--color-rose-light)]/40 overflow-x-auto">
          {appointments.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] px-6 py-10 text-center" style={{ fontFamily: "var(--font-body)" }}>
              No se encontraron citas.
            </p>
          ) : (
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="border-b border-[var(--color-rose-light)]/40">
                  {["Cliente", "Servicio", "Estilista", "Inicio", "Fin", "Estado"].map((col) => (
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
                {appointments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[var(--color-rose-light)]/20 hover:bg-[var(--color-cream)] transition-colors"
                  >
                    <td className="px-5 py-3 text-[var(--color-charcoal)] font-medium">
                      {a.client.full_name}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)]">
                      {a.service.name}
                      <span className="ml-1 text-[11px] text-[var(--color-muted)]/60">
                        ({a.service.duration_minutes} min)
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)]">
                      #{a.stylist_id}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)] whitespace-nowrap">
                      {new Date(a.start_time).toLocaleString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)] whitespace-nowrap">
                      {new Date(a.end_time).toLocaleString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${STATUS_STYLES[a.status]}`}
                      >
                        {STATUS_LABELS[a.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
