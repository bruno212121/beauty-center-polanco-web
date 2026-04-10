"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
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
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "Correo o contraseña incorrectos."
            : err.message,
        );
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Decoración */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[var(--color-rose-light)]/20 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[var(--color-gold-light)]/20 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Card */}
      <div className="relative bg-white border border-[var(--color-rose-light)]/50 shadow-sm px-8 py-10 flex flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-2xl tracking-widest text-[var(--color-rose-dark)] uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Beauty Center
          </span>
          <span
            className="text-xs tracking-[0.35em] text-[var(--color-gold)] uppercase"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Polanco
          </span>
          <div className="mt-4 w-8 h-px bg-[var(--color-rose-light)]" />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1
            className="text-3xl text-[var(--color-charcoal)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Iniciar sesión
          </h1>
          <p
            className="text-sm text-[var(--color-muted)] mt-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Accede al panel de administración
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Error */}
          {error && (
            <div
              className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs tracking-widest uppercase text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="border border-[var(--color-rose-light)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-rose)] transition-colors placeholder:text-[var(--color-muted)]/60"
              style={{ fontFamily: "var(--font-body)" }}
              placeholder="admin@ejemplo.com"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs tracking-widest uppercase text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full border border-[var(--color-rose-light)] bg-[var(--color-cream)] px-4 py-2.5 pr-12 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-rose)] transition-colors placeholder:text-[var(--color-muted)]/60"
                style={{ fontFamily: "var(--font-body)" }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-charcoal)] transition-colors text-xs"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 text-sm tracking-widest uppercase bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose-dark)] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
