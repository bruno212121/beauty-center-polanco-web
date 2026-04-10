"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Sale } from "@/types/sale";

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSales() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<Sale[]>("/sales/");
        setSales(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar ventas.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSales();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
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
          Ventas
        </h1>
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
        <div className="flex flex-col gap-3">
          {sales.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] py-10 text-center" style={{ fontFamily: "var(--font-body)" }}>
              No se encontraron ventas.
            </p>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white border border-[var(--color-rose-light)]/40"
              >
                {/* Fila principal */}
                <button
                  onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--color-cream)] transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <span
                      className="text-xs tracking-widest text-[var(--color-muted)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      #{sale.id}
                    </span>
                    <span
                      className="text-sm text-[var(--color-charcoal)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Cliente #{sale.client_id}
                      {sale.stylist_id && (
                        <span className="text-[var(--color-muted)] ml-2">
                          · Estilista #{sale.stylist_id}
                        </span>
                      )}
                    </span>
                    <span
                      className="text-xs text-[var(--color-muted)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {new Date(sale.created_at).toLocaleString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-base font-medium text-[var(--color-charcoal)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      ${Number(sale.total_amount).toLocaleString("es-MX")} MXN
                    </span>
                    <span className="text-[var(--color-muted)] text-xs">
                      {expanded === sale.id ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {/* Detalle de items */}
                {expanded === sale.id && (
                  <div className="border-t border-[var(--color-rose-light)]/30 px-5 py-3">
                    <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
                      <thead>
                        <tr>
                          {["Producto", "Marca", "Cantidad", "Precio unit.", "Subtotal"].map((col) => (
                            <th
                              key={col}
                              className="text-left text-xs tracking-widest uppercase text-[var(--color-muted)] pb-2 font-normal pr-4"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items.map((item) => (
                          <tr key={item.id} className="border-t border-[var(--color-rose-light)]/20">
                            <td className="py-2 pr-4 text-[var(--color-charcoal)]">{item.product.name}</td>
                            <td className="py-2 pr-4 text-[var(--color-muted)]">{item.product.brand ?? "—"}</td>
                            <td className="py-2 pr-4 text-[var(--color-muted)]">{item.quantity}</td>
                            <td className="py-2 pr-4 text-[var(--color-muted)]">
                              ${Number(item.unit_price).toLocaleString("es-MX")}
                            </td>
                            <td className="py-2 text-[var(--color-charcoal)] font-medium">
                              ${Number(item.subtotal).toLocaleString("es-MX")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
