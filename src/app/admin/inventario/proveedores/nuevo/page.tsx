import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/rbac";
import { createSupplier } from "@/modules/inventory/actions";

export const metadata = { title: "Nuevo proveedor" };

export default async function NuevoProveedorPage() {
  await requirePermission("inventory.edit");

  async function handleCreate(formData: FormData) {
    "use server";
    await createSupplier(formData);
    redirect("/admin/inventario/proveedores");
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Nuevo proveedor</h1>
        <Link href="/admin/inventario/proveedores" className="text-sm text-th-text-muted hover:underline">
          ← volver
        </Link>
      </div>

      <form action={handleCreate} className="card space-y-4">
        <div>
          <label className="label">Nombre *</label>
          <input name="name" required minLength={2} maxLength={100} className="input" placeholder="Ej: Frigorífico Norte" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Teléfono</label>
            <input name="phone" type="tel" maxLength={30} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea name="notes" maxLength={500} rows={2} className="input" placeholder="Días de entrega, condiciones, etc." />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-th-border">
          <Link href="/admin/inventario/proveedores" className="btn-ghost">Cancelar</Link>
          <button className="btn-primary">Crear</button>
        </div>
      </form>
    </div>
  );
}
