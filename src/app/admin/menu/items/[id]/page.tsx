import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { updateItem, deleteItem } from "@/modules/menu/actions";
import { ImageUpload } from "@/components/image-upload";

export const metadata = { title: "Editar plato" };

function centsToArsInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",").replace(/,00$/, "");
}

export default async function EditItemPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const [item, categories] = await Promise.all([
    prisma.menuItem.findFirst({
      where: { id: params.id, restaurantId: restaurant.id },
    }),
    prisma.menuCategory.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!item) notFound();

  async function save(formData: FormData) {
    "use server";
    await updateItem(formData);
    redirect("/admin/menu");
  }

  async function remove(formData: FormData) {
    "use server";
    await deleteItem(formData);
    redirect("/admin/menu");
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar plato</h1>
        <Link href="/admin/menu" className="text-sm text-zinc-600 hover:underline">
          ← volver
        </Link>
      </div>

      <form action={save} className="card space-y-4">
        <input type="hidden" name="id" value={item.id} />

        <div>
          <label className="label">Categoría *</label>
          <select name="categoryId" required className="input" defaultValue={item.categoryId}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Nombre *</label>
          <input name="name" required maxLength={80} defaultValue={item.name} className="input" />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            name="description"
            maxLength={500}
            rows={3}
            defaultValue={item.description ?? ""}
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Precio (ARS) *</label>
            <input
              name="priceArs"
              required
              defaultValue={centsToArsInput(item.priceCents)}
              className="input"
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="label">Orden</label>
            <input
              name="orderIndex"
              type="number"
              defaultValue={item.orderIndex}
              min={0}
              className="input"
            />
          </div>
        </div>

        <ImageUpload
          name="imageUrl"
          defaultValue={item.imageUrl ?? ""}
          label="Imagen del plato"
          hint="Recomendado: 800x600 o mayor."
        />

        <div>
          <label className="label">Etiquetas</label>
          <input
            name="tags"
            defaultValue={item.tags.join(", ")}
            className="input"
            placeholder="sin-tacc, vegetariano (separadas por coma, máx 5)"
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="available"
              defaultChecked={item.available}
              value="on"
              className="h-4 w-4"
            />
            Disponible
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={item.featured}
              value="on"
              className="h-4 w-4"
            />
            Destacado
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/admin/menu" className="btn-ghost">
            Cancelar
          </Link>
          <button className="btn-primary">Guardar cambios</button>
        </div>
      </form>

      <form action={remove} className="mt-6 card bg-red-50 border-red-200 flex items-center justify-between">
        <div className="text-sm text-red-800">
          <strong>Eliminar plato</strong>
          <div className="text-xs">Esta acción no se puede deshacer.</div>
        </div>
        <input type="hidden" name="id" value={item.id} />
        <button className="text-sm text-red-700 border border-red-300 rounded-md px-3 py-2 hover:bg-red-100">
          Eliminar
        </button>
      </form>
    </div>
  );
}
