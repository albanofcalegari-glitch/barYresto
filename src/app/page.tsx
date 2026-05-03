import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl text-gold tracking-wide">
          baryresto
        </Link>
        <nav className="flex gap-3">
          <Link
            href="/login"
            className="text-sm uppercase tracking-widest text-zinc-400 hover:text-gold transition-colors px-4 py-2"
          >
            Ingresar
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-32 text-center">
        <div className="w-16 h-px bg-gold mx-auto mb-10" />
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-wide leading-tight">
          Todo el restaurante.
          <br />
          <span className="text-gold">Una sola plataforma.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400 font-light leading-relaxed">
          Sitio web, carta por QR, reservas, salón y cobros. Simple, en español,
          pensado para Argentina y LATAM.
        </p>
        <div className="mt-12 flex justify-center gap-4">
          <Link href="/login" className="pub-btn-gold text-base px-8 py-4">
            Acceso para restaurantes
          </Link>
        </div>
        <div className="w-16 h-px bg-gold mx-auto mt-12" />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-28 grid gap-8 md:grid-cols-3">
        {[
          {
            title: "Reservas",
            body: "Reservas web + WhatsApp con control de cupo y confirmación automática.",
            icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
          },
          {
            title: "Salón y mozos",
            body: "Abrí mesas, cargá pedidos y cobrá desde el celular en segundos.",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
          },
          {
            title: "Carta QR",
            body: "Tu carta online y por QR, siempre actualizada. Sin apps que instalar.",
            icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white/5 border border-white/10 p-8 hover:border-gold/30 transition-colors duration-300"
          >
            <svg className="w-8 h-8 text-gold mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={f.icon} />
            </svg>
            <h3 className="font-serif text-xl mb-3">{f.title}</h3>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} baryresto
      </footer>
    </main>
  );
}
