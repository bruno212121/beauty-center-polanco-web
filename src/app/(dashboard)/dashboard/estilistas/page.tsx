"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Stylist } from "@/types/stylist";

export default function EstilistasPage() {
  const { user } = useAuth();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStylists() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeOnly) params.set("active_only", "true");
        const data = await api.get<Stylist[]>(`/stylists/?${params}`);
        setStylists(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar estilistas.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStylists();
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
            Estilistas
          </h1>
        </div>

        <div className="flex items-center gap-5">
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

          {user?.role === "admin" && (
            <button
              className="px-5 py-2 text-sm tracking-widest uppercase bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose-dark)] transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-body)" }}
              disabled
              title="Próximamente"
            >
              + Nuevo
            </button>
          )}
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stylists.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] py-10 col-span-full text-center" style={{ fontFamily: "var(--font-body)" }}>
              No se encontraron estilistas.
            </p>
          ) : (
            stylists.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-[var(--color-rose-light)]/40 px-5 py-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-lg text-[var(--color-charcoal)]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {s.user.full_name}
                    </p>
                    <p
                      className="text-xs text-[var(--color-muted)] mt-0.5"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {s.user.email}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${
                      s.active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-[var(--color-cream)] text-[var(--color-muted)]"
                    }`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {s.active ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {s.specialty && (
                  <p
                    className="text-sm text-[var(--color-gold)]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {s.specialty}
                  </p>
                )}

                {/* Link a comisiones — solo admin */}
                {user?.role === "admin" && (
                  <Link
                    href={`/dashboard/comisiones?stylist_id=${s.id}`}
                    className="mt-1 text-xs tracking-widest uppercase text-[var(--color-muted)] hover:text-[var(--color-rose)] transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Ver comisiones →
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
