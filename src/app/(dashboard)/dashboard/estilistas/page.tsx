"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Stylist, StylistCreate } from "@/types/stylist";
import type { Appointment } from "@/types/appointment";

/* ─── Helpers ─── */

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", receptionist: "Recepción", stylist: "Estilista",
};

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

/* ─── Form types ─── */

interface CreateForm {
  full_name: string;
  specialty: string;
  active: boolean;
}

interface EditForm {
  full_name: string;
  specialty: string;
  active: boolean;
}

const EMPTY_CREATE: CreateForm = { full_name: "", specialty: "", active: true };

/* ─── Page ─── */

export default function EstilistasPage() {
  const { user: currentUser } = useAuth();

  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [citasPorEstilista, setCitasPorEstilista] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Dialog crear */
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  /* Dialog editar */
  const [editOpen, setEditOpen] = useState(false);
  const [editingEst, setEditingEst] = useState<Stylist | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ full_name: "", specialty: "", active: true });
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeOnly) params.set("active_only", "true");
      const [stylistsData, scheduledData, inProgressData] = await Promise.all([
        api.get<Stylist[]>(`/stylists/?${params}`),
        api.get<Appointment[]>("/appointments/?appointment_status=scheduled"),
        api.get<Appointment[]>("/appointments/?appointment_status=in_progress"),
      ]);
      const todayMap: Record<number, number> = {};
      [...scheduledData, ...inProgressData]
        .filter((a) => isToday(a.start_time))
        .forEach((a) => { todayMap[a.stylist_id] = (todayMap[a.stylist_id] ?? 0) + 1; });
      setStylists(stylistsData);
      setCitasPorEstilista(todayMap);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar estilistas.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Crear ── */
  function handleCreateDialogChange(v: boolean) {
    setCreateOpen(v);
    if (!v) { setCreateForm(EMPTY_CREATE); setCreateError(null); }
  }

  async function handleCreate() {
    if (!createForm.full_name.trim()) { setCreateError("El nombre completo es obligatorio."); return; }
    setIsCreating(true);
    setCreateError(null);
    try {
      const slug = createForm.full_name.trim().toLowerCase().replace(/\s+/g, ".");
      const uid = Math.random().toString(36).slice(2, 8);
      const autoEmail = `${slug}.${uid}@interno.salon`;
      const autoPassword = crypto.randomUUID();
      const newUser = await api.post<{ id: number }>("/users/", {
        full_name: createForm.full_name.trim(),
        email: autoEmail,
        password: autoPassword,
        role: "stylist",
      });
      const body: StylistCreate = {
        user_id: newUser.id,
        ...(createForm.specialty.trim() && { specialty: createForm.specialty.trim() }),
        active: createForm.active,
      };
      await api.post("/stylists/", body);
      handleCreateDialogChange(false);
      fetchData();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Error al guardar el estilista.");
    } finally {
      setIsCreating(false);
    }
  }

  /* ── Editar ── */
  function openEdit(est: Stylist) {
    setEditingEst(est);
    setEditForm({
      full_name: est.user.full_name,
      specialty: est.specialty ?? "",
      active: est.active,
    });
    setEditError(null);
    setEditOpen(true);
  }

  function handleEditDialogChange(v: boolean) {
    setEditOpen(v);
    if (!v) { setEditingEst(null); setEditError(null); }
  }

  async function handleEdit() {
    if (!editingEst) return;
    if (!editForm.full_name.trim()) { setEditError("El nombre es obligatorio."); return; }
    setIsEditing(true);
    setEditError(null);
    try {
      // Cambios en el perfil de estilista
      const stylistPatch: { specialty?: string; active?: boolean } = {};
      if (editForm.specialty !== (editingEst.specialty ?? "")) stylistPatch.specialty = editForm.specialty.trim();
      if (editForm.active !== editingEst.active) stylistPatch.active = editForm.active;

      // Cambios en el usuario
      const userPatch: { full_name?: string } = {};
      if (editForm.full_name.trim() !== editingEst.user.full_name) userPatch.full_name = editForm.full_name.trim();

      await Promise.all([
        Object.keys(stylistPatch).length > 0 ? api.patch(`/stylists/${editingEst.id}`, stylistPatch) : Promise.resolve(),
        Object.keys(userPatch).length > 0 ? api.patch(`/users/${editingEst.user.id}`, userPatch) : Promise.resolve(),
      ]);

      handleEditDialogChange(false);
      fetchData();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Error al guardar los cambios.");
    } finally {
      setIsEditing(false);
    }
  }

  /* ── Filtrado ── */
  const filtered = stylists.filter(
    (s) =>
      s.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.specialty ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Estilistas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestiona tu equipo de trabajo</p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="accent-primary" />
            Solo activos
          </label>

          {currentUser?.role === "admin" && (
            <Dialog open={createOpen} onOpenChange={handleCreateDialogChange}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4" />Nuevo Estilista</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Nuevo Estilista</DialogTitle></DialogHeader>
                <div className="grid gap-4">
                  {createError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{createError}</p>
                  )}
                  <div className="grid gap-2">
                    <Label>Nombre completo <span className="text-red-400">*</span></Label>
                    <Input placeholder="Ej: Carlos Ruiz" value={createForm.full_name} onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Especialidad</Label>
                    <Input placeholder="Ej: Colorimetría" value={createForm.specialty} onChange={(e) => setCreateForm((f) => ({ ...f, specialty: e.target.value }))} />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground">Estilista activo</p>
                      <p className="text-xs text-muted-foreground">Visible en agendas y listas del salón</p>
                    </div>
                    <Switch
                      checked={createForm.active}
                      onCheckedChange={(v) => setCreateForm((f) => ({ ...f, active: v }))}
                    />
                  </div>
                  <Button className="mt-1" onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Creando estilista..." : "Crear Estilista"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Dialog Editar */}
      <Dialog open={editOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Estilista</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            {editError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{editError}</p>
            )}
            <div className="grid gap-2">
              <Label>Nombre completo <span className="text-red-400">*</span></Label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Especialidad</Label>
              <Input placeholder="Ej: Colorimetría" value={editForm.specialty} onChange={(e) => setEditForm((f) => ({ ...f, specialty: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">Estilista activo</p>
                <p className="text-xs text-muted-foreground">Visible en agendas y listas del salón</p>
              </div>
              <Switch
                checked={editForm.active}
                onCheckedChange={(v) => setEditForm((f) => ({ ...f, active: v }))}
              />
            </div>
            <div className="flex gap-2 mt-1">
              <Button variant="outline" className="flex-1" onClick={() => handleEditDialogChange(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleEdit} disabled={isEditing}>
                {isEditing ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar estilistas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando estilistas...</p>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">{error}</p>}

      {/* Grid */}
      {!isLoading && !error && (
        filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No se encontraron estilistas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((est) => (
              <Card key={est.id} className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                          {getInitials(est.user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{est.user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{est.specialty ?? "Sin especialidad"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {currentUser?.role === "admin" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(est)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Badge
                        variant="secondary"
                        className={est.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}
                      >
                        {est.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-accent/50 p-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{citasPorEstilista[est.id] ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Citas hoy</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {ROLE_LABELS[est.user.role] ?? est.user.role}
                      </p>
                      <p className="text-xs text-muted-foreground">Rol</p>
                    </div>
                    <div className="text-center">
                      {currentUser?.role === "admin" ? (
                        <Link href={`/dashboard/comisiones?stylist_id=${est.id}`} className="text-sm font-semibold text-primary hover:underline">
                          Ver →
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-muted-foreground">—</p>
                      )}
                      <p className="text-xs text-muted-foreground">Comisiones</p>
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
