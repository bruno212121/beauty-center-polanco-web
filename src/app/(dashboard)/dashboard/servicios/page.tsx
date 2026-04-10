"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Clock, DollarSign, Pencil } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Service, ServiceCreate, ServiceUpdate } from "@/types/service";

const CATEGORIES = ["Cabello", "Uñas", "Peinados", "Maquillaje", "Corporales", "Faciales"];

const CATEGORY_COLORS: Record<string, string> = {
  Cabello:    "bg-primary/15 text-primary",
  Uñas:       "bg-rose-100 text-rose-700",
  Peinados:   "bg-amber-100 text-amber-700",
  Maquillaje: "bg-violet-100 text-violet-700",
  Corporales: "bg-cyan-100 text-cyan-700",
  Faciales:   "bg-emerald-100 text-emerald-700",
};

interface ServiceForm {
  name: string;
  category: string;
  price: string;
  duration_minutes: string;
  description: string;
}

const EMPTY_FORM: ServiceForm = {
  name: "", category: "", price: "", duration_minutes: "", description: "",
};

interface EditServiceForm {
  name: string;
  category: string;
  price: string;
  duration_minutes: string;
  description: string;
  active: boolean;
}

export default function ServiciosPage() {
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState<EditServiceForm>({
    name: "",
    category: "",
    price: "",
    duration_minutes: "",
    description: "",
    active: true,
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeOnly) params.set("active_only", "true");
      setServices(await api.get<Service[]>(`/services/?${params}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar servicios.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  function handleField(key: keyof ServiceForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleDialogChange(v: boolean) {
    setOpen(v);
    if (!v) { setForm(EMPTY_FORM); setFormError(null); }
  }

  function openEdit(serv: Service) {
    setEditing(serv);
    setEditForm({
      name: serv.name,
      category: serv.category,
      price: String(Number(serv.price)),
      duration_minutes: String(serv.duration_minutes),
      description: serv.description ?? "",
      active: serv.active,
    });
    setEditError(null);
    setEditOpen(true);
  }

  function handleEditDialogChange(v: boolean) {
    setEditOpen(v);
    if (!v) {
      setEditing(null);
      setEditError(null);
    }
  }

  async function handleEditSave() {
    if (!editing) return;
    if (!editForm.name.trim()) {
      setEditError("El nombre es obligatorio.");
      return;
    }
    const priceNum = Number(editForm.price);
    const durationNum = Number(editForm.duration_minutes);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setEditError("El precio debe ser un número mayor que 0.");
      return;
    }
    if (!Number.isInteger(durationNum) || durationNum <= 0) {
      setEditError("La duración debe ser un entero mayor que 0 (minutos).");
      return;
    }

    const patch: ServiceUpdate = {};
    if (editForm.name.trim() !== editing.name) patch.name = editForm.name.trim();
    if (editForm.category !== editing.category) patch.category = editForm.category || null;
    if (durationNum !== editing.duration_minutes) patch.duration_minutes = durationNum;
    if (priceNum !== Number(editing.price)) patch.price = priceNum;
    const nextDesc = editForm.description.trim() || null;
    if (nextDesc !== (editing.description ?? null)) patch.description = nextDesc;
    if (editForm.active !== editing.active) patch.active = editForm.active;

    if (Object.keys(patch).length === 0) {
      setEditError("No hay cambios para guardar.");
      return;
    }

    setIsEditing(true);
    setEditError(null);
    try {
      await api.patch<Service>(`/services/${editing.id}`, patch);
      handleEditDialogChange(false);
      fetchServices();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Error al guardar los cambios.");
    } finally {
      setIsEditing(false);
    }
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.category || !form.price || !form.duration_minutes) {
      setFormError("Nombre, categoría, precio y duración son obligatorios.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const body: ServiceCreate = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes),
        ...(form.description.trim() && { description: form.description.trim() }),
        active: true,
      };
      await api.post("/services/", body);
      handleDialogChange(false);
      fetchServices();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Servicios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catálogo de servicios del salón
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="accent-primary" />
            Solo activos
          </label>

          {user?.role === "admin" && (
            <Dialog open={open} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4" />Nuevo Servicio</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Nuevo Servicio</DialogTitle></DialogHeader>
                <div className="grid gap-4">
                  {formError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{formError}</p>
                  )}
                  <div className="grid gap-2">
                    <Label>Nombre <span className="text-red-400">*</span></Label>
                    <Input placeholder="Ej: Corte de Cabello" value={form.name} onChange={(e) => handleField("name", e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoría <span className="text-red-400">*</span></Label>
                    <Select value={form.category} onValueChange={(v) => handleField("category", v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Precio <span className="text-red-400">*</span></Label>
                      <Input type="number" placeholder="350" value={form.price} onChange={(e) => handleField("price", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Duración (min) <span className="text-red-400">*</span></Label>
                      <Input type="number" placeholder="45" value={form.duration_minutes} onChange={(e) => handleField("duration_minutes", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Descripción</Label>
                    <Input placeholder="Descripción opcional..." value={form.description} onChange={(e) => handleField("description", e.target.value)} />
                  </div>
                  <Button className="mt-1" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Servicio"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Editar servicio (solo admin) */}
      <Dialog open={editOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {editError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{editError}</p>
            )}
            <div className="grid gap-2">
              <Label>Nombre <span className="text-red-400">*</span></Label>
              <Input
                placeholder="Ej: Corte de cabello"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Categoría <span className="text-red-400">*</span></Label>
              <Select
                value={editForm.category}
                onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.concat(
                    editing && !CATEGORIES.includes(editing.category) ? [editing.category] : [],
                  ).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Precio <span className="text-red-400">*</span></Label>
                <Input
                  type="number"
                  min={1}
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Duración (min) <span className="text-red-400">*</span></Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={editForm.duration_minutes}
                  onChange={(e) => setEditForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Input
                placeholder="Opcional"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">Servicio activo</p>
                <p className="text-xs text-muted-foreground">Visible al agendar y en el catálogo</p>
              </div>
              <Switch
                checked={editForm.active}
                onCheckedChange={(v) => setEditForm((f) => ({ ...f, active: v }))}
              />
            </div>
            <div className="flex gap-2 mt-1">
              <Button variant="outline" className="flex-1" type="button" onClick={() => handleEditDialogChange(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" type="button" onClick={handleEditSave} disabled={isEditing}>
                {isEditing ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar servicios..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando servicios...</p>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">{error}</p>}

      {!isLoading && !error && (
        filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No se encontraron servicios.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((serv) => (
              <Card key={serv.id} className="border-border/50 transition-colors hover:bg-accent/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm truncate">{serv.name}</h3>
                      <Badge
                        variant="secondary"
                        className={`mt-2 ${CATEGORY_COLORS[serv.category] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {serv.category}
                      </Badge>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {user?.role === "admin" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" type="button" onClick={() => openEdit(serv)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Badge
                        variant="secondary"
                        className={
                          serv.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }
                      >
                        {serv.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  {serv.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{serv.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {serv.duration_minutes} min
                    </div>
                    <div className="flex items-center gap-0.5 text-xl font-semibold text-foreground">
                      <DollarSign className="h-4 w-4" />
                      {Number(serv.price).toLocaleString("es-MX")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
