import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { formatMoneyArs } from "@/lib/utils";
import { SafeForm } from "@/components/safe-form";
import {
  safeAddItemToOrder,
  safeRemoveItemFromOrder,
  safeFireOrder,
  safeRequestClose,
} from "@/modules/orders/safe-actions";

export const metadata = { title: "Detalle de orden" };

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePermission("order.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const order = await prisma.order.findFirst({
    where: { id: params.id, restaurantId: restaurant.id },
    include: {
      table: { select: { code: true } },
      items: {
        orderBy: { createdAt: "asc" },
        include: { item: { select: { name: true } } },
      },
    },
  });

  if (!order) notFound();

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id, visible: true },
    orderBy: { orderIndex: "asc" },
    include: {
      items: {
        where: { available: true },
        orderBy: { orderIndex: "asc" },
        select: { id: true, name: true, priceCents: true },
      },
    },
  });

  const canEdit = ["OPEN", "FIRED", "SERVING"].includes(order.status);

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Orden #{order.code}
            {order.table && (
              <span className="text-zinc-500 font-normal ml-2">Mesa {order.table.code}</span>
            )}
          </h1>
          <div className="text-sm text-zinc-500">
            {order.guests && `${order.guests} comensales · `}
            {order.type === "TAKEAWAY" ? "Para llevar" : "En salón"}
          </div>
        </div>
        <Link href="/admin/ordenes" className="text-sm text-zinc-600 hover:underline">
          ← volver
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current items */}
        <div className="card">
          <h2 className="font-semibold mb-3">Items de la orden</h2>
          {order.items.length === 0 ? (
            <div className="text-sm text-zinc-500">Sin items todavía.</div>
          ) : (
            <div className="divide-y">
              {order.items.map((oi) => (
                <div key={oi.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {oi.quantity}x {oi.nameSnapshot}
                    </div>
                    {oi.notes && (
                      <div className="text-xs text-zinc-500">{oi.notes}</div>
                    )}
                    <div className="text-xs text-zinc-500">
                      {formatMoneyArs(oi.priceCentsSnapshot * oi.quantity)}
                    </div>
                  </div>
                  {canEdit && (
                    <SafeForm action={safeRemoveItemFromOrder}>
                      <input type="hidden" name="orderItemId" value={oi.id} />
                      <button className="text-xs text-red-600 hover:underline">
                        quitar
                      </button>
                    </SafeForm>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between font-semibold border-t mt-3 pt-3">
            <span>Total</span>
            <span>{formatMoneyArs(order.totalCents)}</span>
          </div>

          {/* Order actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {order.status === "OPEN" && (
              <SafeForm action={safeFireOrder}>
                <input type="hidden" name="id" value={order.id} />
                <button className="btn-primary !text-sm">Enviar a cocina</button>
              </SafeForm>
            )}
            {(order.status === "FIRED" || order.status === "SERVING") && (
              <SafeForm action={safeRequestClose}>
                <input type="hidden" name="id" value={order.id} />
                <button className="btn-primary !text-sm">Pedir cuenta</button>
              </SafeForm>
            )}
            {order.status === "CLOSING" && (
              <Link href={`/admin/ordenes/${order.id}/cobrar`} className="btn-primary !text-sm">
                Cobrar
              </Link>
            )}
          </div>
        </div>

        {/* Add items */}
        {canEdit && (
          <div className="card">
            <h2 className="font-semibold mb-3">Agregar platos</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {categories
                .filter((c) => c.items.length > 0)
                .map((cat) => (
                  <div key={cat.id}>
                    <div className="text-xs uppercase text-zinc-500 font-medium mb-1">
                      {cat.name}
                    </div>
                    <div className="space-y-1">
                      {cat.items.map((it) => (
                        <SafeForm
                          key={it.id}
                          action={safeAddItemToOrder}
                          className="flex items-center gap-2 py-1"
                          resetOnSuccess={false}
                        >
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="itemId" value={it.id} />
                          <input
                            type="number"
                            name="quantity"
                            defaultValue={1}
                            min={1}
                            max={50}
                            className="input !py-1 !text-xs w-14"
                          />
                          <div className="flex-1 min-w-0 text-sm truncate">
                            {it.name}
                          </div>
                          <div className="text-xs text-zinc-500 whitespace-nowrap">
                            {formatMoneyArs(it.priceCents)}
                          </div>
                          <button className="text-xs px-2 py-1 rounded bg-brand-600 text-white hover:bg-brand-700">
                            +
                          </button>
                        </SafeForm>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
