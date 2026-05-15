import Link from "next/link";
import { prisma } from "@/db/client";
import { getPublicRestaurantBySlug } from "@/lib/tenant";
import { formatMoneyArs } from "@/lib/utils";

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function PublicHome({
  params,
}: {
  params: { slug: string };
}) {
  const restaurant = await getPublicRestaurantBySlug(params.slug);
  const site = restaurant.siteContent;

  const [hours, featured, gallery] = await Promise.all([
    prisma.businessHours.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: [{ weekday: "asc" }, { openTime: "asc" }],
    }),
    prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id, featured: true, available: true },
      orderBy: { orderIndex: "asc" },
      take: 6,
      include: { category: { select: { name: true } } },
    }),
    prisma.mediaAsset.findMany({
      where: { restaurantId: restaurant.id, kind: "GALLERY" },
      orderBy: { orderIndex: "asc" },
      take: 6,
    }),
  ]);

  const hoursByDay = new Map<number, { openTime: string; closeTime: string }[]>();
  for (const h of hours) {
    const arr = hoursByDay.get(h.weekday) ?? [];
    arr.push({ openTime: h.openTime, closeTime: h.closeTime });
    hoursByDay.set(h.weekday, arr);
  }

  const base = `/${restaurant.slug}`;

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center"
        style={{
          backgroundImage: site?.heroImage
            ? `url(${site.heroImage})`
            : "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-3xl text-center px-4 py-24">
          <div className="w-16 h-px bg-gold mx-auto mb-8" />
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide mb-6">
            {site?.heroTitle ?? restaurant.name}
          </h1>
          {site?.heroSubtitle && (
            <p className="text-lg md:text-xl text-white/70 font-light tracking-wide mb-10 max-w-xl mx-auto">
              {site.heroSubtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`${base}/reservar`} className="pub-btn-gold">
              Reservar mesa
            </Link>
            <Link href={`${base}/menu`} className="pub-btn-outline">
              Ver la carta
            </Link>
          </div>
          <div className="w-16 h-px bg-gold mx-auto mt-10" />
        </div>
      </section>

      {/* ── Sobre nosotros ── */}
      {site?.aboutText && (
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-light">Nuestra historia</span>
            <h2 className="font-serif text-3xl md:text-4xl mt-4 mb-8">Sobre nosotros</h2>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-8" />
            <p className="text-th-text-muted leading-relaxed whitespace-pre-line text-base md:text-lg font-light">
              {site.aboutText}
            </p>
          </div>
        </section>
      )}

      {/* ── Galería ── */}
      {gallery.length > 0 && (
        <section className="py-16 bg-black/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-light">Galería</span>
              <h2 className="font-serif text-3xl md:text-4xl mt-4">Nuestro espacio</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {gallery.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <div
                  key={img.id}
                  className={`overflow-hidden ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt ?? `${restaurant.name} galería`}
                    className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Destacados ── */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-light">Lo mejor</span>
              <h2 className="font-serif text-3xl md:text-4xl mt-4">Platos destacados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((it) => (
                <article
                  key={it.id}
                  className="group bg-surface-elevated border border-th-border overflow-hidden hover:border-gold/30 transition-colors duration-300"
                >
                  {it.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.imageUrl}
                      alt={it.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="p-5">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-2">
                      {it.category.name}
                    </div>
                    <div className="font-serif text-lg">{it.name}</div>
                    {it.description && (
                      <p className="text-sm text-zinc-500 mt-2 line-clamp-2 font-light">
                        {it.description}
                      </p>
                    )}
                    <div className="mt-4 text-gold font-medium">
                      {formatMoneyArs(it.priceCents)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href={`${base}/menu`} className="pub-btn-outline">
                Ver toda la carta
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Horarios + Mapa ── */}
      <section className="py-20 md:py-28 bg-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Horarios */}
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-light">Visitanos</span>
              <h2 className="font-serif text-3xl md:text-4xl mt-4 mb-8">Horarios</h2>
              <div className="space-y-0">
                {Array.from({ length: 7 }).map((_, d) => {
                  const slots = hoursByDay.get(d) ?? [];
                  return (
                    <div
                      key={d}
                      className="flex items-center justify-between py-3 border-b border-th-border"
                    >
                      <span className="text-sm font-light">{WEEKDAYS[d]}</span>
                      <span className="text-sm text-th-text-muted font-light">
                        {slots.length === 0
                          ? "Cerrado"
                          : slots
                              .map((s) => `${s.openTime} – ${s.closeTime}`)
                              .join("  ·  ")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {restaurant.address && (
                <div className="mt-8">
                  <div className="flex items-start gap-3 text-th-text-muted">
                    <svg className="w-5 h-5 text-gold mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-sm font-light">{restaurant.address}</span>
                  </div>
                </div>
              )}

              {restaurant.phone && (
                <div className="mt-3">
                  <div className="flex items-center gap-3 text-th-text-muted">
                    <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <span className="text-sm font-light">{restaurant.phone}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mapa + Reservar */}
            <div className="flex flex-col justify-center gap-6">
              {site?.addressMapUrl && (
                <div className="aspect-[4/3] w-full overflow-hidden border border-th-border">
                  <iframe
                    src={site.addressMapUrl}
                    className="w-full h-full grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
              <div className={site?.addressMapUrl ? "" : "flex items-center justify-center h-full"}>
                <Link href={`${base}/reservar`} className="pub-btn-gold">
                  Reservar ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-20 md:py-28 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="w-16 h-px bg-gold mx-auto mb-8" />
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Te esperamos</h2>
          <p className="text-th-text-muted font-light mb-10">
            Reservá tu mesa y disfrutá de una experiencia gastronómica única.
          </p>
          <Link href={`${base}/reservar`} className="pub-btn-gold">
            Reservar mesa
          </Link>
          <div className="w-16 h-px bg-gold mx-auto mt-10" />
        </div>
      </section>
    </>
  );
}
