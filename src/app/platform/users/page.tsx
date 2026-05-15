import { prisma } from "@/db/client";
import { requirePlatformAdmin } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/permissions";
import type { RoleCode } from "@prisma/client";

export const metadata = { title: "Usuarios — Plataforma" };

export default async function PlatformUsersPage() {
  await requirePlatformAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      restaurants: {
        include: {
          restaurant: { select: { name: true, slug: true } },
          role: { select: { code: true } },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Todos los usuarios</h1>

      <div className="overflow-x-auto rounded-lg border border-th-border">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-elevated text-th-text-primary">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Restaurante(s)</th>
              <th className="text-left px-4 py-3">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-th-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-elevated">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-th-text-muted">{u.email}</td>
                <td className="px-4 py-3">
                  {u.isPlatformAdmin ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-medium">
                      Super Admin
                    </span>
                  ) : (
                    <span className="text-xs text-th-text-muted">Usuario</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.restaurants.length === 0 ? (
                    <span className="text-th-text-muted text-xs">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {u.restaurants.map((r) => (
                        <span key={r.id} className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated text-th-text-primary">
                          {r.restaurant.name} · {ROLE_LABELS[r.role.code as RoleCode] ?? r.role.code}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-th-text-muted">
                  {u.createdAt.toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
