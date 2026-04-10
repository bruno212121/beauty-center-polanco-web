import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[90vh] bg-[var(--color-cream)] overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[55%] h-full bg-[var(--color-rose-light)]/20" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-[var(--color-gold)]/30" />
          <div className="absolute top-20 right-20 w-24 h-24 rounded-full border border-[var(--color-rose)]/30" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-6">
          <p
            className="text-xs tracking-[0.4em] uppercase text-[var(--color-gold)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Polanco · Ciudad de México
          </p>

          <h1
            className="text-5xl md:text-7xl text-[var(--color-charcoal)] leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            El arte de cuidarte,
            <br />
            <em className="text-[var(--color-rose)]">redefinido.</em>
          </h1>

          <p
            className="max-w-md text-base md:text-lg text-[var(--color-muted)] leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Tratamientos de belleza y bienestar diseñados para realzar tu
            esencia natural, en un espacio de lujo discreto en el corazón de
            Polanco.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href="/reservar"
              className="px-8 py-3 text-sm tracking-widest uppercase bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose-dark)] transition-colors duration-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Reservar cita
            </Link>
            <Link
              href="/servicios"
              className="px-8 py-3 text-sm tracking-widest uppercase border border-[var(--color-charcoal)] text-[var(--color-charcoal)] hover:border-[var(--color-rose)] hover:text-[var(--color-rose)] transition-colors duration-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Franja de servicios destacados */}
      <section className="bg-[var(--color-charcoal)] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p
            className="text-center text-xs tracking-[0.4em] uppercase text-[var(--color-gold)] mb-10"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Nuestros servicios
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Faciales", icon: "✦" },
              { name: "Corporales", icon: "✦" },
              { name: "Uñas", icon: "✦" },
              { name: "Pestañas", icon: "✦" },
            ].map((s) => (
              <div
                key={s.name}
                className="flex flex-col items-center gap-3 py-8 border border-white/10 hover:border-[var(--color-rose-light)]/50 transition-colors duration-300 cursor-pointer"
              >
                <span className="text-[var(--color-gold)] text-lg">{s.icon}</span>
                <span
                  className="text-white text-sm tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[var(--color-cream)]">
        <div className="max-w-xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2
            className="text-4xl md:text-5xl text-[var(--color-charcoal)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Agenda tu visita hoy
          </h2>
          <p
            className="text-[var(--color-muted)] leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Nuestro equipo está listo para recibirte. Reserva en línea o
            contáctanos directamente.
          </p>
          <Link
            href="/reservar"
            className="px-10 py-3 text-sm tracking-widest uppercase bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose-dark)] transition-colors duration-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Reservar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
