import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { ROLE_LABELS } from "@/lib/permissions";
import { SafeForm } from "@/components/safe-form";
import { safeInviteUser, safeChangeUserRole, safeRevokeUser } from "@/modules/users/safe-actions";
import type { RoleCode } from "@prisma/client";

export const metadata = { title: "Usuarios" };

export default async function UsuariosPage() {
  await requirePermission("user.invite");
  const { restaurant } = await requireCurrentRestaurant();

  const [members, roles] = await Promise.all([
    prisma.userRestaurant.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        user: { select: { id: true, email: true, name: true, isPlatformAdmin: true } },
        role: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.role.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Usuarios</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Equipo de {restaurant.name}. Invitá nuevos miembros o cambiá roles.
      </p>

      {/* Invite form */}
      <SafeForm action={safeInviteUser} className="card mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end" successMessage="Usuario invitado">
        <div>
          <label className="label">Nombre *</label>
          <input name="name" required minLength={2} className="input" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input name="email" required type="email" className="input" />
        </div>
        <div>
          <label className="label">Contraseña *</label>
          <input name="password" required minLength={6} type="password" className="input" />
        </div>
        <div>
          <label className="label">Rol *</label>
          <select name="roleId" required className="input">
            <option value="">Elegir...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {ROLE_LABELS[r.code as RoleCode] ?? r.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary">Invitar</button>
      </SafeForm>

      {members.length === 0 ? (
        <div className="card text-center text-zinc-500">Sin usuarios.</div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full text-sm card p-0 overflow-hidden min-w-[560px]">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-2">Rol</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">Desde</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2 font-medium">
                  {m.user.name}
                  {m.user.isPlatformAdmin && (
                    <span className="ml-2 text-xs text-brand-700">admin</span>
                  )}
                </td>
                <td className="px-4 py-2 text-zinc-600 hidden sm:table-cell">{m.user.email}</td>
                <td className="px-4 py-2">
                  <SafeForm action={safeChangeUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="membershipId" value={m.id} />
                    <select
                      name="roleId"
                      defaultValue={m.role.id}
                      className="input !py-1 !text-xs w-auto"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {ROLE_LABELS[r.code as RoleCode] ?? r.name}
                        </option>
                      ))}
                    </select>
                    <button className="text-xs text-brand-600 hover:underline">
                      cambiar
                    </button>
                  </SafeForm>
                </td>
                <td className="px-4 py-2 text-zinc-500 hidden md:table-cell">
                  {m.createdAt.toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-2 text-right">
                  <SafeForm action={safeRevokeUser}>
                    <input type="hidden" name="membershipId" value={m.id} />
                    <button className="text-xs text-red-600 hover:underline">
                      revocar
                    </button>
                  </SafeForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
