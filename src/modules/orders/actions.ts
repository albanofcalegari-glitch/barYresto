"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import type { PaymentMethod } from "@prisma/client";

// =============================================================================
// OPEN ORDER
// =============================================================================

const openOrderSchema = z.object({
  tableId: z.string().min(1),
  guests: z.coerce.number().int().min(1).max(50).optional(),
  type: z.enum(["DINE_IN", "TAKEAWAY"]).default("DINE_IN"),
});

export async function openOrder(formData: FormData) {
  await assertPermission("order.create");
  const { restaurant, session } = await requireCurrentRestaurant();

  const parsed = openOrderSchema.parse({
    tableId: String(formData.get("tableId") ?? ""),
    guests: formData.get("guests") || undefined,
    type: formData.get("type") ?? "DINE_IN",
  });

  const lastOrder = await prisma.order.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: parsed.tableId,
      waiterId: session.user.id,
      code: (lastOrder?.code ?? 0) + 1,
      guests: parsed.guests,
      type: parsed.type,
    },
  });

  revalidatePath("/admin/ordenes");
}

// =============================================================================
// ADD ITEMS TO ORDER
// =============================================================================

const addItemSchema = z.object({
  orderId: z.string().min(1),
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(50).default(1),
  notes: z.string().max(200).optional(),
});

export async function addItemToOrder(formData: FormData) {
  await assertPermission("order.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = addItemSchema.parse({
    orderId: String(formData.get("orderId") ?? ""),
    itemId: String(formData.get("itemId") ?? ""),
    quantity: formData.get("quantity") ?? 1,
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  const order = await prisma.order.findFirst({
    where: { id: parsed.orderId, restaurantId: restaurant.id, status: { in: ["OPEN", "FIRED", "SERVING"] } },
  });
  if (!order) throw new Error("Orden no encontrada o cerrada");

  const menuItem = await prisma.menuItem.findFirst({
    where: { id: parsed.itemId, restaurantId: restaurant.id, available: true },
  });
  if (!menuItem) throw new Error("Producto no disponible");

  await prisma.$transaction([
    prisma.orderItem.create({
      data: {
        orderId: order.id,
        itemId: menuItem.id,
        nameSnapshot: menuItem.name,
        priceCentsSnapshot: menuItem.priceCents,
        quantity: parsed.quantity,
        notes: parsed.notes ?? null,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        subtotalCents: { increment: menuItem.priceCents * parsed.quantity },
        totalCents: { increment: menuItem.priceCents * parsed.quantity },
      },
    }),
  ]);

  revalidatePath("/admin/ordenes");
}

// =============================================================================
// REMOVE ITEM FROM ORDER
// =============================================================================

export async function removeItemFromOrder(formData: FormData) {
  await assertPermission("order.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const orderItemId = String(formData.get("orderItemId") ?? "");

  const oi = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { select: { id: true, restaurantId: true, status: true } } },
  });
  if (!oi || oi.order.restaurantId !== restaurant.id) throw new Error("No encontrado");
  if (!["OPEN", "FIRED", "SERVING"].includes(oi.order.status)) throw new Error("Orden cerrada");

  const amount = oi.priceCentsSnapshot * oi.quantity;

  await prisma.$transaction([
    prisma.orderItem.delete({ where: { id: orderItemId } }),
    prisma.order.update({
      where: { id: oi.orderId },
      data: {
        subtotalCents: { decrement: amount },
        totalCents: { decrement: amount },
      },
    }),
  ]);

  revalidatePath("/admin/ordenes");
}

// =============================================================================
// FIRE ORDER (send to kitchen)
// =============================================================================

export async function fireOrder(formData: FormData) {
  await assertPermission("order.fire");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.$transaction([
    prisma.order.updateMany({
      where: { id, restaurantId: restaurant.id, status: "OPEN" },
      data: { status: "FIRED", firedAt: new Date() },
    }),
    prisma.orderItem.updateMany({
      where: { orderId: id, status: "PENDING" },
      data: { status: "FIRED" },
    }),
  ]);
  revalidatePath("/admin/ordenes");
}

// =============================================================================
// CLOSE ORDER (request payment)
// =============================================================================

export async function requestClose(formData: FormData) {
  await assertPermission("order.close");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.order.updateMany({
    where: { id, restaurantId: restaurant.id, status: { in: ["FIRED", "SERVING"] } },
    data: { status: "CLOSING" },
  });
  revalidatePath("/admin/ordenes");
}

// =============================================================================
// REGISTER PAYMENT
// =============================================================================

const paymentSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(["CASH", "CARD_MANUAL", "TRANSFER", "MERCADOPAGO_LINK", "MERCADOPAGO_QR"]),
  amountCents: z.coerce.number().int().min(1),
  tipCents: z.coerce.number().int().min(0).default(0),
});

function parsePriceCents(raw: FormDataEntryValue | null): number {
  const cleaned = String(raw ?? "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  if (Number.isNaN(n)) throw new Error("Monto inválido");
  return Math.round(n * 100);
}

export async function registerPayment(formData: FormData) {
  await assertPermission("payment.create");
  const { restaurant, session } = await requireCurrentRestaurant();

  const parsed = paymentSchema.parse({
    orderId: String(formData.get("orderId") ?? ""),
    method: String(formData.get("method") ?? "CASH"),
    amountCents: parsePriceCents(formData.get("amount")),
    tipCents: formData.get("tip") ? parsePriceCents(formData.get("tip")) : 0,
  });

  const order = await prisma.order.findFirst({
    where: { id: parsed.orderId, restaurantId: restaurant.id, status: "CLOSING" },
  });
  if (!order) throw new Error("Orden no en estado de cierre");

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        restaurantId: restaurant.id,
        orderId: order.id,
        method: parsed.method as PaymentMethod,
        amountCents: parsed.amountCents,
        tipCents: parsed.tipCents,
        status: "APPROVED",
        paidAt: new Date(),
        createdBy: session.user.id,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        tipCents: parsed.tipCents,
        totalCents: order.subtotalCents + parsed.tipCents,
      },
    }),
  ]);

  revalidatePath("/admin/ordenes");
}

// =============================================================================
// CANCEL ORDER
// =============================================================================

export async function cancelOrder(formData: FormData) {
  await assertPermission("order.cancel");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.$transaction([
    prisma.order.updateMany({
      where: {
        id,
        restaurantId: restaurant.id,
        status: { in: ["OPEN", "FIRED", "SERVING", "CLOSING"] },
      },
      data: { status: "CANCELED", closedAt: new Date() },
    }),
    prisma.orderItem.updateMany({
      where: { orderId: id, status: { not: "CANCELED" } },
      data: { status: "CANCELED" },
    }),
  ]);
  revalidatePath("/admin/ordenes");
}
