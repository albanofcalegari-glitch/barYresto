import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { formatMoneyArs } from "@/lib/utils";
import { SafeForm } from "@/components/safe-form";
import {
  safeCreateCategory,
  safeDeleteCategory,
  safeToggleItemAvailability,
  safeDeleteItem,
} from "@/modules/menu/safe-actions";

export const metadata = { title: "Menú" };

export default async function MenuPage() {
  await requirePermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { orderIndex: "asc" },
    include: {
      items: { orderBy: { orderIndex: "asc" } },
    },
  });

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold">Menú</h1>
        <Link href="/admin/menu/items/nuevo" className="btn-primary">
          + Nuevo plato
        </Link>
      </div>

      <SafeForm
        action={safeCreateCategory}
        className="card mb-6 flex flex-wrap items-end gap-3"
        successMessage="Categoría creada"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="label">Nueva categoría</label>
          <input name="name" required placeholder="Ej: Postres" className="input" />
        </div>
        <div className="w-32">
          <label className="label">Orden</label>
          <input name="orderIndex" type="number" defaultValue={categories.length} className="input" />
        </div>
        <button className="btn-secondary">Agregar</button>
      </SafeForm>

      {categories.length === 0 ? (
        <div className="card text-center text-zinc-500">
          Todavía no hay categorías. Creá la primera arriba.
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <section key={cat.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {cat.name}
                    {!cat.visible && (
                      <span className="ml-2 text-xs text-zinc-500">(oculta)</span>
                    )}
                  </h2>
                  <div className="text-xs text-zinc-500">
                    {cat.items.length} producto(s) · orden {cat.orderIndex}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Link
                    href={`/admin/menu/items/nuevo?categoryId=${cat.id}`}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    + plato
                  </Link>
                  <Link
                    href={`/admin/menu/categorias/${cat.id}`}
                    className="text-sm text-zinc-600 hover:underline"
                  >
                    editar
                  </Link>
                  <SafeForm action={safeDeleteCategory}>
                    <input type="hidden" name="id" value={cat.id} />
                    <button className="text-sm text-red-600 hover:underline">
                      eliminar
                    </button>
                  </SafeForm>
                </div>
              </div>

              {cat.items.length === 0 ? (
                <div className="text-sm text-zinc-500">
                  Sin productos. Agregá el primero.
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead className="text-left text-xs uppercase text-zinc-500 border-b">
                    <tr>
                      <th className="py-2">Plato</th>
                      <th className="py-2">Precio</th>
                      <th className="py-2">Estado</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cat.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2">
                          <div className="font-medium">
                            {it.name}
                            {it.featured && (
                              <span className="ml-2 text-xs text-amber-700">★ destacado</span>
                            )}
                          </div>
                          {it.description && (
                            <div className="text-xs text-zinc-500 truncate max-w-[200px] md:max-w-md">
                              {it.description}
                            </div>
                          )}
                        </td>
                        <td className="py-2 whitespace-nowrap">{formatMoneyArs(it.priceCents)}</td>
                        <td className="py-2">
                          <SafeForm action={safeToggleItemAvailability}>
                            <input type="hidden" name="id" value={it.id} />
                            <button
                              className={
                                it.available
                                  ? "text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200"
                              }
                            >
                              {it.available ? "Disponible" : "Sin stock"}
                            </button>
                          </SafeForm>
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-3">
                            <Link
                              href={`/admin/menu/items/${it.id}`}
                              className="text-zinc-600 hover:underline"
                            >
                              editar
                            </Link>
                            <SafeForm action={safeDeleteItem}>
                              <input type="hidden" name="id" value={it.id} />
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
