import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { createItem } from "@/modules/menu/actions";
import { ImageUpload } from "@/components/image-upload";

export const metadata = { title: "Nuevo plato" };

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: { categoryId?: string };
}) {
  await requirePermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { orderIndex: "asc" },
    select: { id: true, name: true },
  });

  if (categories.length === 0) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-heading font-bold mb-4">Nuevo plato</h1>
        <div className="card">
          <p className="text-sm text-th-text-muted mb-4">
            Antes de crear platos, creá al menos una categoría.
          </p>
          <Link href="/admin/menu" className="btn-primary">
            Ir al menú
          </Link>
        </div>
      </div>
    );
  }

  async function create(formData: FormData) {
    "use server";
    await createItem(formData);
    redirect("/admin/menu");
  }

  const preselected = searchParams.categoryId;

  return (
    <div className="max-w-2xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Nuevo plato</h1>
        <Link href="/admin/menu" className="text-sm text-th-text-muted hover:underline">
          ← volver
        </Link>
      </div>

      <form action={create} className="card space-y-4">
        <div>
          <label className="label">Categoría *</label>
          <select name="categoryId" required className="input" defaultValue={preselected ?? ""}>
            <option value="" disabled>
              Elegí una categoría
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Nombre *</label>
          <input name="name" required maxLength={80} className="input" placeholder="Ej: Milanesa napolitana" />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            name="description"
            maxLength={500}
            rows={3}
            className="input"
            placeholder="Breve descripción del plato"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Precio (ARS) *</label>
            <input
              name="priceArs"
              required
              className="input"
              placeholder="12500 o 12.500"
              inputMode="decimal"
            />
            <p className="text-xs text-th-text-muted mt-1">Sin símbolo. Podés usar punto como separador de miles.</p>
          </div>
          <div>
            <label className="label">Orden</label>
            <input name="orderIndex" type="number" defaultValue={0} min={0} className="input" />
          </div>
        </div>

        <ImageUpload
          name="imageUrl"
          label="Imagen del plato"
          hint="Recomendado: 800x600 o mayor."
        />

        <div>
          <label className="label">Etiquetas</label>
          <input
            name="tags"
            className="input"
            placeholder="sin-tacc, vegetariano, picante (separadas por coma, máx 5)"
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="available" defaultChecked value="on" className="h-4 w-4" />
            Disponible
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" value="on" className="h-4 w-4" />
            Destacado
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/admin/menu" className="btn-ghost">
            Cancelar
          </Link>
          <button className="btn-primary">Crear plato</button>
        </div>
      </form>
    </div>
  );
}
