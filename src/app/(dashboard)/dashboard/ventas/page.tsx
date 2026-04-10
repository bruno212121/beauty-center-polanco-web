"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api";
import type { Sale, SaleCreate } from "@/types/sale";
import type { Client } from "@/types/client";
import type { Stylist } from "@/types/stylist";
import type { Product } from "@/types/product";

interface CartItem {
  product: Product;
  quantity: number;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clientMap, setClientMap] = useState<Record<number, string>>({});
  const [stylistMap, setStylistMap] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Dialog */
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingDialog, setLoadingDialog] = useState(false);

  /* Cart form */
  const [clientId, setClientId] = useState("");
  const [stylistId, setStylistId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ─── Fetch data ─── */
  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [salesData, clientsData, stylistsData] = await Promise.all([
        api.get<Sale[]>("/sales/"),
        api.get<Client[]>("/clients/"),
        api.get<Stylist[]>("/stylists/"),
      ]);
      setSales(salesData);
      setClientMap(Object.fromEntries(clientsData.map((c) => [c.id, c.full_name])));
      setStylistMap(Object.fromEntries(stylistsData.map((s) => [s.id, s.user.full_name])));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar ventas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  /* ─── Dialog open ─── */
  async function handleDialogOpen(v: boolean) {
    setOpen(v);
    if (v) {
      setLoadingDialog(true);
      try {
        const [c, s, p] = await Promise.all([
          api.get<Client[]>("/clients/"),
          api.get<Stylist[]>("/stylists/?active_only=true"),
          api.get<Product[]>("/products/?active_only=true"),
        ]);
        setClients(c);
        setStylists(s);
        setProducts(p);
      } catch {
        /* silently ignore — user will still see form */
      } finally {
        setLoadingDialog(false);
      }
    } else {
      setClientId("");
      setStylistId("");
      setSelectedProductId("");
      setQty("1");
      setCart([]);
      setFormError(null);
    }
  }

  /* ─── Cart actions ─── */
  function addToCart() {
    const product = products.find((p) => p.id === Number(selectedProductId));
    if (!product) return;
    const n = Math.max(1, Number(qty) || 1);
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + n } : i,
        );
      }
      return [...prev, { product, quantity: n }];
    });
    setSelectedProductId("");
    setQty("1");
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  const cartTotal = cart.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0,
  );

  /* ─── Submit ─── */
  async function handleSubmit() {
    if (cart.length === 0) {
      setFormError("Agregá al menos un producto.");
      return;
    }
    if (!clientId) {
      setFormError("Seleccioná un cliente.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const body: SaleCreate = {
        client_id: Number(clientId),
        ...(stylistId && { stylist_id: Number(stylistId) }),
        items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      };
      await api.post("/sales/", body);
      handleDialogOpen(false);
      fetchSales();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Error al registrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ─── Filters ─── */
  const filtered = sales.filter((v) => {
    const clientName = (clientMap[v.client_id] ?? "").toLowerCase();
    const productNames = v.items.map((i) => i.product.name.toLowerCase()).join(" ");
    const q = search.toLowerCase();
    return clientName.includes(q) || productNames.includes(q);
  });

  const totalHoy = sales
    .filter((v) => isToday(v.created_at))
    .reduce((acc, v) => acc + Number(v.total_amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ventas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registro de ventas de productos
          </p>
        </div>

        <Dialog open={open} onOpenChange={handleDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" />Nueva Venta</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Nueva Venta</DialogTitle></DialogHeader>

            {loadingDialog ? (
              <p className="text-sm text-muted-foreground py-4">Cargando datos...</p>
            ) : (
              <div className="grid gap-4">
                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{formError}</p>
                )}

                {/* Cliente */}
                <div className="grid gap-2">
                  <Label>Cliente <span className="text-red-400">*</span></Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Estilista */}
                <div className="grid gap-2">
                  <Label>Estilista <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Select value={stylistId} onValueChange={setStylistId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar estilista" /></SelectTrigger>
                    <SelectContent>
                      {stylists.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.user.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Agregar producto */}
                <div className="grid gap-2">
                  <Label>Agregar Producto</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} — ${Number(p.price).toLocaleString("es-MX")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="w-16 text-center"
                      placeholder="1"
                    />
                    <Button
                      variant="outline"
                      onClick={addToCart}
                      disabled={!selectedProductId}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Carrito */}
                {cart.length > 0 && (
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <div className="bg-accent/30 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Artículos en el carrito
                    </div>
                    <div className="divide-y divide-border/40">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × ${Number(item.product.price).toLocaleString("es-MX")}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-2">
                            <span className="text-sm font-semibold text-foreground">
                              ${(item.quantity * Number(item.product.price)).toLocaleString("es-MX")}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center px-3 py-2 bg-accent/20 font-semibold text-sm">
                      <span>Total</span>
                      <span className="text-foreground">${cartTotal.toLocaleString("es-MX")}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="mt-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? "Registrando..." : "Registrar Venta"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumen del día */}
      <Card className="border-border/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ventas de Hoy</p>
              <p className="text-2xl font-semibold text-foreground">
                ${totalHoy.toLocaleString("es-MX")}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar ventas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando ventas...</p>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">{error}</p>}

      {!isLoading && !error && (
        filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No se encontraron ventas.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((venta) => {
              const clientName = clientMap[venta.client_id] ?? `Cliente #${venta.client_id}`;
              const stylistName = venta.stylist_id ? (stylistMap[venta.stylist_id] ?? `Estilista #${venta.stylist_id}`) : null;
              return (
                <Card key={venta.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {fmtDate(venta.created_at)}
                            {stylistName && ` · ${stylistName}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-semibold text-foreground">
                          ${Number(venta.total_amount).toLocaleString("es-MX")}
                        </p>
                        <div className="mt-1 flex flex-wrap justify-end gap-1">
                          {venta.items.map((item) => (
                            <Badge key={item.id} variant="secondary" className="text-xs">
                              {item.product.name} × {item.quantity}
                            </Badge>
                          ))}
                        </div>
                      </div>
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
