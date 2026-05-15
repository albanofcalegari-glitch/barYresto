import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  const adminUrl = process.env.ADMIN_URL ?? "";
  const platformUrl = process.env.PLATFORM_URL ?? "";
  const loginUrl = adminUrl ? `${adminUrl}/login` : "/login";
  const platformLoginUrl = platformUrl ? `${platformUrl}/login` : "/login";

  return (
    <main className="min-h-screen bg-surface text-white font-sans overflow-hidden">
      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-brand-500/10">
        <div className="mx-auto max-w-7xl px-6 md:px-[8%] h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="md" />
          </Link>
          <nav className="flex items-center gap-6">
            <a
              href={loginUrl}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Ingresar
            </a>
            <a
              href={adminUrl ? `${adminUrl}/registro` : "/registro"}
              className="hidden sm:inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all hover:-translate-y-px shadow-glow hover:shadow-glow-lg"
            >
              Empezar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background images grid */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-1 opacity-[0.12]">
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=60"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative overflow-hidden hidden md:block">
            <Image
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=60"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=60"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=60"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="relative overflow-hidden hidden md:block">
            <Image
              src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=60"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=60"
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/90 to-surface" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,92,252,0.08)_0%,transparent_70%)]" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400 font-medium tracking-wide">Plataforma activa</span>
          </div>

          <h1 className="font-heading font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95]">
            <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">Restaurantes</span>
            <span className="text-brand-400"> & </span>
            <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">Bares.</span>
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">Una sola plataforma.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-zinc-400 font-light leading-relaxed">
            Sitio web, carta por QR, reservas, salón y cobros. Simple, en español,
            pensado para Argentina y LATAM.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={adminUrl ? `${adminUrl}/registro` : "/registro"}
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-heading font-semibold px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-px shadow-glow hover:shadow-glow-lg"
            >
              Registra tu restaurante
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-brand-500/30 text-zinc-300 hover:text-white font-heading font-medium px-8 py-4 rounded-xl text-base transition-all"
            >
              Conocer mas
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 flex justify-center gap-12 md:gap-20">
            {[
              { value: "100%", label: "Digital" },
              { value: "0", label: "Comisiones" },
              { value: "24/7", label: "Reservas" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-heading font-bold text-2xl md:text-3xl bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs text-zinc-500 mt-1 tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,92,252,0.05)_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-[8%]">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm font-heading font-semibold tracking-widest uppercase mb-3">Funcionalidades</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">
              Todo lo que necesitas
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Reservas",
                body: "Reservas web + WhatsApp con control de cupo y confirmacion automatica.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: "Salon y mozos",
                body: "Abri mesas y carga pedidos desde el celular.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
              },
              {
                title: "Carta QR",
                body: "Tu carta online y por QR, siempre actualizada. Sin apps que instalar.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                title: "Cobros",
                body: "Efectivo, tarjeta, transferencia y Mercado Pago integrado.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                ),
              },
              {
                title: "Reportes",
                body: "Ventas, productos top y reservas. Todo en tiempo real.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                ),
              },
              {
                title: "Multi-tenant",
                body: "Cada restaurante con su propio sitio, carta y configuracion.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                ),
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-white/[0.03] border border-brand-500/[0.08] rounded-xl p-6 hover:border-brand-500/25 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 group-hover:bg-brand-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(124,92,252,0.08)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-5xl tracking-tight mb-6">
            Lleva tu local al{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
              siguiente nivel
            </span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Registrate, configura tu restaurante y empeza a recibir reservas en minutos.
          </p>
          <a
            href={adminUrl ? `${adminUrl}/registro` : "/registro"}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-heading font-semibold px-10 py-4 rounded-xl text-base transition-all hover:-translate-y-px shadow-glow hover:shadow-glow-lg"
          >
            Comenzar ahora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-brand-500/10 py-10">
        <div className="mx-auto max-w-7xl px-6 md:px-[8%] flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" />

          <div className="text-sm text-zinc-600 flex items-center gap-1.5">
            Un producto de{" "}
            <a
              href="https://qngine.com.ar"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-heading font-semibold transition-colors"
            >
              <span className="bg-gradient-to-r from-brand-500 to-brand-300 bg-clip-text text-transparent">Q</span>ngine
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={platformLoginUrl}
              className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
            >
              Plataforma
            </a>
            <span className="text-xs text-zinc-700">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
