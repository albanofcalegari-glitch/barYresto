import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";

export const metadata = { title: "Recetas" };

const UNIT_LABELS: Record<string, string> = {
  KG: "kg",
  G: "g",
  LT: "lt",
  ML: "ml",
  UNIT: "u",
};

export default async function RecetasPage() {
  await requirePermission("inventory.view");
  const { restaurant } = await requireCurrentRestaurant();

  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: [{ category: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    include: {
      category: { select: { name: true } },
      recipe: {
        include: { rawMaterial: { select: { name: true, unit: true } } },
      },
    },
  });

  const grouped = menuItems.reduce(
    (acc, item) => {
      const cat = item.category.name;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, typeof menuItems>,
  );

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
        <div>
          <Link href="/admin/inventario" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Inventario
          </Link>
          <h1 className="text-2xl font-heading font-bold mt-1">Recetas</h1>
        </div>
      </div>
      <p className="text-sm text-zinc-500 mb-6">
        Definí cuánta materia prima necesita cada plato. Cuando se cierre una orden, el stock se descuenta automáticamente.
      </p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-heading font-semibold mb-3">{category}</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="card flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  {item.recipe.length > 0 ? (
                    <div className="text-sm text-zinc-500 mt-1">
                      {item.recipe.map((r) => (
                        <span key={r.id} className="inline-block mr-3">
                          {r.quantity} {UNIT_LABELS[r.rawMaterial.unit]} {r.rawMaterial.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400 mt-1">Sin receta definida</div>
                  )}
                </div>
                {item.recipe.length > 0 ? (
                  <Link
                    href={`/admin/inventario/recetas/${item.id}`}
                    className="text-xs text-brand-400 hover:underline whitespace-nowrap"
                  >
                    Editar receta
                  </Link>
                ) : (
                  <Link
                    href={`/admin/inventario/recetas/${item.id}`}
                    className="btn-primary !text-xs !px-3 !py-1.5 whitespace-nowrap"
                  >
                    + Definir receta
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
