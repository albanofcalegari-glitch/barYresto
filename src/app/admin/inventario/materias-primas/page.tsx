import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import { safeDeleteRawMaterial } from "@/modules/inventory/safe-actions";

export const metadata = { title: "Materias primas" };

const UNIT_LABELS: Record<string, string> = {
  KG: "kg",
  G: "g",
  LT: "lt",
  ML: "ml",
  UNIT: "u",
};

export default async function MateriasPrimasPage() {
  await requirePermission("inventory.view");
  const { restaurant } = await requireCurrentRestaurant();

  const materials = await prisma.rawMaterial.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { name: "asc" },
    include: { supplier: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <div>
          <Link href="/admin/inventario" className="text-sm text-th-text-muted hover:text-th-text-primary">
            ← Inventario
          </Link>
          <h1 className="text-2xl font-heading font-bold mt-1">Materias primas</h1>
        </div>
        <Link href="/admin/inventario/materias-primas/nuevo" className="btn-primary">
          + Nueva
        </Link>
      </div>

      {materials.length === 0 ? (
        <div className="card text-center text-th-text-muted">
          No hay materias primas cargadas.{" "}
          <Link href="/admin/inventario/materias-primas/nuevo" className="text-brand-400 hover:underline">
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-th-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-th-text-muted">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Reposición</th>
                <th className="px-4 py-3 text-right">Crítico</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3 text-right">Costo/u</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-th-border">
              {materials.map((m) => {
                const isCritical = m.currentStock <= m.criticalPoint && m.criticalPoint > 0;
                const isLow = !isCritical && m.currentStock <= m.reorderPoint && m.reorderPoint > 0;
                return (
                  <tr key={m.id} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-medium">
                      {m.name}
                      {m.description && (
                        <div className="text-xs text-th-text-muted font-normal">{m.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{UNIT_LABELS[m.unit] ?? m.unit}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          isCritical
                            ? "text-red-400 font-bold"
                            : isLow
                              ? "text-amber-400 font-semibold"
                              : ""
                        }
                      >
                        {m.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-th-text-muted">{m.reorderPoint}</td>
                    <td className="px-4 py-3 text-right text-th-text-muted">{m.criticalPoint}</td>
                    <td className="px-4 py-3 text-th-text-muted">{m.supplier?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-th-text-muted">
                      ${m.costPerUnit.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/inventario/materias-primas/${m.id}`}
                          className="text-xs text-brand-400 hover:underline"
                        >
                          Editar
                        </Link>
                        <SafeForm action={safeDeleteRawMaterial}>
                          <input type="hidden" name="id" value={m.id} />
                          <button className="text-xs text-red-400 hover:underline">
                            Eliminar
                          </button>
                        </SafeForm>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
