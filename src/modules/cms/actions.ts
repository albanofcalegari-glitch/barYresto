"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";

const siteSchema = z.object({
  heroTitle: z.string().max(80).optional().nullable(),
  heroSubtitle: z.string().max(160).optional().nullable(),
  heroImage: z.string().url().or(z.literal("")).optional().nullable(),
  aboutText: z.string().max(2000).optional().nullable(),
  addressMapUrl: z.string().url().or(z.literal("")).optional().nullable(),
  instagramUrl: z.string().url().or(z.literal("")).optional().nullable(),
  openingInfo: z.string().max(500).optional().nullable(),
});

const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const restaurantSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(40).regex(slugRegex, "Solo minusculas, numeros y guiones"),
  phone: z.string().max(40).optional().nullable(),
  whatsappPhone: z.string().max(40).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
});

function nullable(val: FormDataEntryValue | null): string | null {
  const v = String(val ?? "").trim();
  return v === "" ? null : v;
}

export async function updateSiteContent(formData: FormData) {
  await assertPermission("site.edit");
  const { restaurant, session } = await requireCurrentRestaurant();

  const parsed = siteSchema.parse({
    heroTitle: nullable(formData.get("heroTitle")),
    heroSubtitle: nullable(formData.get("heroSubtitle")),
    heroImage: nullable(formData.get("heroImage")),
    aboutText: nullable(formData.get("aboutText")),
    addressMapUrl: nullable(formData.get("addressMapUrl")),
    instagramUrl: nullable(formData.get("instagramUrl")),
    openingInfo: nullable(formData.get("openingInfo")),
  });

  await prisma.siteContent.upsert({
    where: { restaurantId: restaurant.id },
    create: { restaurantId: restaurant.id, ...parsed },
    update: parsed,
  });

  await prisma.auditLog.create({
    data: {
      action: "site.edit",
      entity: "SiteContent",
      entityId: restaurant.id,
      restaurantId: restaurant.id,
      userId: session.user.id,
      diff: parsed,
    },
  });

  revalidatePath("/admin/sitio");
  revalidatePath(`/${restaurant.slug}`);
}

export async function updateRestaurantInfo(formData: FormData) {
  await assertPermission("restaurant.edit");
  const { restaurant, session } = await requireCurrentRestaurant();

  const parsed = restaurantSchema.parse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    phone: nullable(formData.get("phone")),
    whatsappPhone: nullable(formData.get("whatsappPhone")),
    address: nullable(formData.get("address")),
  });

  if (parsed.slug !== restaurant.slug) {
    const taken = await prisma.restaurant.findUnique({ where: { slug: parsed.slug } });
    if (taken) throw new Error(`El slug "${parsed.slug}" ya esta en uso.`);
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: parsed,
  });

  await prisma.auditLog.create({
    data: {
      action: "restaurant.edit",
      entity: "Restaurant",
      entityId: restaurant.id,
      restaurantId: restaurant.id,
      userId: session.user.id,
      diff: parsed,
    },
  });

  revalidatePath("/admin/config");
  revalidatePath(`/${restaurant.slug}`);
}
