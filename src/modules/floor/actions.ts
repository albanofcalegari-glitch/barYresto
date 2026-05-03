"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";

// =============================================================================
// ZONES
// =============================================================================

const zoneSchema = z.object({
  name: z.string().min(1).max(40),
  orderIndex: z.coerce.number().int().min(0).default(0),
});

export async function createZone(formData: FormData) {
  await assertPermission("floor.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const parsed = zoneSchema.parse({
    name: String(formData.get("name") ?? ""),
    orderIndex: formData.get("orderIndex") ?? 0,
  });
  await prisma.zone.create({
    data: { ...parsed, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/salon");
}

export async function updateZone(formData: FormData) {
  await assertPermission("floor.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");
  const parsed = zoneSchema.parse({
    name: String(formData.get("name") ?? ""),
    orderIndex: formData.get("orderIndex") ?? 0,
  });
  await prisma.zone.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: parsed,
  });
  revalidatePath("/admin/salon");
}

export async function deleteZone(formData: FormData) {
  await assertPermission("floor.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");
  const tablesIn = await prisma.table.count({
    where: { zoneId: id, restaurantId: restaurant.id },
  });
  if (tablesIn > 0) {
    throw new Error("No se puede borrar una zona con mesas. Reasigná o borrá las mesas primero.");
  }
  await prisma.zone.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/salon");
}

// =============================================================================
// TABLES
// =============================================================================

const tableSchema = z.object({
  zoneId: z.string().min(1),
  code: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Za-z0-9-]+$/),
  seats: z.coerce.number().int().min(1).max(30),
});

export async function createTable(formData: FormData) {
  await assertPermission("floor.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const parsed = tableSchema.parse({
    zoneId: String(formData.get("zoneId") ?? ""),
    code: String(formData.get("code") ?? "").toUpperCase(),
    seats: formData.get("seats") ?? 2,
  });

  const zone = await prisma.zone.findFirst({
    where: { id: parsed.zoneId, restaurantId: restaurant.id },
  });
  if (!zone) throw new Error("Zona inválida");

  const existing = await prisma.table.findFirst({
    where: { restaurantId: restaurant.id, code: parsed.code },
  });
  if (existing) throw new Error(`Ya existe una mesa con código ${parsed.code}`);

  await prisma.table.create({
    data: { ...parsed, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/salon");
}

export async function updateTable(formData: FormData) {
  await assertPermission("floor.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");
  const parsed = tableSchema.parse({
    zoneId: String(formData.get("zoneId") ?? ""),
    code: String(formData.get("code") ?? "").toUpperCase(),
    seats: formData.get("seats") ?? 2,
  });
  await prisma.table.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: parsed,
  });
  revalidatePath("/admin/salon");
}

export async function deleteTable(formData: FormData) {
  await assertPermission("floor.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");
  const openOrders = await prisma.order.count({
    where: {
      tableId: id,
      restaurantId: restaurant.id,
      status: { in: ["OPEN", "FIRED", "SERVING", "CLOSING"] },
    },
  });
  if (openOrders > 0) {
    throw new Error("No se puede borrar una mesa con órdenes abiertas.");
  }
  await prisma.table.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/salon");
}
