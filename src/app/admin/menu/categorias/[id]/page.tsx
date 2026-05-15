import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { updateCategory, deleteCategory } from "@/modules/menu/actions";

export const metadata = { title: "Editar categoría" };

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const cat = await prisma.menuCategory.findFirst({
    where: { id: params.id, restaurantId: restaurant.id },
    include: { _count: { select: { items: true } } },
  });
  if (!cat) notFound();

  async function save(formData: FormData) {
    "use server";
    await updateCategory(formData);
    redirect("/admin/menu");
  }

  async function remove(formData: FormData) {
    "use server";
    await deleteCategory(formData);
    redirect("/admin/menu");
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Editar categoría</h1>
        <Link href="/admin/menu" className="text-sm text-th-text-muted hover:underline">
          ← volver
        </Link>
      </div>

      <form action={save} className="card space-y-4">
        <input type="hidden" name="id" value={cat.id} />

        <div>
          <label className="label">Nombre *</label>
          <input name="name" required maxLength={60} defaultValue={cat.name} className="input" />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            name="description"
            maxLength={200}
            rows={2}
            defaultValue={cat.description ?? ""}
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Orden</label>
            <input
              name="orderIndex"
              type="number"
              defaultValue={cat.orderIndex}
              min={0}
              className="input"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="visible"
                defaultChecked={cat.visible}
                value="on"
                className="h-4 w-4"
              />
              Visible en el sitio
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/admin/menu" className="btn-ghost">
            Cancelar
          </Link>
          <button className="btn-primary">Guardar</button>
        </div>
      </form>

      <form action={remove} className="mt-6 card bg-red-500/20 border-red-500/30 flex items-center justify-between">
        <div className="text-sm text-red-400">
          <strong>Eliminar categoría</strong>
          <div className="text-xs">
            {cat._count.items > 0
              ? `Tiene ${cat._count.items} producto(s). Movelos o borralos primero.`
              : "Esta acción no se puede deshacer."}
          </div>
        </div>
        <input type="hidden" name="id" value={cat.id} />
        <button
          disabled={cat._count.items > 0}
          className="text-sm text-red-400 border border-red-500/30 rounded-md px-3 py-2 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Eliminar
        </button>
      </form>
    </div>
  );
}
