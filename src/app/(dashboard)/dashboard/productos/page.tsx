"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

export default function ProductosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeOnly) params.set("active_only", "true");
        if (lowStockOnly) params.set("low_stock_only", "true");
        const data = await api.get<Product[]>(`/products/?${params}`);
        setProducts(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError("Error al cargar productos.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [activeOnly, lowStockOnly]);

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
            Productos
          </h1>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
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

          <label
            className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer select-none"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="accent-[var(--color-rose)]"
            />
            Stock bajo
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
        <div className="bg-white border border-[var(--color-rose-light)]/40 overflow-x-auto">
          {products.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] px-6 py-10 text-center" style={{ fontFamily: "var(--font-body)" }}>
              No se encontraron productos.
            </p>
          ) : (
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="border-b border-[var(--color-rose-light)]/40">
                  {["Nombre", "Marca", "Categoría", "Precio", "Stock", "Estado"].map((col) => (
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
                {products.map((p) => {
                  const isLowStock = p.stock <= p.min_stock;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[var(--color-rose-light)]/20 hover:bg-[var(--color-cream)] transition-colors"
                    >
                      <td className="px-5 py-3 text-[var(--color-charcoal)] font-medium">
                        {p.name}
                      </td>
                      <td className="px-5 py-3 text-[var(--color-muted)]">{p.brand ?? "—"}</td>
                      <td className="px-5 py-3 text-[var(--color-muted)]">{p.category ?? "—"}</td>
                      <td className="px-5 py-3 text-[var(--color-charcoal)]">
                        ${Number(p.price).toLocaleString("es-MX")}
                      </td>
                      <td className="px-5 py-3">
                        <span className={isLowStock ? "text-red-500 font-medium" : "text-[var(--color-charcoal)]"}>
                          {p.stock}
                          {isLowStock && (
                            <span className="ml-1 text-[10px] tracking-widest uppercase text-red-400">
                              bajo
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${
                            p.active
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-[var(--color-cream)] text-[var(--color-muted)]"
                          }`}
                        >
                          {p.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
