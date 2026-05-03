import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import {
  safeCreateZone,
  safeDeleteZone,
  safeCreateTable,
  safeDeleteTable,
} from "@/modules/floor/safe-actions";

export const metadata = { title: "Salón" };

export default async function SalonPage() {
  await requirePermission("floor.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const zones = await prisma.zone.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { orderIndex: "asc" },
    include: {
      tables: { orderBy: { code: "asc" } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Salón</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Organizá las zonas (salón, patio, barra) y las mesas con su capacidad.
      </p>

      <SafeForm
        action={safeCreateZone}
        className="card mb-6 flex flex-wrap items-end gap-3"
        successMessage="Zona creada"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="label">Nueva zona</label>
          <input name="name" required placeholder="Ej: Patio" className="input" maxLength={40} />
        </div>
        <div className="w-32">
          <label className="label">Orden</label>
          <input
            name="orderIndex"
            type="number"
            defaultValue={zones.length}
            min={0}
            className="input"
          />
        </div>
        <button className="btn-secondary">Agregar zona</button>
      </SafeForm>

      {zones.length === 0 ? (
        <div className="card text-center text-zinc-500">
          Todavía no hay zonas. Creá la primera arriba (ej: Salón, Patio, Barra).
        </div>
      ) : (
        <div className="space-y-6">
          {zones.map((zone) => (
            <section key={zone.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{zone.name}</h2>
                  <div className="text-xs text-zinc-500">
                    {zone.tables.length} mesa(s) · orden {zone.orderIndex}
                  </div>
                </div>
                <SafeForm action={safeDeleteZone}>
                  <input type="hidden" name="id" value={zone.id} />
                  <button className="text-sm text-red-600 hover:underline">
                    eliminar zona
                  </button>
                </SafeForm>
              </div>

              <SafeForm
                action={safeCreateTable}
                className="mb-4 flex flex-wrap items-end gap-3 border-b pb-4"
                successMessage="Mesa creada"
              >
                <input type="hidden" name="zoneId" value={zone.id} />
                <div className="w-28">
                  <label className="label">Código</label>
                  <input
                    name="code"
                    required
                    placeholder="M1, B2, P3"
                    pattern="[A-Za-z0-9\-]+"
                    maxLength={10}
                    className="input uppercase"
                  />
                </div>
                <div className="w-28">
                  <label className="label">Lugares</label>
                  <input
                    name="seats"
                    type="number"
                    defaultValue={4}
                    min={1}
                    max={30}
                    className="input"
                  />
                </div>
                <button className="btn-secondary">+ mesa</button>
              </SafeForm>

              {zone.tables.length === 0 ? (
                <div className="text-sm text-zinc-500">
                  Sin mesas en esta zona. Agregá la primera arriba.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {zone.tables.map((t) => (
                    <div
                      key={t.id}
                      className="inline-flex items-center gap-2 border border-zinc-200 rounded-md px-3 py-2 bg-zinc-50"
                    >
                      <span className="font-mono font-semibold">{t.code}</span>
                      <span className="text-xs text-zinc-500">{t.seats} lug.</span>
                      <SafeForm action={safeDeleteTable}>
                        <input type="hidden" name="id" value={t.id} />
                        <button className="text-xs text-red-600 hover:underline ml-1">
                          ×
                        </button>
                      </SafeForm>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
