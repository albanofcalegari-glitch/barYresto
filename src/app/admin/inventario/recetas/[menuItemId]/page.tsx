import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import { addRecipeIngredient, removeRecipeIngredient } from "@/modules/inventory/actions";
import { safeRemoveRecipeIngredient } from "@/modules/inventory/safe-actions";

export const metadata = { title: "Receta del plato" };

const UNIT_LABELS: Record<string, string> = {
  KG: "kg",
  G: "g",
  LT: "lt",
  ML: "ml",
  UNIT: "u",
};

export default async function RecetaDetailPage({
  params,
}: {
  params: { menuItemId: string };
}) {
  await requirePermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const menuItem = await prisma.menuItem.findFirst({
    where: { id: params.menuItemId, restaurantId: restaurant.id },
    include: {
      category: { select: { name: true } },
      recipe: {
        include: { rawMaterial: { select: { id: true, name: true, unit: true } } },
        orderBy: { rawMaterial: { name: "asc" } },
      },
    },
  });
  if (!menuItem) notFound();

  const allMaterials = await prisma.rawMaterial.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true },
  });

  const usedIds = new Set(menuItem.recipe.map((r) => r.rawMaterialId));
  const available = allMaterials.filter((m) => !usedIds.has(m.id));

  async function handleAdd(formData: FormData) {
    "use server";
    await addRecipeIngredient(formData);
    redirect(`/admin/inventario/recetas/${params.menuItemId}`);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">{menuItem.name}</h1>
          <div className="text-sm text-zinc-500">{menuItem.category.name}</div>
        </div>
        <Link href="/admin/inventario/recetas" className="text-sm text-zinc-400 hover:underline">
          ← volver
        </Link>
      </div>

      {menuItem.recipe.length > 0 && (
        <div className="card p-0 overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Materia prima</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {menuItem.recipe.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium">{r.rawMaterial.name}</td>
                  <td className="px-4 py-3">{r.quantity}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {UNIT_LABELS[r.rawMaterial.unit]}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SafeForm action={safeRemoveRecipeIngredient}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs text-red-400 hover:underline">
                        Quitar
                      </button>
                    </SafeForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {available.length > 0 ? (
        <form action={handleAdd} className="card space-y-4">
          <h2 className="font-heading font-semibold">Agregar ingrediente</h2>
          <input type="hidden" name="menuItemId" value={menuItem.id} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Materia prima *</label>
              <select name="rawMaterialId" required className="input">
                <option value="">Elegir...</option>
                {available.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({UNIT_LABELS[m.unit]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Cantidad *</label>
              <input name="quantity" type="number" step="0.001" min="0.001" required className="input" placeholder="Ej: 0.4" />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary">+ Agregar</button>
          </div>
        </form>
      ) : (
        <div className="card text-center text-zinc-500">
          {allMaterials.length === 0 ? (
            <>
              No hay materias primas cargadas.{" "}
              <Link href="/admin/inventario/materias-primas/nuevo" className="text-brand-400 hover:underline">
                Crear la primera
              </Link>
            </>
          ) : (
            "Todas las materias primas ya están asignadas a este plato."
          )}
        </div>
      )}
    </div>
  );
}
