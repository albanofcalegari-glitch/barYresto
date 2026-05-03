"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";

// =============================================================================
// CATEGORIES
// =============================================================================

const categorySchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(200).optional().nullable(),
  orderIndex: z.coerce.number().int().min(0).max(999).default(0),
  visible: z.boolean().default(true),
});

export async function createCategory(formData: FormData) {
  await assertPermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const last = await prisma.menuCategory.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { orderIndex: "desc" },
  });

  const parsed = categorySchema.parse({
    name: String(formData.get("name") ?? ""),
    description: formData.get("description") ? String(formData.get("description")) : null,
    orderIndex: formData.get("orderIndex") ?? (last ? last.orderIndex + 1 : 0),
    visible: formData.get("visible") !== "false",
  });

  await prisma.menuCategory.create({
    data: { ...parsed, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/menu");
  revalidatePath(`/${restaurant.slug}/menu`);
}

export async function updateCategory(formData: FormData) {
  await assertPermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  const parsed = categorySchema.partial().parse({
    name: formData.get("name") ? String(formData.get("name")) : undefined,
    description: formData.get("description")
      ? String(formData.get("description"))
      : null,
    orderIndex: formData.get("orderIndex"),
    visible: formData.get("visible") === "on" || formData.get("visible") === "true",
  });

  await prisma.menuCategory.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: parsed,
  });
  revalidatePath("/admin/menu");
  revalidatePath(`/${restaurant.slug}/menu`);
}

export async function deleteCategory(formData: FormData) {
  await assertPermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  const itemsCount = await prisma.menuItem.count({
    where: { categoryId: id, restaurantId: restaurant.id },
  });
  if (itemsCount > 0) {
    throw new Error("No se puede borrar una categoría con productos. Movelos o borralos primero.");
  }
  await prisma.menuCategory.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/menu");
}

// =============================================================================
// ITEMS
// =============================================================================

const itemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  priceCents: z.coerce.number().int().min(1),
  imageUrl: z.string().url().or(z.literal("")).optional().nullable(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  available: z.boolean().default(true),
  orderIndex: z.coerce.number().int().min(0).default(0),
});

function parseTags(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
}

function parsePriceArs(raw: FormDataEntryValue | null): number {
  // Acepta "12500" o "12.500" o "12500,50" y lo convierte a centavos.
  const cleaned = String(raw ?? "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  if (Number.isNaN(n)) throw new Error("Precio inválido");
  return Math.round(n * 100);
}

export async function createItem(formData: FormData) {
  await assertPermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = itemSchema.parse({
    categoryId: String(formData.get("categoryId") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: formData.get("description") ? String(formData.get("description")) : null,
    priceCents: parsePriceArs(formData.get("priceArs")),
    imageUrl: formData.get("imageUrl") ? String(formData.get("imageUrl")) : null,
    tags: parseTags(formData.get("tags")),
    featured: formData.get("featured") === "on",
    available: formData.get("available") !== "false",
    orderIndex: formData.get("orderIndex") ?? 0,
  });

  // categoryId debe pertenecer al tenant
  const cat = await prisma.menuCategory.findFirst({
    where: { id: parsed.categoryId, restaurantId: restaurant.id },
  });
  if (!cat) throw new Error("Categoría inválida");

  await prisma.menuItem.create({
    data: {
      ...parsed,
      imageUrl: parsed.imageUrl || null,
      restaurantId: restaurant.id,
    },
  });
  revalidatePath("/admin/menu");
  revalidatePath(`/${restaurant.slug}/menu`);
}

export async function updateItem(formData: FormData) {
  await assertPermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  const parsed = itemSchema.parse({
    categoryId: String(formData.get("categoryId") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: formData.get("description") ? String(formData.get("description")) : null,
    priceCents: parsePriceArs(formData.get("priceArs")),
    imageUrl: formData.get("imageUrl") ? String(formData.get("imageUrl")) : null,
    tags: parseTags(formData.get("tags")),
    featured: formData.get("featured") === "on",
    available: formData.get("available") !== "false",
    orderIndex: formData.get("orderIndex") ?? 0,
  });

  await prisma.menuItem.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: { ...parsed, imageUrl: parsed.imageUrl || null },
  });
  revalidatePath("/admin/menu");
  revalidatePath(`/${restaurant.slug}/menu`);
}

export async function deleteItem(formData: FormData) {
  await assertPermission("menu.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");
  await prisma.menuItem.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/menu");
  revalidatePath(`/${restaurant.slug}/menu`);
}

export async function toggleItemAvailability(formData: FormData) {
  await assertPermission("menu.availability");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");
  const item = await prisma.menuItem.findFirst({
    where: { id, restaurantId: restaurant.id },
  });
  if (!item) throw new Error("Producto no encontrado");
  await prisma.menuItem.update({
    where: { id: item.id },
    data: { available: !item.available },
  });
  revalidatePath("/admin/menu");
  revalidatePath(`/${restaurant.slug}/menu`);
}
