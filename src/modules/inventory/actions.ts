"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import type { StockUnit } from "@prisma/client";

// =============================================================================
// SCHEMAS
// =============================================================================

const supplierSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(30).optional(),
  email: z.string().email().or(z.literal("")).optional(),
  notes: z.string().max(500).optional(),
});

const rawMaterialSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  unit: z.enum(["KG", "G", "LT", "ML", "UNIT"]),
  costPerUnit: z.coerce.number().min(0).default(0),
  reorderPoint: z.coerce.number().min(0).default(0),
  criticalPoint: z.coerce.number().min(0).default(0),
  supplierId: z.string().optional(),
});

const recipeIngredientSchema = z.object({
  menuItemId: z.string().min(1),
  rawMaterialId: z.string().min(1),
  quantity: z.coerce.number().positive(),
});

const stockEntrySchema = z.object({
  rawMaterialId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  type: z.enum(["PURCHASE", "ADJUSTMENT", "WASTE"]),
  reason: z.string().max(200).optional(),
});

// =============================================================================
// SUPPLIERS
// =============================================================================

export async function createSupplier(formData: FormData) {
  await assertPermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = supplierSchema.parse({
    name: String(formData.get("name") ?? ""),
    phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
    email: formData.get("email") ? String(formData.get("email")) : undefined,
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  await prisma.supplier.create({
    data: {
      restaurantId: restaurant.id,
      name: parsed.name,
      phone: parsed.phone || null,
      email: parsed.email || null,
      notes: parsed.notes || null,
    },
  });

  revalidatePath("/admin/inventario");
}

export async function updateSupplier(formData: FormData) {
  await assertPermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  const parsed = supplierSchema.parse({
    name: String(formData.get("name") ?? ""),
    phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
    email: formData.get("email") ? String(formData.get("email")) : undefined,
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  await prisma.supplier.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: {
      name: parsed.name,
      phone: parsed.phone || null,
      email: parsed.email || null,
      notes: parsed.notes || null,
    },
  });

  revalidatePath("/admin/inventario");
}

export async function deleteSupplier(formData: FormData) {
  await assertPermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.supplier.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });

  revalidatePath("/admin/inventario");
}

// =============================================================================
// RAW MATERIALS
// =============================================================================

export async function createRawMaterial(formData: FormData) {
  await assertPermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = rawMaterialSchema.parse({
    name: String(formData.get("name") ?? ""),
    description: formData.get("description") ? String(formData.get("description")) : undefined,
    unit: String(formData.get("unit") ?? "KG"),
    costPerUnit: formData.get("costPerUnit") ?? 0,
    reorderPoint: formData.get("reorderPoint") ?? 0,
    criticalPoint: formData.get("criticalPoint") ?? 0,
    supplierId: formData.get("supplierId") ? String(formData.get("supplierId")) : undefined,
  });

  await prisma.rawMaterial.create({
    data: {
      restaurantId: restaurant.id,
      name: parsed.name,
      description: parsed.description || null,
      unit: parsed.unit as StockUnit,
      costPerUnit: parsed.costPerUnit,
      reorderPoint: parsed.reorderPoint,
      criticalPoint: parsed.criticalPoint,
      supplierId: parsed.supplierId || null,
    },
  });

  revalidatePath("/admin/inventario");
}

export async function updateRawMaterial(formData: FormData) {
  await assertPermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  const parsed = rawMaterialSchema.parse({
    name: String(formData.get("name") ?? ""),
    description: formData.get("description") ? String(formData.get("description")) : undefined,
    unit: String(formData.get("unit") ?? "KG"),
    costPerUnit: formData.get("costPerUnit") ?? 0,
    reorderPoint: formData.get("reorderPoint") ?? 0,
    criticalPoint: formData.get("criticalPoint") ?? 0,
    supplierId: formData.get("supplierId") ? String(formData.get("supplierId")) : undefined,
  });

  await prisma.rawMaterial.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: {
      name: parsed.name,
      description: parsed.description || null,
      unit: parsed.unit as StockUnit,
      costPerUnit: parsed.costPerUnit,
      reorderPoint: parsed.reorderPoint,
      criticalPoint: parsed.criticalPoint,
      supplierId: parsed.supplierId || null,
    },
  });

  revalidatePath("/admin/inventario");
}

export async function deleteRawMaterial(formData: FormData) {
  await assertPermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.rawMaterial.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });

  revalidatePath("/admin/inventario");
}

// =============================================================================
// RECIPE INGREDIENTS
// =============================================================================

export async function addRecipeIngredient(formData: FormData) {
  await assertPermission("inventory.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = recipeIngredientSchema.parse({
    menuItemId: String(formData.get("menuItemId") ?? ""),
    rawMaterialId: String(formData.get("rawMaterialId") ?? ""),
    quantity: formData.get("quantity"),
  });

  const menuItem = await prisma.menuItem.findFirst({
    where: { id: parsed.menuItemId, restaurantId: restaurant.id },
  });
  if (!menuItem) throw new Error("Plato no encontrado");

  const rawMaterial = await prisma.rawMaterial.findFirst({
    where: { id: parsed.rawMaterialId, restaurantId: restaurant.id },
  });
  if (!rawMaterial) throw new Error("Materia prima no encontrada");

  await prisma.recipeIngredient.upsert({
    where: {
      menuItemId_rawMaterialId: {
        menuItemId: parsed.menuItemId,
        rawMaterialId: parsed.rawMaterialId,
      },
    },
    create: {
      menuItemId: parsed.menuItemId,
      rawMaterialId: parsed.rawMaterialId,
      quantity: parsed.quantity,
    },
    update: { quantity: parsed.quantity },
  });

  revalidatePath("/admin/inventario/recetas");
}

export async function removeRecipeIngredient(formData: FormData) {
  await assertPermission("inventory.edit");
  const id = String(formData.get("id") ?? "");

  await prisma.recipeIngredient.delete({ where: { id } });

  revalidatePath("/admin/inventario/recetas");
}

// =============================================================================
// STOCK MOVEMENTS
// =============================================================================

export async function registerStockEntry(formData: FormData) {
  await assertPermission("inventory.stock");
  const { restaurant, session } = await requireCurrentRestaurant();

  const parsed = stockEntrySchema.parse({
    rawMaterialId: String(formData.get("rawMaterialId") ?? ""),
    quantity: formData.get("quantity"),
    type: String(formData.get("type") ?? "PURCHASE"),
    reason: formData.get("reason") ? String(formData.get("reason")) : undefined,
  });

  const material = await prisma.rawMaterial.findFirst({
    where: { id: parsed.rawMaterialId, restaurantId: restaurant.id },
  });
  if (!material) throw new Error("Materia prima no encontrada");

  const delta = parsed.type === "WASTE" ? -parsed.quantity : parsed.quantity;

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        restaurantId: restaurant.id,
        rawMaterialId: parsed.rawMaterialId,
        type: parsed.type,
        quantity: parsed.quantity,
        reason: parsed.reason || null,
        createdBy: session.user.id,
      },
    }),
    prisma.rawMaterial.update({
      where: { id: parsed.rawMaterialId },
      data: { currentStock: { increment: delta } },
    }),
  ]);

  revalidatePath("/admin/inventario");
}

// =============================================================================
// STOCK DEDUCTION (called when order is closed)
// =============================================================================

export async function deductStockForOrder(orderId: string, restaurantId: string) {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId, status: { not: "CANCELED" } },
    select: { itemId: true, quantity: true },
  });

  for (const oi of orderItems) {
    const recipe = await prisma.recipeIngredient.findMany({
      where: { menuItemId: oi.itemId },
      select: { rawMaterialId: true, quantity: true },
    });

    for (const ingredient of recipe) {
      const deduction = ingredient.quantity * oi.quantity;

      await prisma.$transaction([
        prisma.stockMovement.create({
          data: {
            restaurantId,
            rawMaterialId: ingredient.rawMaterialId,
            type: "SALE",
            quantity: deduction,
            orderId,
          },
        }),
        prisma.rawMaterial.update({
          where: { id: ingredient.rawMaterialId },
          data: { currentStock: { decrement: deduction } },
        }),
      ]);
    }
  }
}
