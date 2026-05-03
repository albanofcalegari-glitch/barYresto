import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import { safeCreateCustomer, safeDeleteCustomer } from "@/modules/customers/safe-actions";

export const metadata = { title: "Clientes" };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requirePermission("customer.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const search = searchParams.q?.trim() ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      restaurantId: restaurant.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>

      {/* Search */}
      <form className="card mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Buscar</label>
          <input
            name="q"
            defaultValue={search}
            placeholder="Nombre, teléfono o email"
            className="input"
          />
        </div>
        <button className="btn-secondary">Buscar</button>
      </form>

      {/* New customer */}
      <SafeForm action={safeCreateCustomer} className="card mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end" successMessage="Cliente creado">
        <div>
          <label className="label">Nombre *</label>
          <input name="name" required minLength={2} className="input" />
        </div>
        <div>
          <label className="label">Teléfono *</label>
          <input name="phone" required className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input" />
        </div>
        <button className="btn-primary">Agregar cliente</button>
      </SafeForm>

      {customers.length === 0 ? (
        <div className="card text-center text-zinc-500">
          {search ? "Sin resultados." : "Todavía no hay clientes."}
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full text-sm card p-0 overflow-hidden min-w-[600px]">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Teléfono</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-2">Visitas</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Última</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{c.phone}</td>
                <td className="px-4 py-2 text-zinc-500 hidden md:table-cell">{c.email ?? "—"}</td>
                <td className="px-4 py-2">{c.visitsCount}</td>
                <td className="px-4 py-2 text-zinc-500 hidden sm:table-cell">
                  {c.lastVisitAt
                    ? c.lastVisitAt.toLocaleDateString("es-AR")
                    : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      className="text-zinc-600 hover:underline"
                    >
                      editar
                    </Link>
                    <SafeForm action={safeDeleteCustomer}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-red-600 hover:underline">
                        eliminar
                      </button>
                    </SafeForm>
                  </div>
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
