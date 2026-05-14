import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";

export const metadata = { title: "Inventario" };

export default async function InventarioPage() {
  await requirePermission("inventory.view");
  const { restaurant } = await requireCurrentRestaurant();

  const [materialsCount, suppliersCount, recipesCount] = await Promise.all([
    prisma.rawMaterial.count({ where: { restaurantId: restaurant.id } }),
    prisma.supplier.count({ where: { restaurantId: restaurant.id } }),
    prisma.recipeIngredient.count({
      where: { menuItem: { restaurantId: restaurant.id } },
    }),
  ]);

  const lowStock = await prisma.$queryRaw<
    { id: string; name: string; unit: string; currentStock: number; reorderPoint: number; criticalPoint: number }[]
  >`
    SELECT id, name, unit, "currentStock", "reorderPoint", "criticalPoint"
    FROM "RawMaterial"
    WHERE "restaurantId" = ${restaurant.id}
      AND "reorderPoint" > 0
      AND "currentStock" <= "reorderPoint"
    ORDER BY "currentStock" ASC
  `;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold">Inventario</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/inventario/materias-primas" className="card hover:border-brand-500/40 transition-colors">
          <div className="text-3xl font-heading font-bold text-brand-400">{materialsCount}</div>
          <div className="text-sm text-zinc-500">Materias primas</div>
        </Link>
        <Link href="/admin/inventario/proveedores" className="card hover:border-brand-500/40 transition-colors">
          <div className="text-3xl font-heading font-bold text-brand-400">{suppliersCount}</div>
          <div className="text-sm text-zinc-500">Proveedores</div>
        </Link>
        <Link href="/admin/inventario/recetas" className="card hover:border-brand-500/40 transition-colors">
          <div className="text-3xl font-heading font-bold text-brand-400">{recipesCount}</div>
          <div className="text-sm text-zinc-500">Ingredientes en recetas</div>
        </Link>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-heading font-semibold mb-3">Alertas de stock</h2>
          <div className="space-y-2">
            {lowStock.map((m) => {
              const isCritical = m.currentStock <= m.criticalPoint && m.criticalPoint > 0;
              return (
                <div
                  key={m.id}
                  className={`card flex items-center justify-between ${
                    isCritical
                      ? "border-red-500/30 bg-red-500/10"
                      : "border-amber-500/30 bg-amber-500/10"
                  }`}
                >
                  <div>
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-sm text-zinc-500 ml-2">
                      {m.currentStock} {m.unit.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border font-medium ${
                        isCritical
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {isCritical ? "CRITICO" : "REPONER"}
                    </span>
                    <Link
                      href="/admin/inventario/stock"
                      className="text-xs text-brand-400 hover:underline"
                    >
                      Cargar stock
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/admin/inventario/materias-primas/nuevo" className="btn-primary text-center">
          + Materia prima
        </Link>
        <Link href="/admin/inventario/proveedores/nuevo" className="btn-primary text-center">
          + Proveedor
        </Link>
        <Link href="/admin/inventario/recetas" className="btn-secondary text-center">
          Recetas
        </Link>
        <Link href="/admin/inventario/stock" className="btn-secondary text-center">
          Stock y movimientos
        </Link>
      </div>
    </div>
  );
}
