"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";

const customerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
});

export async function createCustomer(formData: FormData) {
  await assertPermission("customer.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = customerSchema.parse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  await prisma.customer.create({
    data: {
      restaurantId: restaurant.id,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone || null,
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
    email: String(formData.get("email") ?? ""),
    phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  await prisma.customer.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone || null,
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
