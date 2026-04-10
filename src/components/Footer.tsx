import Link from "next/link";

const serviceLinks = [
  { label: "Faciales", href: "/servicios#faciales" },
  { label: "Corporales", href: "/servicios#corporales" },
  { label: "Uñas", href: "/servicios#unas" },
  { label: "Maquillaje", href: "/servicios#maquillaje" },
  { label: "Extensiones de pestañas", href: "/servicios#pestanas" },
];

const infoLinks = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Galería", href: "/galeria" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
  { label: "Reservar cita", href: "/reservar" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-charcoal)] text-white/80">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col leading-none">
            <span
              className="text-xl tracking-widest text-[var(--color-rose-light)] uppercase"
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
          </div>
          <p
            className="text-sm text-white/60 leading-relaxed max-w-xs"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Espacio de belleza y bienestar en el corazón de Polanco,
            Ciudad de México.
          </p>
          <div
            className="flex flex-col gap-1 text-sm text-white/60 mt-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span>Presidente Masaryk 123, Polanco</span>
            <span>Ciudad de México, CDMX</span>
            <a
              href="tel:+525555555555"
              className="mt-1 hover:text-[var(--color-gold)] transition-colors"
            >
              +52 55 5555 5555
            </a>
            <a
              href="mailto:hola@beautycenterpolanco.mx"
              className="hover:text-[var(--color-gold)] transition-colors"
            >
              hola@beautycenterpolanco.mx
            </a>
          </div>
        </div>

        {/* Servicios */}
        <div>
          <h4
            className="text-xs tracking-[0.3em] uppercase text-[var(--color-gold)] mb-5"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Servicios
          </h4>
          <ul className="flex flex-col gap-2">
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Información */}
        <div>
          <h4
            className="text-xs tracking-[0.3em] uppercase text-[var(--color-gold)] mb-5"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Información
          </h4>
          <ul className="flex flex-col gap-2">
            {infoLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Horario */}
          <div className="mt-6">
            <h4
              className="text-xs tracking-[0.3em] uppercase text-[var(--color-gold)] mb-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Horario
            </h4>
            <p
              className="text-sm text-white/60 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Lun – Vie: 9:00 – 20:00<br />
              Sáb: 9:00 – 18:00<br />
              Dom: 10:00 – 15:00
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div
          className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/40"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <span>© {new Date().getFullYear()} Beauty Center Polanco. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-white/70 transition-colors">
              Aviso de privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white/70 transition-colors">
              Términos y condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
