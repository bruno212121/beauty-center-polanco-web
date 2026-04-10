"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Service } from "@/types/service";

export default function ServiciosPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeOnly) params.set("active_only", "true");
        const data = await api.get<Service[]>(`/services/?${params}`);
        setServices(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar servicios.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchServices();
  }, [activeOnly]);

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
            Servicios
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle activos */}
          <label
            className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer select-none"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="accent-[var(--color-rose)]"
            />
            Solo activos
          </label>

          {/* Crear — solo admin */}
          {user?.role === "admin" && (
            <button
              className="px-5 py-2 text-sm tracking-widest uppercase bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose-dark)] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
              disabled
              title="Próximamente"
            >
              + Nuevo
            </button>
          )}
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <p
          className="text-sm text-[var(--color-muted)] tracking-widest"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Cargando...
        </p>
      )}

      {/* Error */}
      {error && (
        <div
          className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {error}
        </div>
      )}

      {/* Grid de servicios */}
      {!isLoading && !error && (
        <>
          {services.length === 0 ? (
            <p
              className="text-sm text-[var(--color-muted)] py-10 text-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No se encontraron servicios.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-[var(--color-rose-light)]/40 px-5 py-5 flex flex-col gap-3"
                >
                  {/* Badge categoría + estado */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] tracking-widest uppercase text-[var(--color-gold)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {s.category}
                    </span>
                    {!s.active && (
                      <span
                        className="text-[10px] tracking-widest uppercase text-[var(--color-muted)] bg-[var(--color-cream)] px-2 py-0.5"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        Inactivo
                      </span>
                    )}
                  </div>

                  {/* Nombre */}
                  <p
                    className="text-xl text-[var(--color-charcoal)] leading-snug"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {s.name}
                  </p>

                  {/* Descripción */}
                  {s.description && (
                    <p
                      className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {s.description}
                    </p>
                  )}

                  {/* Duración + precio */}
                  <div
                    className="flex items-center justify-between pt-2 border-t border-[var(--color-rose-light)]/30 text-sm"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <span className="text-[var(--color-muted)]">
                      {s.duration_minutes} min
                    </span>
                    <span className="text-[var(--color-charcoal)] font-medium">
                      ${Number(s.price).toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
