import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_MODULES } from "@/lib/permissions";
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

  const assignableRoles = roles.filter((r) => r.code !== "SUPER_ADMIN");

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-1">Usuarios</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Equipo de {restaurant.name}. Invitá nuevos miembros o cambiá roles.
      </p>

      {/* Invite form */}
      <SafeForm action={safeInviteUser} className="card mb-6 space-y-4" successMessage="Usuario invitado">
        <h2 className="font-heading font-semibold">Invitar nuevo usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Nombre *</label>
            <input name="name" required minLength={2} className="input" placeholder="Juan Pérez" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input name="email" required type="email" className="input" placeholder="juan@email.com" />
          </div>
          <div>
            <label className="label">Contraseña *</label>
            <input name="password" required minLength={6} type="password" className="input" />
          </div>
          <div>
            <label className="label">Rol *</label>
            <select name="roleId" required className="input">
              <option value="">Elegir...</option>
              {assignableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {ROLE_LABELS[r.code as RoleCode] ?? r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primary">Invitar</button>
      </SafeForm>

      {/* Members table */}
      {members.length === 0 ? (
        <div className="card text-center text-zinc-500">Sin usuarios.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm card p-0 overflow-hidden">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="text-left px-4 py-2">Nombre</th>
                <th className="text-left px-4 py-2 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-2">Rol</th>
                <th className="text-left px-4 py-2 hidden md:table-cell">Desde</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 font-medium">
                    {m.user.name}
                    {m.user.isPlatformAdmin && (
                      <span className="ml-2 text-xs text-brand-300">admin</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-zinc-400 hidden sm:table-cell">{m.user.email}</td>
                  <td className="px-4 py-2">
                    <SafeForm action={safeChangeUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <select
                        name="roleId"
                        defaultValue={m.role.id}
                        className="input !py-1 !text-xs w-auto"
                      >
                        {assignableRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {ROLE_LABELS[r.code as RoleCode] ?? r.name}
                          </option>
                        ))}
                      </select>
                      <button className="text-xs text-brand-400 hover:underline">
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
                      <button className="text-xs text-red-400 hover:underline">
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

      {/* Roles reference */}
      <div className="mt-8">
        <h2 className="text-lg font-heading font-semibold mb-3">Referencia de roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {assignableRoles.map((r) => {
            const code = r.code as RoleCode;
            const modules = ROLE_MODULES[code] ?? [];
            return (
              <div key={r.id} className="card">
                <div className="font-semibold text-brand-300">
                  {ROLE_LABELS[code] ?? r.name}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {ROLE_DESCRIPTIONS[code] ?? ""}
                </p>
                {modules.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {modules.map((mod) => (
                      <span key={mod} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                        {mod}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
