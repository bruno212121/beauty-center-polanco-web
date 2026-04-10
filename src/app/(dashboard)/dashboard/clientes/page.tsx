"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Client } from "@/types/client";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchClients() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ skip: "0", limit: "100" });
        if (search.trim()) params.set("search", search.trim());
        const data = await api.get<Client[]>(`/clients/?${params}`);
        setClients(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar clientes.");
      } finally {
        setIsLoading(false);
      }
    }

    const timeout = setTimeout(fetchClients, search ? 300 : 0);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

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
            Clientes
          </h1>
        </div>

        {/* Buscador */}
        <input
          type="search"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[var(--color-rose-light)] bg-white px-4 py-2 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-rose)] transition-colors placeholder:text-[var(--color-muted)]/60 w-64"
          style={{ fontFamily: "var(--font-body)" }}
        />
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

      {/* Tabla */}
      {!isLoading && !error && (
        <div className="bg-white border border-[var(--color-rose-light)]/40 overflow-x-auto">
          {clients.length === 0 ? (
            <p
              className="text-sm text-[var(--color-muted)] px-6 py-10 text-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No se encontraron clientes.
            </p>
          ) : (
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="border-b border-[var(--color-rose-light)]/40">
                  {["Nombre", "Teléfono", "Email", "Registro"].map((col) => (
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
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--color-rose-light)]/20 hover:bg-[var(--color-cream)] transition-colors"
                  >
                    <td className="px-5 py-3 text-[var(--color-charcoal)] font-medium">
                      {c.full_name}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)]">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)]">
                      {c.email ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)]">
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
          )}
        </div>
      )}
    </div>
  );
}
