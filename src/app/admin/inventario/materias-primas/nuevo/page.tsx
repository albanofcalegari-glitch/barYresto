import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { createRawMaterial } from "@/modules/inventory/actions";

export const metadata = { title: "Nueva materia prima" };

export default async function NuevaMateriaPage() {
  await requirePermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const suppliers = await prisma.supplier.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    await createRawMaterial(formData);
    redirect("/admin/inventario/materias-primas");
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Nueva materia prima</h1>
        <Link href="/admin/inventario/materias-primas" className="text-sm text-th-text-muted hover:underline">
          ← volver
        </Link>
      </div>

      <form action={handleCreate} className="card space-y-4">
        <div>
          <label className="label">Nombre *</label>
          <input name="name" required minLength={2} maxLength={100} className="input" placeholder="Ej: Carne vacuna" />
        </div>

        <div>
          <label className="label">Descripción</label>
          <input name="description" maxLength={300} className="input" placeholder="Detalle opcional" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Unidad *</label>
            <select name="unit" required className="input">
              <option value="KG">Kilogramo (kg)</option>
              <option value="G">Gramo (g)</option>
              <option value="LT">Litro (lt)</option>
              <option value="ML">Mililitro (ml)</option>
              <option value="UNIT">Unidad (u)</option>
            </select>
          </div>
          <div>
            <label className="label">Costo por unidad ($)</label>
            <input name="costPerUnit" type="number" step="0.01" min="0" defaultValue="0" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Proveedor</label>
          <select name="supplierId" className="input">
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Punto de reposición</label>
            <input name="reorderPoint" type="number" step="0.01" min="0" defaultValue="0" className="input" />
            <p className="text-xs text-th-text-muted mt-1">Alerta amarilla</p>
          </div>
          <div>
            <label className="label">Punto crítico</label>
            <input name="criticalPoint" type="number" step="0.01" min="0" defaultValue="0" className="input" />
            <p className="text-xs text-th-text-muted mt-1">Alerta roja</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-th-border">
          <Link href="/admin/inventario/materias-primas" className="btn-ghost">Cancelar</Link>
          <button className="btn-primary">Crear</button>
        </div>
      </form>
    </div>
  );
}
