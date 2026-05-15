"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/db/client";

const registerSchema = z.object({
  restaurantName: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Solo minusculas, numeros y guiones (ej: mi-resto)",
    ),
  ownerName: z.string().min(2).max(80),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Minimo 6 caracteres").max(100),
  phone: z.string().max(30).optional(),
});

export async function registerRestaurant(formData: FormData) {
  const parsed = registerSchema.parse({
    restaurantName: String(formData.get("restaurantName") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    ownerName: String(formData.get("ownerName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
  });

  const existingSlug = await prisma.restaurant.findUnique({
    where: { slug: parsed.slug },
  });
  if (existingSlug) throw new Error("Ese nombre de URL ya esta en uso.");

  const existingEmail = await prisma.user.findUnique({
    where: { email: parsed.email },
  });
  if (existingEmail) throw new Error("Ya existe una cuenta con ese email.");

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        slug: parsed.slug,
        name: parsed.restaurantName,
        phone: parsed.phone || null,
        status: "TRIAL",
      },
    });

    const globalRoles = await tx.role.findMany({
      where: {
        restaurantId: null,
        code: { in: ["OWNER", "MANAGER", "WAITER", "CASHIER", "KITCHEN"] },
      },
      include: { permissions: true },
    });

    for (const template of globalRoles) {
      const tenantRole = await tx.role.create({
        data: {
          code: template.code,
          name: template.name,
          restaurantId: restaurant.id,
        },
      });
      if (template.permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: template.permissions.map((rp) => ({
            roleId: tenantRole.id,
            permissionId: rp.permissionId,
          })),
          skipDuplicates: true,
        });
      }
    }

    const ownerRole = await tx.role.findFirstOrThrow({
      where: { restaurantId: restaurant.id, code: "OWNER" },
    });

    const user = await tx.user.create({
      data: {
        email: parsed.email,
        name: parsed.ownerName,
        passwordHash,
      },
    });

    await tx.userRestaurant.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        roleId: ownerRole.id,
      },
    });
  });

  redirect("/login?registered=1");
}
