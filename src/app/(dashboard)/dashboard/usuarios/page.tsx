"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Plus, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoleGuard from "@/components/RoleGuard";
import { api, ApiError } from "@/lib/api";
import type { Role } from "@/types/auth";

/* ─── Types ─── */

interface SystemUser {
  id: number;
  full_name: string;
  email: string;
  role: Role;
}

interface UserForm {
  full_name: string;
  email: string;
  password: string;
  role: string;
}

const EMPTY_FORM: UserForm = {
  full_name: "", email: "", password: "", role: "receptionist",
};

const ROLE_LABELS: Record<string, string> = {
  admin:        "Admin",
  receptionist: "Recepcionista",
};

const ROLE_BADGE: Record<string, string> = {
  admin:        "bg-primary/15 text-primary",
  receptionist: "bg-emerald-100 text-emerald-700",
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

/* ─── Page ─── */

export default function UsuariosPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Dialog */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ─── Fetch ─── */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await api.get<SystemUser[]>("/users/");
      setUsers(all.filter((u) => u.role === "admin" || u.role === "receptionist"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar usuarios.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ─── Dialog helpers ─── */
  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setOpen(true);
  }

  function openEdit(u: SystemUser) {
    setEditing(u);
    setForm({ full_name: u.full_name, email: u.email, password: "", role: u.role });
    setFormError(null);
    setOpen(true);
  }

  function handleDialogChange(v: boolean) {
    setOpen(v);
    if (!v) { setForm(EMPTY_FORM); setFormError(null); setEditing(null); }
  }

  function handleField(key: keyof UserForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* ─── Submit ─── */
  async function handleSubmit() {
    if (!form.full_name.trim()) { setFormError("El nombre es obligatorio."); return; }
    if (!form.email.trim())     { setFormError("El email es obligatorio."); return; }
    if (!editing && form.password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editing) {
        // PATCH — solo envía los campos modificados
        const patch: Partial<UserForm> = {};
        if (form.full_name.trim() !== editing.full_name) patch.full_name = form.full_name.trim();
        if (form.email.trim() !== editing.email)         patch.email = form.email.trim();
        if (form.role !== editing.role)                  patch.role = form.role;
        await api.patch(`/users/${editing.id}`, patch);
      } else {
        await api.post("/users/", {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }
      handleDialogChange(false);
      fetchUsers();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ─── Filter ─── */
  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <RoleGuard
      allowed={["admin"]}
      fallback={<p className="text-sm text-muted-foreground">No tenés acceso a esta sección.</p>}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestiona los accesos al sistema
            </p>
          </div>

          <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
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
                    placeholder="Ej: María López"
                    value={form.full_name}
                    onChange={(e) => handleField("full_name", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Email <span className="text-red-400">*</span></Label>
                  <Input
                    type="email"
                    placeholder="correo@salon.com"
                    value={form.email}
                    onChange={(e) => handleField("email", e.target.value)}
                  />
                </div>

                {!editing && (
                  <div className="grid gap-2">
                    <Label>Contraseña <span className="text-red-400">*</span></Label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={(e) => handleField("password", e.target.value)}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Rol <span className="text-red-400">*</span></Label>
                  <Select value={form.role} onValueChange={(v) => handleField("role", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="receptionist">Recepcionista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={() => handleDialogChange(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting
                      ? "Guardando..."
                      : editing ? "Guardar Cambios" : "Crear Usuario"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Buscador */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Cargando usuarios...</p>}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">{error}</p>
        )}

        {/* Lista de usuarios */}
        {!isLoading && !error && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Usuarios del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No se encontraron usuarios.
                  </p>
                ) : (
                  filtered.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary shrink-0">
                          {getInitials(u.full_name)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{u.full_name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={ROLE_BADGE[u.role] ?? "bg-slate-100 text-slate-600"}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roles del sistema */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Roles del sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className={ROLE_BADGE.admin}>Admin</Badge>
              <p className="text-muted-foreground">
                Acceso total: gestiona usuarios, estilistas, citas, clientes, servicios, productos, ventas y comisiones.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className={ROLE_BADGE.receptionist}>Recepcionista</Badge>
              <p className="text-muted-foreground">
                Acceso operativo: crea citas, ventas y gestiona clientes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
