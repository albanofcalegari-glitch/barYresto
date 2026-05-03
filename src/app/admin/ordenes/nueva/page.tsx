import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { openOrder } from "@/modules/orders/actions";

export const metadata = { title: "Abrir mesa" };

export default async function NuevaOrdenPage() {
  await requirePermission("order.create");
  const { restaurant } = await requireCurrentRestaurant();

  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { code: "asc" },
    include: { zone: { select: { name: true } } },
  });

  async function create(formData: FormData) {
    "use server";
    await openOrder(formData);
    redirect("/admin/ordenes");
  }

  return (
    <div className="max-w-md">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold">Abrir mesa</h1>
        <Link href="/admin/ordenes" className="text-sm text-zinc-600 hover:underline">
          ← volver
        </Link>
      </div>

      <form action={create} className="card space-y-4">
        <div>
          <label className="label">Mesa *</label>
          <select name="tableId" required className="input">
            <option value="">Elegir mesa...</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} ({t.zone?.name ?? "Sin zona"}, {t.seats} lug.)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Comensales</label>
          <input name="guests" type="number" min={1} max={50} defaultValue={2} className="input" />
        </div>

        <div>
          <label className="label">Tipo</label>
          <select name="type" className="input" defaultValue="DINE_IN">
            <option value="DINE_IN">En salón</option>
            <option value="TAKEAWAY">Para llevar</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/admin/ordenes" className="btn-ghost">Cancelar</Link>
          <button className="btn-primary">Abrir orden</button>
        </div>
      </form>
    </div>
  );
}
