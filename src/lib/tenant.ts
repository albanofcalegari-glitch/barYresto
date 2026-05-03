import { notFound } from "next/navigation";
import { prisma } from "@/db/client";
import { auth } from "@/lib/auth";
import { RBACError } from "@/lib/rbac";

/**
 * Helpers para resolver el restaurante (tenant) activo.
 *  - `getCurrentRestaurantId()`: desde la sesión (backoffice).
 *  - `requireCurrentRestaurant()`: garantiza que hay tenant asociado.
 *  - `getPublicRestaurantBySlug()`: desde URL pública (sitio), lanza 404 si no existe/está suspendido.
 */

export async function getCurrentRestaurantId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.restaurantId ?? null;
}

export async function requireCurrentRestaurant() {
  const session = await auth();
  if (!session?.user) throw new RBACError(401, "No autenticado");
  if (session.user.isPlatformAdmin && !session.user.restaurantId) {
    throw new RBACError(400, "Super admin debe elegir un restaurante");
  }
  if (!session.user.restaurantId) {
    throw new RBACError(400, "Sin restaurante asociado");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
  });
  if (!restaurant) throw new RBACError(404, "Restaurante no encontrado");

  return { session, restaurant };
}

export async function getPublicRestaurantBySlug(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { siteContent: true },
  });
  if (!restaurant || restaurant.status === "SUSPENDED") notFound();
  return restaurant;
}
