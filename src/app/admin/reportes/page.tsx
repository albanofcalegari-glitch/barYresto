import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { formatMoneyArs } from "@/lib/utils";

export const metadata = { title: "Reportes" };

export default async function ReportesPage() {
  await requirePermission("report.view");
  const { restaurant } = await requireCurrentRestaurant();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    reservationsMonth,
    reservationsByStatus,
    ordersMonth,
    salesMonth,
    salesWeek,
    salesToday,
    customersTotal,
    topItems,
  ] = await Promise.all([
    prisma.reservation.count({
      where: {
        restaurantId: restaurant.id,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.reservation.groupBy({
      by: ["status"],
      where: {
        restaurantId: restaurant.id,
        createdAt: { gte: startOfMonth },
      },
      _count: true,
    }),
    prisma.order.count({
      where: {
        restaurantId: restaurant.id,
        openedAt: { gte: startOfMonth },
      },
    }),
    prisma.payment.aggregate({
      where: {
        restaurantId: restaurant.id,
        status: "APPROVED",
        paidAt: { gte: startOfMonth },
      },
      _sum: { amountCents: true },
    }),
    prisma.payment.aggregate({
      where: {
        restaurantId: restaurant.id,
        status: "APPROVED",
        paidAt: { gte: startOfWeek },
      },
      _sum: { amountCents: true },
    }),
    prisma.payment.aggregate({
      where: {
        restaurantId: restaurant.id,
        status: "APPROVED",
        paidAt: { gte: today },
      },
      _sum: { amountCents: true },
    }),
    prisma.customer.count({
      where: { restaurantId: restaurant.id },
    }),
    prisma.orderItem.groupBy({
      by: ["nameSnapshot"],
      where: {
        order: {
          restaurantId: restaurant.id,
          openedAt: { gte: startOfMonth },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  const statusLabels: Record<string, string> = {
    PENDING: "Pendientes",
    CONFIRMED: "Confirmadas",
    SEATED: "Sentadas",
    COMPLETED: "Completadas",
    CANCELED: "Canceladas",
    NO_SHOW: "No show",
  };

  const monthName = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-1">Reportes</h1>
      <p className="text-sm text-zinc-500 mb-6">Resumen de {monthName}</p>

      {/* Sales */}
      <section className="mb-8">
        <h2 className="text-lg font-heading font-semibold mb-3">Ventas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Hoy"
            value={formatMoneyArs(salesToday._sum.amountCents ?? 0)}
          />
          <StatCard
            label="Esta semana"
            value={formatMoneyArs(salesWeek._sum.amountCents ?? 0)}
          />
          <StatCard
            label="Este mes"
            value={formatMoneyArs(salesMonth._sum.amountCents ?? 0)}
          />
        </div>
      </section>

      {/* Reservations */}
      <section className="mb-8">
        <h2 className="text-lg font-heading font-semibold mb-3">Reservas del mes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={reservationsMonth} />
          {reservationsByStatus.map((s) => (
            <StatCard
              key={s.status}
              label={statusLabels[s.status] ?? s.status}
              value={s._count}
            />
          ))}
        </div>
      </section>

      {/* Orders + Customers */}
      <section className="mb-8">
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="Órdenes del mes" value={ordersMonth} />
          <StatCard label="Clientes registrados" value={customersTotal} />
        </div>
      </section>

      {/* Top items */}
      {topItems.length > 0 && (
        <section>
          <h2 className="text-lg font-heading font-semibold mb-3">Platos más pedidos</h2>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className="text-left px-4 py-2">#</th>
                  <th className="text-left px-4 py-2">Plato</th>
                  <th className="text-right px-4 py-2">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {topItems.map((item, i) => (
                  <tr key={item.nameSnapshot}>
                    <td className="px-4 py-2 text-zinc-500">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{item.nameSnapshot}</td>
                    <td className="px-4 py-2 text-right">{item._sum.quantity ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
