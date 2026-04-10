"use client";

import { useState } from "react";
import Link from "next/link";
import { Scissors, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LoginCredentials } from "@/types/auth";

export default function LoginPage() {
  const { login } = useAuth();

  const [form, setForm] = useState<LoginCredentials>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 401
            ? "Correo o contraseña incorrectos."
            : err.message
          : "Ocurrió un error. Intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Volver a inicio */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Beauty Center</p>
            <p className="text-xs text-muted-foreground">Polanco</p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede al panel de administración
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@ejemplo.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
