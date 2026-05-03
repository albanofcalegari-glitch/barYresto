import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { PermissionCode } from "@/lib/permissions";

export class RBACError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Para páginas: garantiza sesión o redirige a /login.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/**
 * Para páginas: exige uno o más permisos. Redirige a /login si no hay sesión,
 * a /admin si la sesión existe pero carece del permiso.
 */
export async function requirePermission(...codes: PermissionCode[]) {
  const session = await requireSession();
  if (session.user.isPlatformAdmin) return session;
  const has = codes.every((c) => session.user.permissions.includes(c));
  if (!has) redirect("/admin?error=forbidden");
  return session;
}

/**
 * Para API routes / server actions: tira error en lugar de redirigir.
 */
export async function assertPermission(...codes: PermissionCode[]) {
  const session = await auth();
  if (!session?.user) throw new RBACError(401, "No autenticado");
  if (session.user.isPlatformAdmin) return session;
  const has = codes.every((c) => session.user.permissions.includes(c));
  if (!has) throw new RBACError(403, "Permiso denegado");
  return session;
}

export async function requirePlatformAdmin() {
  const session = await requireSession();
  if (!session.user.isPlatformAdmin) redirect("/admin?error=forbidden");
  return session;
}

export function hasPermission(
  permissions: PermissionCode[],
  ...codes: PermissionCode[]
) {
  return codes.every((c) => permissions.includes(c));
}
