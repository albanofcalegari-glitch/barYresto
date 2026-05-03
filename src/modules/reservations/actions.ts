"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import type { ReservationSource } from "@prisma/client";

// =============================================================================
// SCHEMAS
// =============================================================================

const publicReservationSchema = z.object({
  contactName: z.string().min(2).max(80),
  contactPhone: z.string().min(6).max(30),
  contactEmail: z.string().email().or(z.literal("")).optional(),
  pax: z.coerce.number().int().min(1).max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional(),
});

const backofficeReservationSchema = publicReservationSchema.extend({
  source: z.enum(["BACKOFFICE", "PHONE", "WHATSAPP"]).default("BACKOFFICE"),
  tableId: z.string().optional(),
});

// =============================================================================
// PUBLIC — create reservation from the public site
// =============================================================================

export async function createPublicReservation(
  slug: string,
  formData: FormData,
) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });
  if (!restaurant || restaurant.status === "SUSPENDED") {
    throw new Error("Restaurante no encontrado");
  }

  const parsed = publicReservationSchema.parse({
    contactName: String(formData.get("contactName") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
    contactEmail: formData.get("contactEmail")
      ? String(formData.get("contactEmail"))
      : "",
    pax: formData.get("pax"),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  const startsAt = new Date(`${parsed.date}T${parsed.time}:00`);
  if (startsAt < new Date()) {
    throw new Error("No podés reservar en el pasado");
  }

  const customer = await prisma.customer.upsert({
    where: {
      restaurantId_phone: {
        restaurantId: restaurant.id,
        phone: parsed.contactPhone,
      },
    },
    create: {
      restaurantId: restaurant.id,
      name: parsed.contactName,
      phone: parsed.contactPhone,
      email: parsed.contactEmail || null,
    },
    update: {
      name: parsed.contactName,
      ...(parsed.contactEmail ? { email: parsed.contactEmail } : {}),
    },
  });

  const reservation = await prisma.reservation.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer.id,
      startsAt,
      pax: parsed.pax,
      contactName: parsed.contactName,
      contactPhone: parsed.contactPhone,
      contactEmail: parsed.contactEmail || null,
      notes: parsed.notes ?? null,
      source: "WEB",
      status: "PENDING",
    },
  });

  revalidatePath("/admin/reservas");
  return reservation.publicToken;
}

// =============================================================================
// BACKOFFICE — create reservation manually
// =============================================================================

export async function createBackofficeReservation(formData: FormData) {
  await assertPermission("reservation.create");
  const { restaurant, session } = await requireCurrentRestaurant();

  const parsed = backofficeReservationSchema.parse({
    contactName: String(formData.get("contactName") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
    contactEmail: formData.get("contactEmail")
      ? String(formData.get("contactEmail"))
      : "",
    pax: formData.get("pax"),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
    source: formData.get("source") ?? "BACKOFFICE",
    tableId: formData.get("tableId") ? String(formData.get("tableId")) : undefined,
  });

  const startsAt = new Date(`${parsed.date}T${parsed.time}:00`);

  const customer = await prisma.customer.upsert({
    where: {
      restaurantId_phone: {
        restaurantId: restaurant.id,
        phone: parsed.contactPhone,
      },
    },
    create: {
      restaurantId: restaurant.id,
      name: parsed.contactName,
      phone: parsed.contactPhone,
      email: parsed.contactEmail || null,
    },
    update: {
      name: parsed.contactName,
      ...(parsed.contactEmail ? { email: parsed.contactEmail } : {}),
    },
  });

  await prisma.reservation.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer.id,
      tableId: parsed.tableId || null,
      startsAt,
      pax: parsed.pax,
      contactName: parsed.contactName,
      contactPhone: parsed.contactPhone,
      contactEmail: parsed.contactEmail || null,
      notes: parsed.notes ?? null,
      source: parsed.source as ReservationSource,
      status: "CONFIRMED",
      confirmedAt: new Date(),
      createdBy: session.user.id,
    },
  });

  revalidatePath("/admin/reservas");
}

// =============================================================================
// STATUS TRANSITIONS
// =============================================================================

export async function confirmReservation(formData: FormData) {
  await assertPermission("reservation.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.reservation.updateMany({
    where: { id, restaurantId: restaurant.id, status: "PENDING" },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });
  revalidatePath("/admin/reservas");
}

export async function cancelReservation(formData: FormData) {
  await assertPermission("reservation.cancel");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.reservation.updateMany({
    where: {
      id,
      restaurantId: restaurant.id,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    data: { status: "CANCELED", canceledAt: new Date() },
  });
  revalidatePath("/admin/reservas");
}

export async function markArrived(formData: FormData) {
  await assertPermission("reservation.checkin");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.reservation.updateMany({
    where: { id, restaurantId: restaurant.id, status: "CONFIRMED" },
    data: { status: "ARRIVED", arrivedAt: new Date() },
  });
  revalidatePath("/admin/reservas");
}

export async function markNoShow(formData: FormData) {
  await assertPermission("reservation.checkin");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  await prisma.reservation.updateMany({
    where: { id, restaurantId: restaurant.id, status: "CONFIRMED" },
    data: { status: "NO_SHOW" },
  });
  revalidatePath("/admin/reservas");
}

export async function completeReservation(formData: FormData) {
  await assertPermission("reservation.checkin");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");

  const reservation = await prisma.reservation.findFirst({
    where: { id, restaurantId: restaurant.id, status: "ARRIVED" },
  });
  if (!reservation) return;

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id },
      data: { status: "COMPLETED" },
    }),
    ...(reservation.customerId
      ? [
          prisma.customer.update({
            where: { id: reservation.customerId },
            data: {
              visitsCount: { increment: 1 },
              lastVisitAt: new Date(),
            },
          }),
        ]
      : []),
  ]);
  revalidatePath("/admin/reservas");
}

// =============================================================================
// ASSIGN TABLE
// =============================================================================

export async function assignTable(formData: FormData) {
  await assertPermission("reservation.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const id = String(formData.get("id") ?? "");
  const tableId = String(formData.get("tableId") ?? "") || null;

  await prisma.reservation.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: { tableId },
  });
  revalidatePath("/admin/reservas");
}

// =============================================================================
// PUBLIC — cancel by token
// =============================================================================

export async function cancelByToken(token: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { publicToken: token },
  });
  if (!reservation) throw new Error("Reserva no encontrada");
  if (!["PENDING", "CONFIRMED"].includes(reservation.status)) {
    throw new Error("Esta reserva ya no se puede cancelar");
  }

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CANCELED", canceledAt: new Date() },
  });
  revalidatePath("/admin/reservas");
}
