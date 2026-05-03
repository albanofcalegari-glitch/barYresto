"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";

const customerSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(30),
  email: z.string().email().or(z.literal("")).optional(),
  notes: z.string().max(500).optional(),
});

export async function createCustomer(formData: FormData) {
  await assertPermission("customer.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = customerSchema.parse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: formData.get("email") ? String(formData.get("email")) : "",
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  await prisma.customer.create({
    data: {
      restaurantId: restaurant.id,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email || null,
      notes: parsed.notes ?? null,
    },
  });
  revalidatePath("/admin/clientes");
}

export async function updateCustomer(formData: FormData) {
  await assertPermission("customer.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  const parsed = customerSchema.parse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: formData.get("email") ? String(formData.get("email")) : "",
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  await prisma.customer.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: {
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email || null,
      notes: parsed.notes ?? null,
    },
  });
  revalidatePath("/admin/clientes");
}

export async function deleteCustomer(formData: FormData) {
  await assertPermission("customer.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  const reservations = await prisma.reservation.count({
    where: { customerId: id, restaurantId: restaurant.id },
  });
  if (reservations > 0) {
    throw new Error("No se puede borrar un cliente con reservas asociadas.");
  }
  await prisma.customer.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/clientes");
}
