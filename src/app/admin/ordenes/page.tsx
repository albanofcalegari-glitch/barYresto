import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { formatMoneyArs } from "@/lib/utils";
import { SafeForm } from "@/components/safe-form";
import {
  safeFireOrder,
  safeRequestClose,
  safeCancelOrder,
} from "@/modules/orders/safe-actions";
import type { OrderStatus } from "@prisma/client";

export const metadata = { title: "Órdenes" };

const STATUS_STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  OPEN: { label: "Abierta", cls: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  FIRED: { label: "En cocina", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  SERVING: { label: "Sirviendo", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  CLOSING: { label: "Pidió cuenta", cls: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  CLOSED: { label: "Cerrada", cls: "bg-white/[0.05] text-zinc-500 border-white/[0.08]" },
  CANCELED: { label: "Cancelada", cls: "bg-red-500/10 text-red-400 border-red-500/30" },
};

export default async function OrdenesPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  await requirePermission("order.create");
  const { restaurant } = await requireCurrentRestaurant();

  const activeStatuses: OrderStatus[] = ["OPEN", "FIRED", "SERVING", "CLOSING"];
  const statusFilter = searchParams.estado as OrderStatus | undefined;
  const showActive = !statusFilter;

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      ...(statusFilter
        ? { status: statusFilter }
        : { status: { in: activeStatuses } }),
    },
    orderBy: { openedAt: "desc" },
    include: {
      table: { select: { code: true } },
      items: { orderBy: { createdAt: "asc" } },
      payments: { select: { amountCents: true } },
    },
    take: 100,
  });

  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { code: "asc" },
    include: { zone: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold">Órdenes</h1>
        <Link href="/admin/ordenes/nueva" className="btn-primary">
          + Abrir mesa
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/ordenes"
          className={`text-sm px-3 py-1.5 rounded-full border ${showActive ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "border-white/[0.08] hover:bg-white/[0.05]"}`}
        >
          Activas
        </Link>
        {Object.entries(STATUS_STYLES).map(([k, v]) => (
          <Link
            key={k}
            href={`/admin/ordenes?estado=${k}`}
            className={`text-sm px-3 py-1.5 rounded-full border ${statusFilter === k ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "border-white/[0.08] hover:bg-white/[0.05]"}`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card text-center text-zinc-500">
          {showActive ? "Sin órdenes activas." : "Sin órdenes con ese estado."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => {
            const st = STATUS_STYLES[o.status];
            return (
              <div key={o.id} className="card flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg">
                      #{o.code}
                    </span>
                    {o.table && (
                      <span className="text-sm text-zinc-500">
                        Mesa {o.table.code}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${st.cls}`}>
                    {st.label}
                  </span>
                </div>

                {/* Items */}
                {o.items.length === 0 ? (
                  <div className="text-sm text-zinc-500 mb-3">Sin items todavía</div>
                ) : (
                  <div className="text-sm divide-y divide-white/[0.06] mb-3 flex-1">
                    {o.items.map((it) => (
                      <div key={it.id} className="py-1 flex justify-between">
                        <span>
                          {it.quantity}x {it.nameSnapshot}
                          {it.notes && (
                            <span className="text-xs text-zinc-500 ml-1">
                              ({it.notes})
                            </span>
                          )}
                        </span>
                        <span className="text-zinc-400">
                          {formatMoneyArs(it.priceCentsSnapshot * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between font-semibold border-t border-white/[0.08] pt-2 mb-3">
                  <span>Total</span>
                  <span>{formatMoneyArs(o.totalCents)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {o.status === "OPEN" && (
                    <>
                      <Link
                        href={`/admin/ordenes/${o.id}`}
                        className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Agregar items
                      </Link>
                      <SafeForm action={safeFireOrder}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="text-xs px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700">
                          Enviar a cocina
                        </button>
                      </SafeForm>
                    </>
                  )}
                  {(o.status === "FIRED" || o.status === "SERVING") && (
                    <>
                      <Link
                        href={`/admin/ordenes/${o.id}`}
                        className="text-xs px-3 py-1.5 rounded-md border border-white/[0.08] hover:bg-white/[0.05]"
                      >
                        Ver / Editar
                      </Link>
                      <SafeForm action={safeRequestClose}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="text-xs px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700">
                          Pedir cuenta
                        </button>
                      </SafeForm>
                    </>
                  )}
                  {o.status === "CLOSING" && (
                    <Link
                      href={`/admin/ordenes/${o.id}/cobrar`}
                      className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Cobrar
                    </Link>
                  )}
                  {["OPEN", "FIRED", "SERVING", "CLOSING"].includes(o.status) && (
                    <SafeForm action={safeCancelOrder}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="text-xs text-red-400 hover:underline px-2 py-1.5">
                        Cancelar
                      </button>
                    </SafeForm>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
