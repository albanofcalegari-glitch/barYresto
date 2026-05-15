import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import { safeDeleteSupplier } from "@/modules/inventory/safe-actions";

export const metadata = { title: "Proveedores" };

export default async function ProveedoresPage() {
  await requirePermission("inventory.view");
  const { restaurant } = await requireCurrentRestaurant();

  const suppliers = await prisma.supplier.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { materials: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold">Proveedores</h1>
        <Link href="/admin/inventario/proveedores/nuevo" className="btn-primary">
          + Nuevo
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="card text-center text-th-text-muted">
          No hay proveedores cargados.{" "}
          <Link href="/admin/inventario/proveedores/nuevo" className="text-brand-400 hover:underline">
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {suppliers.map((s) => (
            <div key={s.id} className="card flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-th-text-muted">
                  {[s.phone, s.email].filter(Boolean).join(" · ") || "Sin contacto"}
                </div>
                {s.notes && <div className="text-xs text-th-text-muted mt-1">{s.notes}</div>}
                <div className="text-xs text-th-text-muted mt-1">
                  {s._count.materials} materia(s) prima(s)
                </div>
              </div>
              <div className="flex gap-2">
                <SafeForm action={safeDeleteSupplier}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-xs text-red-400 hover:underline">Eliminar</button>
                </SafeForm>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
