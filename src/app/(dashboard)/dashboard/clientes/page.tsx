"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Phone, Mail, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiError } from "@/lib/api";
import type { Client, ClientCreate } from "@/types/client";

/* ─── Helpers ─── */

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/* ─── Formulario ─── */

interface ClientForm {
  full_name: string;
  phone: string;
  email: string;
  preferences: string;
  allergies: string;
  notes: string;
}

const EMPTY_FORM: ClientForm = {
  full_name: "", phone: "", email: "", preferences: "", allergies: "", notes: "",
};

function clientToForm(c: Client): ClientForm {
  return {
    full_name:   c.full_name,
    phone:       c.phone ?? "",
    email:       c.email ?? "",
    preferences: c.preferences ?? "",
    allergies:   c.allergies ?? "",
    notes:       c.notes ?? "",
  };
}

function ClientFormFields({
  form,
  formError,
  onFieldChange,
}: {
  form: ClientForm;
  formError: string | null;
  onFieldChange: (key: keyof ClientForm, value: string) => void;
}) {
  return (
    <>
      {formError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {formError}
        </p>
      )}
      <div className="grid gap-2">
        <Label>Nombre completo <span className="text-red-400">*</span></Label>
        <Input
          placeholder="Ej: María García"
          value={form.full_name}
          onChange={(e) => onFieldChange("full_name", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Teléfono</Label>
          <Input
            placeholder="55 1234 5678"
            value={form.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="email@ejemplo.com"
            value={form.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Preferencias</Label>
        <Textarea
          placeholder="Ej: Le gusta el corte con capas..."
          value={form.preferences}
          onChange={(e) => onFieldChange("preferences", e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label>Alergias</Label>
        <Textarea
          placeholder="Ej: Alérgica al amoniaco..."
          value={form.allergies}
          onChange={(e) => onFieldChange("allergies", e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label>Notas internas</Label>
        <Textarea
          placeholder="Cualquier información adicional..."
          value={form.notes}
          onChange={(e) => onFieldChange("notes", e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>
    </>
  );
}

/* ─── Page ─── */

export default function ClientesPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Dialog crear */
  const [createOpen, setCreateOpen] = useState(false);
  /* Dialog editar */
  const [editOpen, setEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Cargar clientes ── */
  const fetchClients = useCallback(async (query = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ skip: "0", limit: "200" });
      if (query.trim()) params.set("search", query.trim());
      setClients(await api.get<Client[]>(`/clients/?${params}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar clientes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchClients(search), search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [search, fetchClients]);

  /* ── Handlers compartidos ── */
  function handleField(key: keyof ClientForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setCreateOpen(true);
  }

  function openEdit(c: Client) {
    setEditingClient(c);
    setForm(clientToForm(c));
    setFormError(null);
    setEditOpen(true);
  }

  function closeCreate(v: boolean) {
    setCreateOpen(v);
    if (!v) { setForm(EMPTY_FORM); setFormError(null); }
  }

  function closeEdit(v: boolean) {
    setEditOpen(v);
    if (!v) { setEditingClient(null); setForm(EMPTY_FORM); setFormError(null); }
  }

  /* ── Crear ── */
  async function handleCreate() {
    if (!form.full_name.trim()) { setFormError("El nombre del cliente es obligatorio."); return; }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const body: ClientCreate = {
        full_name: form.full_name.trim(),
        ...(form.phone.trim()       && { phone: form.phone.trim() }),
        ...(form.email.trim()       && { email: form.email.trim() }),
        ...(form.preferences.trim() && { preferences: form.preferences.trim() }),
        ...(form.allergies.trim()   && { allergies: form.allergies.trim() }),
        ...(form.notes.trim()       && { notes: form.notes.trim() }),
      };
      await api.post("/clients/", body);
      closeCreate(false);
      fetchClients(search);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Editar ── */
  async function handleEdit() {
    if (!editingClient) return;
    if (!form.full_name.trim()) { setFormError("El nombre del cliente es obligatorio."); return; }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const orig = clientToForm(editingClient);
      const patch: Partial<ClientCreate> = {};
      if (form.full_name   !== orig.full_name)   patch.full_name   = form.full_name.trim();
      if (form.phone       !== orig.phone)       patch.phone       = form.phone.trim();
      if (form.email       !== orig.email)       patch.email       = form.email.trim();
      if (form.preferences !== orig.preferences) patch.preferences = form.preferences.trim();
      if (form.allergies   !== orig.allergies)   patch.allergies   = form.allergies.trim();
      if (form.notes       !== orig.notes)       patch.notes       = form.notes.trim();
      await api.patch(`/clients/${editingClient.id}`, patch);
      closeEdit(false);
      fetchClients(search);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra la información de tus clientes
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Dialog Crear */}
      <Dialog open={createOpen} onOpenChange={closeCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nuevo Cliente</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <ClientFormFields form={form} formError={formError} onFieldChange={handleField} />
            <Button className="mt-1" onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={editOpen} onOpenChange={closeEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <ClientFormFields form={form} formError={formError} onFieldChange={handleField} />
            <div className="flex gap-2 mt-1">
              <Button variant="outline" className="flex-1" onClick={() => closeEdit(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleEdit} disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar clientes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando clientes...</p>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">{error}</p>}

      {/* Grid */}
      {!isLoading && !error && (
        clients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No se encontraron clientes.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((cliente) => (
              <Card key={cliente.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                          {getInitials(cliente.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{cliente.full_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Desde {formatDate(cliente.created_at)}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/clientes/${cliente.id}`)}
                        >
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/citas?client_id=${cliente.id}`)}
                        >
                          Nueva cita
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(cliente)}>
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2">
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                    {cliente.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        {cliente.phone}
                      </div>
                    )}
                    {!cliente.email && !cliente.phone && (
                      <p className="text-xs text-muted-foreground">Sin datos de contacto</p>
                    )}
                  </div>

                  {(cliente.notes || cliente.allergies) && (
                    <p className="mt-3 rounded-md bg-accent/50 p-2 text-xs text-muted-foreground line-clamp-2">
                      {cliente.allergies ? `⚠ ${cliente.allergies}` : cliente.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
