"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Stylist, StylistCreate } from "@/types/stylist";
import type { Appointment } from "@/types/appointment";

/* ─── Helpers ─── */

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  admin:        "Admin",
  receptionist: "Recepción",
  stylist:      "Estilista",
};

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/* ─── Formulario ─── */

interface StylistForm {
  full_name: string;
  specialty: string;
  active: boolean;
}

const EMPTY_FORM: StylistForm = { full_name: "", specialty: "", active: true };

/* ─── Page ─── */

export default function EstilistasPage() {
  const { user: currentUser } = useAuth();

  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [citasPorEstilista, setCitasPorEstilista] = useState<
    Record<number, number>
  >({});
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StylistForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Cargar estilistas + citas de hoy en paralelo ── */
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

      // Contar citas de hoy por estilista
      const todayMap: Record<number, number> = {};
      [...scheduledData, ...inProgressData]
        .filter((a) => isToday(a.start_time))
        .forEach((a) => {
          todayMap[a.stylist_id] = (todayMap[a.stylist_id] ?? 0) + 1;
        });

      setStylists(stylistsData);
      setCitasPorEstilista(todayMap);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al cargar estilistas.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Handlers ── */
  function handleField<K extends keyof StylistForm>(
    key: K,
    value: StylistForm[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleDialogChange(v: boolean) {
    setOpen(v);
    if (!v) {
      setForm(EMPTY_FORM);
      setFormError(null);
    }
  }

  async function handleSubmit() {
    if (!form.full_name.trim()) {
      setFormError("El nombre completo es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Generar email y contraseña internos (el estilista no inicia sesión)
      const slug = form.full_name.trim().toLowerCase().replace(/\s+/g, ".");
      const uid = Math.random().toString(36).slice(2, 8);
      const autoEmail = `${slug}.${uid}@interno.salon`;
      const autoPassword = crypto.randomUUID();

      // Paso 1: crear usuario con rol "stylist"
      const newUser = await api.post<{ id: number }>("/users/", {
        full_name: form.full_name.trim(),
        email: autoEmail,
        password: autoPassword,
        role: "stylist",
      });

      // Paso 2: crear perfil de estilista usando el id recién creado
      const body: StylistCreate = {
        user_id: newUser.id,
        ...(form.specialty.trim() && { specialty: form.specialty.trim() }),
        active: form.active,
      };
      await api.post("/stylists/", body);

      handleDialogChange(false);
      fetchData();
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Error al guardar el estilista.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Filtrado frontend ── */
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
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tu equipo de trabajo
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label
            className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="accent-primary"
            />
            Solo activos
          </label>

          {currentUser?.role === "admin" && (
            <Dialog open={open} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  Nuevo Estilista
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuevo Estilista</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                  {formError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                      {formError}
                    </p>
                  )}

                  <div className="grid gap-2">
                    <Label>Nombre completo <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="Ej: Carlos Ruiz"
                      value={form.full_name}
                      onChange={(e) => handleField("full_name", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Especialidad</Label>
                    <Input
                      placeholder="Ej: Colorimetría"
                      value={form.specialty}
                      onChange={(e) => handleField("specialty", e.target.value)}
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => handleField("active", e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-foreground">Activo</span>
                  </label>

                  <Button
                    className="mt-1"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creando estilista..." : "Crear Estilista"}
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
        <Input
          placeholder="Buscar estilistas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Estados */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Cargando estilistas...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      {/* Grid */}
      {!isLoading && !error && (
        <>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No se encontraron estilistas.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((est) => (
                <Card key={est.id} className="border-border/50">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                            {getInitials(est.user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {est.user.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {est.specialty ?? "Sin especialidad"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          est.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }
                      >
                        {est.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-accent/50 p-3">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">
                          {citasPorEstilista[est.id] ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Citas hoy
                        </p>
                      </div>
                      <div className="text-center border-x border-border/50">
                        <p className="text-sm font-semibold text-foreground capitalize">
                          {ROLE_LABELS[est.user.role] ?? est.user.role}
                        </p>
                        <p className="text-xs text-muted-foreground">Rol</p>
                      </div>
                      <div className="text-center">
                        {currentUser?.role === "admin" ? (
                          <Link
                            href={`/dashboard/comisiones?stylist_id=${est.id}`}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            Ver →
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-muted-foreground">
                            —
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Comisiones
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
