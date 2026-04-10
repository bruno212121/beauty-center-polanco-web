"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Servicios", href: "/servicios" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Galería", href: "/galeria" },
  { label: "Contacto", href: "/contacto" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[var(--color-cream)] border-b border-[var(--color-rose-light)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
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
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-widest uppercase text-[var(--color-charcoal)] hover:text-[var(--color-rose)] transition-colors duration-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reservar"
            className="ml-4 px-5 py-2 text-sm tracking-widest uppercase bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose-dark)] transition-colors duration-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Reservar
          </Link>
        </nav>

        {/* Hamburger mobile */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span
            className={`block w-6 h-px bg-[var(--color-charcoal)] transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-[6px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-[var(--color-charcoal)] transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-[var(--color-charcoal)] transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-[6px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Nav mobile */}
      {menuOpen && (
        <nav className="md:hidden border-t border-[var(--color-rose-light)] bg-[var(--color-cream)] px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-widest uppercase text-[var(--color-charcoal)] hover:text-[var(--color-rose)] transition-colors duration-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reservar"
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-5 py-2 text-sm tracking-widest uppercase text-center bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose-dark)] transition-colors duration-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Reservar
          </Link>
        </nav>
      )}
    </header>
  );
}
