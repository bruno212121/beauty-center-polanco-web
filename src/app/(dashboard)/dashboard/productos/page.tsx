"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Product, ProductCreate } from "@/types/product";

interface ProductForm {
  name: string;
  brand: string;
  category: string;
  price: string;
  stock: string;
  min_stock: string;
}

const EMPTY_FORM: ProductForm = {
  name: "", brand: "", category: "", price: "", stock: "", min_stock: "",
};

export default function ProductosPage() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeOnly) params.set("active_only", "true");
      if (lowStockOnly) params.set("low_stock_only", "true");
      setProducts(await api.get<Product[]>(`/products/?${params}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar productos.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly, lowStockOnly]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function handleField(key: keyof ProductForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleDialogChange(v: boolean) {
    setOpen(v);
    if (!v) { setForm(EMPTY_FORM); setFormError(null); }
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.price) {
      setFormError("Nombre y precio son obligatorios.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const body: ProductCreate = {
        name: form.name.trim(),
        price: Number(form.price),
        ...(form.brand.trim() && { brand: form.brand.trim() }),
        ...(form.category.trim() && { category: form.category.trim() }),
        ...(form.stock && { stock: Number(form.stock) }),
        ...(form.min_stock && { min_stock: Number(form.min_stock) }),
      };
      await api.post("/products/", body);
      handleDialogChange(false);
      fetchProducts();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inventario de productos del salón
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="accent-primary" />
            Solo activos
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="accent-primary" />
            Stock bajo
          </label>

          {user?.role === "admin" && (
            <Dialog open={open} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4" />Nuevo Producto</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Nuevo Producto</DialogTitle></DialogHeader>
                <div className="grid gap-4">
                  {formError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{formError}</p>
                  )}
                  <div className="grid gap-2">
                    <Label>Nombre <span className="text-red-400">*</span></Label>
                    <Input placeholder="Ej: Shampoo Hidratante" value={form.name} onChange={(e) => handleField("name", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Marca</Label>
                    <Input placeholder="Ej: L'Oréal" value={form.brand} onChange={(e) => handleField("brand", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoría</Label>
                    <Input placeholder="Ej: Keratina" value={form.category} onChange={(e) => handleField("category", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label>Precio <span className="text-red-400">*</span></Label>
                      <Input type="number" placeholder="280" value={form.price} onChange={(e) => handleField("price", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Stock</Label>
                      <Input type="number" placeholder="15" value={form.stock} onChange={(e) => handleField("stock", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Stock mín.</Label>
                      <Input type="number" placeholder="5" value={form.min_stock} onChange={(e) => handleField("min_stock", e.target.value)} />
                    </div>
                  </div>
                  <Button className="mt-1" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Producto"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando productos...</p>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">{error}</p>}

      {!isLoading && !error && (
        filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No se encontraron productos.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((prod) => {
              const lowStock = prod.stock <= prod.min_stock;
              return (
                <Card key={prod.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      {lowStock && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Stock bajo
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3">
                      <h3 className="font-medium text-foreground text-sm">{prod.name}</h3>
                      <p className="text-sm text-muted-foreground">{prod.brand ?? "—"}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm">
                        <span className={`font-medium ${lowStock ? "text-amber-600" : "text-foreground"}`}>
                          {prod.stock}
                        </span>
                        <span className="text-muted-foreground"> unidades</span>
                      </div>
                      <span className="text-lg font-semibold text-foreground">
                        ${Number(prod.price).toLocaleString("es-MX")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
