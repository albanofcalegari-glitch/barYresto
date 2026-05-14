import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePlatformAdmin } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/permissions";
import { SafeForm } from "@/components/safe-form";
import { safeUpdateRestaurant, safeChangeRestaurantStatus } from "@/modules/platform/safe-actions";
import type { RoleCode, RestaurantStatus } from "@prisma/client";

export const metadata = { title: "Detalle restaurante" };

const STATUS_STYLES: Record<RestaurantStatus, { label: string; cls: string }> = {
  ACTIVE: { label: "Activo", cls: "bg-emerald-500/20 text-emerald-400" },
  TRIAL: { label: "Prueba", cls: "bg-amber-500/20 text-amber-400" },
  SUSPENDED: { label: "Suspendido", cls: "bg-red-500/20 text-red-400" },
};

export default async function RestaurantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePlatformAdmin();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: params.id },
    include: {
      plan: { select: { name: true } },
      users: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          role: { select: { code: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { reservations: true, orders: true, items: true, tables: true, rawMaterials: true },
      },
    },
  });
  if (!restaurant) notFound();

  const s = STATUS_STYLES[restaurant.status];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/platform/restaurants" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← Restaurantes
          </Link>
          <h1 className="text-2xl font-heading font-bold mt-2">{restaurant.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <code className="text-sm text-zinc-400">/{restaurant.slug}</code>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
              {s.label}
            </span>
            {restaurant.plan && (
              <span className="text-xs text-zinc-500">Plan: {restaurant.plan.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Usuarios", value: restaurant.users.length },
          { label: "Mesas", value: restaurant._count.tables },
          { label: "Platos", value: restaurant._count.items },
          { label: "Reservas", value: restaurant._count.reservations },
          { label: "Órdenes", value: restaurant._count.orders },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-white/[0.08] bg-surface-card p-3 text-center">
            <div className="text-xl font-bold">{m.value}</div>
            <div className="text-xs text-zinc-400">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit form */}
        <div>
          <h2 className="text-lg font-heading font-semibold mb-3">Datos del restaurante</h2>
          <SafeForm
            action={safeUpdateRestaurant}
            className="rounded-lg border border-white/[0.08] bg-surface-card p-5 space-y-4"
            successMessage="Actualizado"
          >
            <input type="hidden" name="id" value={restaurant.id} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-zinc-300">Nombre *</label>
                <input name="name" required defaultValue={restaurant.name} className="input bg-surface border-white/[0.08] text-zinc-100" />
              </div>
              <div>
                <label className="label text-zinc-300">Slug (URL) *</label>
                <input name="slug" required defaultValue={restaurant.slug} pattern="[a-z0-9][a-z0-9\-]*[a-z0-9]" minLength={2} maxLength={40} className="input bg-surface border-white/[0.08] text-zinc-100 font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-zinc-300">Teléfono</label>
                <input name="phone" defaultValue={restaurant.phone ?? ""} className="input bg-surface border-white/[0.08] text-zinc-100" />
              </div>
              <div>
                <label className="label text-zinc-300">WhatsApp</label>
                <input name="whatsappPhone" defaultValue={restaurant.whatsappPhone ?? ""} className="input bg-surface border-white/[0.08] text-zinc-100" />
              </div>
            </div>
            <div>
              <label className="label text-zinc-300">Dirección</label>
              <input name="address" defaultValue={restaurant.address ?? ""} className="input bg-surface border-white/[0.08] text-zinc-100" />
            </div>
            <button className="btn-primary bg-brand-500 hover:bg-brand-600">Guardar</button>
          </SafeForm>
        </div>

        {/* Status + Danger */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-heading font-semibold mb-3">Estado</h2>
            <SafeForm
              action={safeChangeRestaurantStatus}
              className="rounded-lg border border-white/[0.08] bg-surface-card p-5 flex items-end gap-3"
              successMessage="Estado actualizado"
            >
              <input type="hidden" name="id" value={restaurant.id} />
              <div className="flex-1">
                <label className="label text-zinc-300">Estado actual</label>
                <select name="status" defaultValue={restaurant.status} className="input bg-surface border-white/[0.08] text-zinc-100">
                  <option value="ACTIVE">Activo</option>
                  <option value="TRIAL">Prueba</option>
                  <option value="SUSPENDED">Suspendido</option>
                </select>
              </div>
              <button className="btn-primary bg-brand-500 hover:bg-brand-600">Cambiar</button>
            </SafeForm>
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold mb-3">Acceso rápido</h2>
            <div className="rounded-lg border border-white/[0.08] bg-surface-card p-5 space-y-3">
              <a
                href={`/${restaurant.slug}`}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-brand-400 hover:underline"
              >
                Ver sitio público →
              </a>
              <a
                href={`/${restaurant.slug}/menu`}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-brand-400 hover:underline"
              >
                Ver carta →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Users */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-3">
          Usuarios ({restaurant.users.length})
        </h2>
        {restaurant.users.length === 0 ? (
          <div className="rounded-lg border border-white/[0.08] bg-surface-card p-6 text-center text-zinc-400">
            Sin usuarios asignados.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.03] text-zinc-300">
                <tr>
                  <th className="text-left px-4 py-3">Nombre</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3">Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {restaurant.users.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium">{m.user.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{m.user.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-300">
                        {ROLE_LABELS[m.role.code as RoleCode] ?? m.role.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {m.createdAt.toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
