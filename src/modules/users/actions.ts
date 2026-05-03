"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/db/client";
import { assertPermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import bcrypt from "bcryptjs";

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: z.string().min(6).max(100),
  roleId: z.string().min(1),
});

export async function inviteUser(formData: FormData) {
  await assertPermission("user.invite");
  const { restaurant } = await requireCurrentRestaurant();

  const parsed = inviteSchema.parse({
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
    password: String(formData.get("password") ?? ""),
    roleId: String(formData.get("roleId") ?? ""),
  });

  const role = await prisma.role.findFirst({
    where: { id: parsed.roleId, restaurantId: restaurant.id },
  });
  if (!role) throw new Error("Rol inválido");

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  let user = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (user) {
    const existing = await prisma.userRestaurant.findUnique({
      where: {
        userId_restaurantId: {
          userId: user.id,
          restaurantId: restaurant.id,
        },
      },
    });
    if (existing) throw new Error("Este usuario ya pertenece al restaurante");

    await prisma.userRestaurant.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        roleId: parsed.roleId,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name,
        passwordHash,
      },
    });
    await prisma.userRestaurant.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        roleId: parsed.roleId,
      },
    });
  }

  revalidatePath("/admin/usuarios");
}

export async function changeUserRole(formData: FormData) {
  await assertPermission("user.edit");
  const { restaurant } = await requireCurrentRestaurant();
  const membershipId = String(formData.get("membershipId") ?? "");
  const roleId = String(formData.get("roleId") ?? "");

  const role = await prisma.role.findFirst({
    where: { id: roleId, restaurantId: restaurant.id },
  });
  if (!role) throw new Error("Rol inválido");

  await prisma.userRestaurant.updateMany({
    where: { id: membershipId, restaurantId: restaurant.id },
    data: { roleId },
  });
  revalidatePath("/admin/usuarios");
}

export async function revokeUser(formData: FormData) {
  await assertPermission("user.revoke");
  const { restaurant } = await requireCurrentRestaurant();
  const membershipId = String(formData.get("membershipId") ?? "");

  await prisma.userRestaurant.deleteMany({
    where: { id: membershipId, restaurantId: restaurant.id },
  });
  revalidatePath("/admin/usuarios");
}
