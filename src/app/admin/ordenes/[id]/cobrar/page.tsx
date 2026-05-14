import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { formatMoneyArs } from "@/lib/utils";
import { registerPayment } from "@/modules/orders/actions";

export const metadata = { title: "Cobrar orden" };

export default async function CobrarPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePermission("payment.create");
  const { restaurant } = await requireCurrentRestaurant();

  const order = await prisma.order.findFirst({
    where: { id: params.id, restaurantId: restaurant.id, status: "CLOSING" },
    include: {
      table: { select: { code: true } },
      items: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const subtotalDisplay = (order.subtotalCents / 100)
    .toFixed(2)
    .replace(".", ",")
    .replace(/,00$/, "");

  async function pay(formData: FormData) {
    "use server";
    await registerPayment(formData);
    redirect("/admin/ordenes");
  }

  return (
    <div className="max-w-md">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">
          Cobrar #{order.code}
          {order.table && (
            <span className="text-zinc-500 font-normal ml-2">Mesa {order.table.code}</span>
          )}
        </h1>
        <Link href={`/admin/ordenes/${order.id}`} className="text-sm text-zinc-400 hover:underline">
          ← volver
        </Link>
      </div>

      <div className="card mb-6">
        <h2 className="font-heading font-semibold mb-2">Resumen</h2>
        <div className="divide-y divide-white/[0.06] text-sm">
          {order.items.map((oi) => (
            <div key={oi.id} className="py-1 flex justify-between">
              <span>{oi.quantity}x {oi.nameSnapshot}</span>
              <span>{formatMoneyArs(oi.priceCentsSnapshot * oi.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-white/[0.08] mt-3 pt-3">
          <span>Subtotal</span>
          <span>{formatMoneyArs(order.subtotalCents)}</span>
        </div>
      </div>

      <form action={pay} className="card space-y-4">
        <input type="hidden" name="orderId" value={order.id} />

        <div>
          <label className="label">Método de pago *</label>
          <select name="method" required className="input">
            <option value="CASH">Efectivo</option>
            <option value="CARD_MANUAL">Tarjeta (manual)</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="MERCADOPAGO_LINK">Mercado Pago (link)</option>
          </select>
        </div>

        <div>
          <label className="label">Monto (ARS) *</label>
          <input
            name="amount"
            required
            defaultValue={subtotalDisplay}
            className="input"
            inputMode="decimal"
          />
        </div>

        <div>
          <label className="label">Propina (ARS)</label>
          <input
            name="tip"
            defaultValue="0"
            className="input"
            inputMode="decimal"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <Link href={`/admin/ordenes/${order.id}`} className="btn-ghost">
            Volver
          </Link>
          <button className="btn-primary">Registrar pago</button>
        </div>
      </form>
    </div>
  );
}
