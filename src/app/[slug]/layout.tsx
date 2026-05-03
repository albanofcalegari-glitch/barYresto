import Link from "next/link";
import { getPublicRestaurantBySlug } from "@/lib/tenant";
import { MobileNav } from "./mobile-nav";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const restaurant = await getPublicRestaurantBySlug(params.slug);
  return {
    title: restaurant.name,
    description:
      restaurant.siteContent?.heroSubtitle ??
      `Conocé el menú y reservá en ${restaurant.name}.`,
  };
}

export default async function PublicSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const restaurant = await getPublicRestaurantBySlug(params.slug);
  const base = `/${restaurant.slug}`;
  const site = restaurant.siteContent;

  const waLink = restaurant.whatsappPhone
    ? `https://wa.me/${restaurant.whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola ${restaurant.name}, quería consultar por una reserva.`,
      )}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={base} className="font-serif text-xl sm:text-2xl tracking-wide text-gold">
            {restaurant.name}
          </Link>
          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-8 text-sm uppercase tracking-widest font-light">
            <Link href={base} className="hover:text-gold transition-colors">
              Inicio
            </Link>
            <Link href={`${base}/menu`} className="hover:text-gold transition-colors">
              Carta
            </Link>
            <Link href={`${base}/reservar`} className="hover:text-gold transition-colors">
              Reservar
            </Link>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            )}
          </nav>

          {/* Mobile nav */}
          <MobileNav
            items={[
              { href: base, label: "Inicio" },
              { href: `${base}/menu`, label: "Carta" },
              { href: `${base}/reservar`, label: "Reservar" },
              ...(waLink ? [{ href: waLink, label: "WhatsApp", external: true }] : []),
            ]}
          />
        </div>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="font-serif text-2xl text-gold mb-3">{restaurant.name}</div>
              {restaurant.address && (
                <p className="text-sm text-zinc-400 leading-relaxed">{restaurant.address}</p>
              )}
              {restaurant.phone && (
                <p className="text-sm text-zinc-400 mt-2">Tel: {restaurant.phone}</p>
              )}
            </div>

            {/* Hours summary */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gold mb-3">Horarios</h3>
              {site?.openingInfo ? (
                <p className="text-sm text-zinc-400 whitespace-pre-line leading-relaxed">
                  {site.openingInfo}
                </p>
              ) : (
                <p className="text-sm text-zinc-500">Consultá nuestros horarios.</p>
              )}
            </div>

            {/* Social & links */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gold mb-3">Seguinos</h3>
              <div className="flex gap-4">
                {site?.instagramUrl && (
                  <a
                    href={site.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                    aria-label="Instagram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                )}
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                    aria-label="WhatsApp"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-zinc-600">
              © {new Date().getFullYear()} {restaurant.name}
            </div>
            <div className="text-xs text-zinc-600">
              Hecho con <span className="text-gold">baryresto</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          aria-label="WhatsApp"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}
    </div>
  );
}
