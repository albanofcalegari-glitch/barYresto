import Link from "next/link";
import { requireSession } from "@/lib/rbac";
import { prisma } from "@/db/client";
import { formatMoneyArs } from "@/lib/utils";
import { env } from "@/lib/env";
import { CopyUrlBanner } from "@/components/copy-url-banner";

export const metadata = { title: "Inicio" };

export default async function AdminHome({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await requireSession();

  const restaurant = session.user.restaurantId
    ? await prisma.restaurant.findUnique({
        where: { id: session.user.restaurantId },
      })
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [reservationsToday, pendingReservations, openOrders, salesToday] =
    await Promise.all([
      restaurant
        ? prisma.reservation.count({
            where: {
              restaurantId: restaurant.id,
              startsAt: { gte: today, lte: endOfDay },
            },
          })
        : 0,
      restaurant
        ? prisma.reservation.count({
            where: {
              restaurantId: restaurant.id,
              status: "PENDING",
              startsAt: { gte: today },
            },
          })
        : 0,
      restaurant
        ? prisma.order.count({
            where: {
              restaurantId: restaurant.id,
              status: { in: ["OPEN", "FIRED", "SERVING", "CLOSING"] },
            },
          })
        : 0,
      restaurant
        ? prisma.payment.aggregate({
            where: {
              restaurantId: restaurant.id,
              status: "APPROVED",
              paidAt: { gte: today, lte: endOfDay },
            },
            _sum: { amountCents: true },
          })
        : { _sum: { amountCents: null } },
    ]);

  const salesCents = salesToday._sum.amountCents ?? 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold">Hola, {session.user.name}</h1>
          {restaurant && (
            <p className="text-sm text-th-text-muted mt-1">{restaurant.name}</p>
          )}
        </div>
      </div>

      {restaurant && (
        <CopyUrlBanner
          url={`${env.APP_BASE_URL}/${restaurant.slug}`}
          slug={restaurant.slug}
        />
      )}

      {searchParams.error === "forbidden" && (
        <div className="mb-6 rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-400">
          No tenés permisos para acceder a esa sección.
        </div>
      )}

      {!restaurant ? (
        <div className="card">
          <h2 className="font-heading font-semibold">Sin restaurante asociado</h2>
          <p className="mt-2 text-sm text-th-text-muted">
            Tu usuario aún no está vinculado a ningún restaurante. Contactá al
            super admin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Stat label="Reservas hoy" value={reservationsToday} />
            <Stat
              label="Pendientes de confirmar"
              value={pendingReservations}
              alert={pendingReservations > 0}
            />
            <Stat label="Mesas abiertas" value={openOrders} />
            <Stat label="Ventas del día" value={formatMoneyArs(salesCents)} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <QuickLink
              href="/admin/reservas"
              label="Reservas"
              description="Ver y gestionar las reservas de hoy"
            />
            <QuickLink
              href="/admin/ordenes"
              label="Órdenes"
              description="Gestionar mesas y órdenes activas"
            />
            <QuickLink
              href="/admin/menu"
              label="Menú"
              description="Editar categorías, platos y disponibilidad"
            />
            <QuickLink
              href="/admin/sitio"
              label="Sitio web"
              description="Editar contenido del sitio público"
            />
            <QuickLink
              href="/admin/sitio/galeria"
              label="Galería"
              description="Administrar fotos del restaurante"
            />
            <QuickLink
              href={`/${restaurant.slug}`}
              label="Ver sitio público"
              description="Abrir el sitio como lo ven tus clientes"
            />
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  alert,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <div className={`card ${alert ? "border-amber-500/30 bg-amber-500/10" : ""}`}>
      <div className="text-xs uppercase tracking-wide text-th-text-muted">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${alert ? "text-amber-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link href={href} className="card hover:shadow-md transition-shadow group">
      <div className="font-semibold group-hover:text-brand-300">{label}</div>
      <div className="text-sm text-th-text-muted mt-1">{description}</div>
    </Link>
  );
}
