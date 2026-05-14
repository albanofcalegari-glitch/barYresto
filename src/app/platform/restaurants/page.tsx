import Link from "next/link";
import { prisma } from "@/db/client";
import { RestaurantStatus } from "@prisma/client";

export const metadata = { title: "Restaurantes" };

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      plan: { select: { name: true } },
      _count: { select: { users: true, reservations: true, orders: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Restaurantes</h1>
        <Link
          href="/platform/restaurants/new"
          className="btn-primary bg-brand-500 hover:bg-brand-600"
        >
          + Nuevo restaurante
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-lg border border-white/[0.08] p-8 text-center text-zinc-400">
          Todavía no hay restaurantes. Creá el primero.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] text-zinc-300">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Usuarios</th>
                <th className="text-right px-4 py-3">Reservas</th>
                <th className="text-right px-4 py-3">Órdenes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    <code>{r.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.plan?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">{r._count.users}</td>
                  <td className="px-4 py-3 text-right">{r._count.reservations}</td>
                  <td className="px-4 py-3 text-right">{r._count.orders}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/platform/restaurants/${r.id}`}
                      className="text-sm text-brand-400 hover:underline"
                    >
                      Gestionar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RestaurantStatus }) {
  const map: Record<RestaurantStatus, string> = {
    ACTIVE: "bg-emerald-500/20 text-emerald-400",
    TRIAL: "bg-amber-500/20 text-amber-400",
    SUSPENDED: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}
