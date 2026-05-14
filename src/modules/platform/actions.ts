"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { requirePlatformAdmin } from "@/lib/rbac";
import type { RestaurantStatus } from "@prisma/client";

const editRestaurantSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Solo minusculas, numeros y guiones"),
  phone: z.string().max(30).optional(),
  whatsappPhone: z.string().max(30).optional(),
  address: z.string().max(200).optional(),
});

export async function updateRestaurant(formData: FormData) {
  await requirePlatformAdmin();
  const id = String(formData.get("id") ?? "");

  const parsed = editRestaurantSchema.parse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
    whatsappPhone: formData.get("whatsappPhone") ? String(formData.get("whatsappPhone")) : undefined,
    address: formData.get("address") ? String(formData.get("address")) : undefined,
  });

  const current = await prisma.restaurant.findUniqueOrThrow({ where: { id } });
  if (parsed.slug !== current.slug) {
    const taken = await prisma.restaurant.findUnique({ where: { slug: parsed.slug } });
    if (taken) throw new Error(`El slug "${parsed.slug}" ya esta en uso.`);
  }

  await prisma.restaurant.update({
    where: { id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      phone: parsed.phone || null,
      whatsappPhone: parsed.whatsappPhone || null,
      address: parsed.address || null,
    },
  });

  revalidatePath(`/platform/restaurants/${id}`);
  revalidatePath("/platform/restaurants");
}

export async function changeRestaurantStatus(formData: FormData) {
  await requirePlatformAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as RestaurantStatus;

  if (!["ACTIVE", "SUSPENDED", "TRIAL"].includes(status)) {
    throw new Error("Estado inválido");
  }

  await prisma.restaurant.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/platform/restaurants/${id}`);
  revalidatePath("/platform/restaurants");
}

export async function deleteRestaurant(formData: FormData) {
  await requirePlatformAdmin();
  const id = String(formData.get("id") ?? "");

  await prisma.restaurant.delete({ where: { id } });

  revalidatePath("/platform/restaurants");
}
