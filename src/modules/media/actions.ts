"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { deleteImage } from "@/lib/cloudinary";

const addSchema = z.object({
  url: z.string().url(),
  publicId: z.string().default(""),
  kind: z.enum(["GALLERY", "LOGO", "DISH", "HERO"]),
  alt: z.string().max(200).optional().nullable(),
});

export async function addMediaAsset(formData: FormData) {
  await assertPermission("site.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = addSchema.parse({
    url: String(formData.get("url") ?? ""),
    publicId: String(formData.get("publicId") ?? ""),
    kind: String(formData.get("kind") ?? "GALLERY"),
    alt: String(formData.get("alt") ?? "").trim() || null,
  });

  const maxOrder = await prisma.mediaAsset.aggregate({
    where: { restaurantId: restaurant.id, kind: parsed.kind },
    _max: { orderIndex: true },
  });

  await prisma.mediaAsset.create({
    data: {
      restaurantId: restaurant.id,
      url: parsed.url,
      publicId: parsed.publicId,
      kind: parsed.kind,
      alt: parsed.alt,
      orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
    },
  });

  revalidatePath("/admin/sitio/galeria");
  revalidatePath(`/${restaurant.slug}`);
}

export async function deleteMediaAsset(formData: FormData) {
  await assertPermission("site.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const id = String(formData.get("id"));
  const asset = await prisma.mediaAsset.findFirst({
    where: { id, restaurantId: restaurant.id },
  });

  if (!asset) throw new Error("Imagen no encontrada");

  if (asset.publicId) {
    await deleteImage(asset.publicId).catch(() => {});
  }

  await prisma.mediaAsset.delete({ where: { id } });

  revalidatePath("/admin/sitio/galeria");
  revalidatePath(`/${restaurant.slug}`);
}

export async function reorderMediaAsset(formData: FormData) {
  await assertPermission("site.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const id = String(formData.get("id"));
  const direction = String(formData.get("direction")); // "up" | "down"

  const asset = await prisma.mediaAsset.findFirst({
    where: { id, restaurantId: restaurant.id },
  });
  if (!asset) throw new Error("Imagen no encontrada");

  const sibling = await prisma.mediaAsset.findFirst({
    where: {
      restaurantId: restaurant.id,
      kind: asset.kind,
      orderIndex: direction === "up"
        ? { lt: asset.orderIndex }
        : { gt: asset.orderIndex },
    },
    orderBy: { orderIndex: direction === "up" ? "desc" : "asc" },
  });

  if (sibling) {
    await prisma.$transaction([
      prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { orderIndex: sibling.orderIndex },
      }),
      prisma.mediaAsset.update({
        where: { id: sibling.id },
        data: { orderIndex: asset.orderIndex },
      }),
    ]);
  }

  revalidatePath("/admin/sitio/galeria");
  revalidatePath(`/${restaurant.slug}`);
}
