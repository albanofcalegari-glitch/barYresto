import Link from "next/link";
import { prisma } from "@/db/client";
import { RestaurantStatus } from "@prisma/client";

export const metadata = { title: "Restaurantes" };

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, reservations: true, orders: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Restaurantes</h1>
        <Link
          href="/platform/restaurants/new"
          className="btn-primary bg-brand-500 hover:bg-brand-600"
        >
          + Nuevo restaurante
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-400">
          Todavía no hay restaurantes. Creá el primero.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-300">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Usuarios</th>
                <th className="text-right px-4 py-3">Reservas</th>
                <th className="text-right px-4 py-3">Órdenes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    <code>{r.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">{r._count.users}</td>
                  <td className="px-4 py-3 text-right">
                    {r._count.reservations}
                  </td>
                  <td className="px-4 py-3 text-right">{r._count.orders}</td>
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
    ACTIVE: "bg-emerald-900 text-emerald-200",
    TRIAL: "bg-amber-900 text-amber-200",
    SUSPENDED: "bg-red-900 text-red-200",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}
