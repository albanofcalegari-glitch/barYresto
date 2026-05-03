"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const hoursSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  openTime: z.string().regex(timeRegex),
  closeTime: z.string().regex(timeRegex),
});

export async function upsertBusinessHours(formData: FormData) {
  await assertPermission("hours.edit");
  const { restaurant } = await requireCurrentRestaurant();

  // Se recibe JSON serializado con array de { weekday, openTime, closeTime }
  const raw = String(formData.get("payload") ?? "[]");
  const list = z
    .array(hoursSchema)
    .parse(JSON.parse(raw))
    .filter((h) => h.openTime < h.closeTime);

  await prisma.$transaction([
    prisma.businessHours.deleteMany({ where: { restaurantId: restaurant.id } }),
    prisma.businessHours.createMany({
      data: list.map((h) => ({ ...h, restaurantId: restaurant.id })),
    }),
  ]);

  revalidatePath("/admin/sitio/horarios");
  revalidatePath(`/${restaurant.slug}`);
}

const specialDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  closed: z.boolean().default(true),
  openTime: z.string().regex(timeRegex).optional().nullable(),
  closeTime: z.string().regex(timeRegex).optional().nullable(),
  note: z.string().max(120).optional().nullable(),
});

export async function createSpecialDay(formData: FormData) {
  await assertPermission("hours.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = specialDaySchema.parse({
    date: String(formData.get("date") ?? ""),
    closed: formData.get("closed") === "on" || formData.get("closed") === "true",
    openTime: formData.get("openTime") ? String(formData.get("openTime")) : null,
    closeTime: formData.get("closeTime") ? String(formData.get("closeTime")) : null,
    note: formData.get("note") ? String(formData.get("note")) : null,
  });

  await prisma.specialDay.upsert({
    where: {
      restaurantId_date: {
        restaurantId: restaurant.id,
        date: new Date(parsed.date),
      },
    },
    create: {
      restaurantId: restaurant.id,
      date: new Date(parsed.date),
      closed: parsed.closed,
      openTime: parsed.closed ? null : parsed.openTime,
      closeTime: parsed.closed ? null : parsed.closeTime,
      note: parsed.note,
    },
    update: {
      closed: parsed.closed,
      openTime: parsed.closed ? null : parsed.openTime,
      closeTime: parsed.closed ? null : parsed.closeTime,
      note: parsed.note,
    },
  });

  revalidatePath("/admin/sitio/horarios");
}

export async function deleteSpecialDay(formData: FormData) {
  await assertPermission("hours.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");
  await prisma.specialDay.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/sitio/horarios");
}
