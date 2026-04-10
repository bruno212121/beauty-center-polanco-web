"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Clock, Eye } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentCreate,
  AppointmentUpdate,
} from "@/types/appointment";
import type { Client } from "@/types/client";
import type { Service } from "@/types/service";
import type { Stylist } from "@/types/stylist";

/* ─── Estilos por estado ─── */

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled:   "Agendada",
  in_progress: "En curso",
  completed:   "Completada",
  cancelled:   "Cancelada",
};

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled:   "bg-emerald-100 text-emerald-700",
  in_progress: "bg-primary/15 text-primary",
  completed:   "bg-slate-100 text-slate-700",
  cancelled:   "bg-red-50 text-red-400",
};

function normNotes(n: string | null | undefined): string | null {
  const t = (n ?? "").trim();
  return t.length > 0 ? t : null;
}

const STATUS_ACTIONS: Record<
  AppointmentStatus,
  { status: AppointmentStatus; label: string; cancelStyle?: boolean }[]
> = {
  scheduled: [
    { status: "in_progress", label: "Marcar en curso" },
    { status: "cancelled", label: "Cancelar cita", cancelStyle: true },
  ],
  in_progress: [
    { status: "completed", label: "Completar cita" },
    { status: "cancelled", label: "Cancelar cita", cancelStyle: true },
  ],
  completed: [],
  cancelled: [],
};

function stylistDisplayName(
  s: Appointment["stylist"],
  nameByStylistId: Record<number, string>,
): string {
  return (
    s.user?.full_name ??
    s.full_name ??
    nameByStylistId[s.id] ??
    `Estilista #${s.id}`
  );
}

/* ─── Formulario ─── */

interface AppointmentForm {
  client_id: string;
  service_id: string;
  stylist_id: string;
  fecha: string;
  hora: string;
  notes: string;
}

const EMPTY_FORM: AppointmentForm = {
  client_id: "",
  service_id: "",
  stylist_id: "",
  fecha: "",
  hora: "",
  notes: "",
};

/* ─── Page ─── */

export default function CitasPage() {
  const { user } = useAuth();
  const canManageAppointments =
    user?.role === "admin" || user?.role === "receptionist";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [formDataLoading, setFormDataLoading] = useState(false);
  const [form, setForm] = useState<AppointmentForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [detailActionError, setDetailActionError] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [stylistNameById, setStylistNameById] = useState<Record<number, string>>({});

  /* ── Nombres de estilistas (el detalle de cita a veces no trae user.full_name) ── */
  useEffect(() => {
    api
      .get<Stylist[]>("/stylists/")
      .then((list) =>
        setStylistNameById(
          Object.fromEntries(list.map((st) => [st.id, st.user.full_name])),
        ),
      )
      .catch(() => null);
  }, []);

  /* ── Cargar citas ── */
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<Appointment[]>("/appointments/");
      data.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
      );
      setAppointments(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al cargar citas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function loadAppointmentDetail(id: number) {
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    try {
      const a = await api.get<Appointment>(`/appointments/${id}`);
      setDetail(a);
      setNotesDraft(a.notes ?? "");
    } catch (err) {
      setDetailError(
        err instanceof ApiError ? err.message : "No se pudo cargar la cita.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function reloadAppointmentInPlace(id: number) {
    try {
      const a = await api.get<Appointment>(`/appointments/${id}`);
      setDetail(a);
      setNotesDraft(a.notes ?? "");
      setDetailError(null);
    } catch (err) {
      setDetailActionError(
        err instanceof ApiError ? err.message : "No se pudo actualizar el detalle.",
      );
    }
  }

  function openDetail(id: number) {
    setDetailActionError(null);
    setDetailOpen(true);
    void loadAppointmentDetail(id);
  }

  function handleDetailOpenChange(v: boolean) {
    setDetailOpen(v);
    if (!v) {
      setDetail(null);
      setDetailError(null);
      setDetailActionError(null);
      setNotesDraft("");
    }
  }

  async function refreshDetailAndList(id: number) {
    await fetchAppointments();
    if (detailOpen) await reloadAppointmentInPlace(id);
  }

  async function handleSaveNotes() {
    if (!detail || !canManageAppointments) return;
    const next = normNotes(notesDraft);
    const prev = normNotes(detail.notes);
    if (next === prev) return;
    setSavingNotes(true);
    setDetailActionError(null);
    try {
      const body: AppointmentUpdate = { notes: next };
      await api.patch<Appointment>(`/appointments/${detail.id}`, body);
      await refreshDetailAndList(detail.id);
    } catch (err) {
      setDetailActionError(
        err instanceof ApiError ? err.message : "Error al guardar las notas.",
      );
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleStatusChange(next: AppointmentStatus) {
    if (!detail || !canManageAppointments) return;
    setChangingStatus(true);
    setDetailActionError(null);
    try {
      await api.patch<Appointment>(`/appointments/${detail.id}`, {
        status: next,
      });
      await refreshDetailAndList(detail.id);
    } catch (err) {
      setDetailActionError(
        err instanceof ApiError ? err.message : "Error al actualizar el estado.",
      );
    } finally {
      setChangingStatus(false);
    }
  }

  const notesDirty =
    detail != null && normNotes(notesDraft) !== normNotes(detail.notes);

  /* ── Cargar datos del formulario cuando se abre el dialog ── */
  useEffect(() => {
    if (!open) return;
    setFormDataLoading(true);
    Promise.all([
      api.get<Client[]>("/clients/?skip=0&limit=200"),
      api.get<Service[]>("/services/?active_only=true"),
      api.get<Stylist[]>("/stylists/?active_only=true"),
    ])
      .then(([c, s, st]) => {
        setClients(c);
        setServices(s);
        setStylists(st);
      })
      .catch(() => null)
      .finally(() => setFormDataLoading(false));
  }, [open]);

  /* ── Handlers ── */
  function handleField(key: keyof AppointmentForm, value: string) {
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
    if (!form.client_id || !form.service_id || !form.fecha || !form.hora) {
      setFormError("Cliente, servicio, fecha y hora son obligatorios.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const body: AppointmentCreate = {
        client_id: Number(form.client_id),
        service_id: Number(form.service_id),
        start_time: `${form.fecha}T${form.hora}:00`,
        ...(form.stylist_id && { stylist_id: Number(form.stylist_id) }),
        ...(form.notes.trim() && { notes: form.notes.trim() }),
      };
      await api.post("/appointments/", body);
      handleDialogChange(false);
      fetchAppointments();
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Error al crear la cita.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Filtrado ── */
  const filtered = appointments.filter(
    (a) =>
      a.client.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.service.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Citas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona las citas de tus clientes
          </p>
        </div>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Nueva Cita
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Cita</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  {formError}
                </p>
              )}

              {/* Cliente */}
              <div className="grid gap-2">
                <Label>
                  Cliente <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={form.client_id}
                  onValueChange={(v) => handleField("client_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formDataLoading ? "Cargando..." : "Seleccionar cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Servicio */}
              <div className="grid gap-2">
                <Label>
                  Servicio <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={form.service_id}
                  onValueChange={(v) => handleField("service_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formDataLoading ? "Cargando..." : "Seleccionar servicio"} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estilista */}
              <div className="grid gap-2">
                <Label>Estilista</Label>
                <Select
                  value={form.stylist_id}
                  onValueChange={(v) => handleField("stylist_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formDataLoading ? "Cargando..." : "Seleccionar estilista (opcional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {stylists.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha y hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Fecha <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => handleField("fecha", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    Hora <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={form.hora}
                    onChange={(e) => handleField("hora", e.target.value)}
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="grid gap-2">
                <Label>Notas</Label>
                <Input
                  placeholder="Notas opcionales..."
                  value={form.notes}
                  onChange={(e) => handleField("notes", e.target.value)}
                />
              </div>

              <Button
                className="mt-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Agendando..." : "Agendar Cita"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={detailOpen} onOpenChange={handleDetailOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de la cita</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Cliente, servicio, horario y estado de la reserva.
            </p>
          </DialogHeader>

          {detailLoading && (
            <p className="text-sm text-muted-foreground py-6">Cargando...</p>
          )}
          {detailError && !detailLoading && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {detailError}
            </p>
          )}

          {detail && !detailLoading && (
            <div className="grid gap-4">
              {detailActionError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  {detailActionError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary" className={STATUS_BADGE[detail.status]}>
                  {STATUS_LABELS[detail.status]}
                </Badge>
                <span className="text-lg font-semibold text-foreground">
                  $
                  {Number(detail.total_amount ?? detail.service.price).toLocaleString("es-MX")}
                </span>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Cliente
                  </p>
                  <p className="font-medium text-foreground">{detail.client.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Servicio
                  </p>
                  <p className="font-medium text-foreground">{detail.service.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {detail.service.category} · {detail.service.duration_minutes} min
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Estilista
                  </p>
                  <p className="font-medium text-foreground">
                    {stylistDisplayName(detail.stylist, stylistNameById)}
                  </p>
                  {detail.stylist.specialty && (
                    <p className="text-muted-foreground text-xs mt-0.5">{detail.stylist.specialty}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Inicio
                    </p>
                    <p className="text-foreground">
                      {new Date(detail.start_time).toLocaleString("es-MX", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Fin
                    </p>
                    <p className="text-foreground">
                      {new Date(detail.end_time).toLocaleString("es-MX", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {canManageAppointments && STATUS_ACTIONS[detail.status].length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Cambiar estado</Label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_ACTIONS[detail.status].map((a) => (
                      <Button
                        key={a.status}
                        type="button"
                        size="sm"
                        variant={a.cancelStyle ? "outline" : "default"}
                        disabled={changingStatus || savingNotes}
                        className={
                          a.cancelStyle
                            ? "border-red-200 text-red-700 hover:bg-red-50"
                            : undefined
                        }
                        onClick={() => void handleStatusChange(a.status)}
                      >
                        {changingStatus ? "…" : a.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {!canManageAppointments && (
                <p className="text-xs text-muted-foreground">
                  Solo administración o recepción pueden modificar el estado y las notas de la cita.
                </p>
              )}

              <div className="grid gap-2">
                <Label htmlFor="cita-notas">Notas</Label>
                <Textarea
                  id="cita-notas"
                  placeholder="Notas internas sobre la cita..."
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  readOnly={!canManageAppointments}
                  className={!canManageAppointments ? "bg-muted/50" : undefined}
                />
                {canManageAppointments && (
                  <Button
                    type="button"
                    size="sm"
                    className="w-fit"
                    disabled={!notesDirty || savingNotes || changingStatus}
                    onClick={() => void handleSaveNotes()}
                  >
                    {savingNotes ? "Guardando..." : "Guardar notas"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente o servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Estados */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Cargando citas...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      {/* Lista */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No se encontraron citas.
            </p>
          ) : (
            filtered.map((cita) => {
              const fecha = new Date(cita.start_time).toLocaleDateString(
                "es-MX",
                { day: "2-digit", month: "short", year: "numeric" },
              );
              const hora = new Date(cita.start_time).toLocaleTimeString(
                "es-MX",
                { hour: "2-digit", minute: "2-digit", hour12: false },
              );

              return (
                <Card
                  key={cita.id}
                  className="border-border/50 transition-colors hover:bg-accent/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-primary">
                            {hora}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm">
                            {cita.client.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {cita.service.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fecha} · {cita.service.duration_minutes} min
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Ver detalle"
                          onClick={() => openDetail(cita.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Badge
                          variant="secondary"
                          className={STATUS_BADGE[cita.status]}
                        >
                          {STATUS_LABELS[cita.status]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
