import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { upsertBusinessHours } from "@/modules/hours/actions";
import { safeCreateSpecialDay, safeDeleteSpecialDay } from "@/modules/hours/safe-actions";
import { SafeForm } from "@/components/safe-form";
import { BusinessHoursEditor } from "./editor";

export const metadata = { title: "Horarios y feriados" };

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function HoursPage() {
  await requirePermission("hours.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const [hours, special] = await Promise.all([
    prisma.businessHours.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: [{ weekday: "asc" }, { openTime: "asc" }],
    }),
    prisma.specialDay.findMany({
      where: { restaurantId: restaurant.id, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-heading font-bold mb-1">Horarios</h1>
        <p className="text-sm text-th-text-muted mb-6">
          Franjas por día de la semana. Podés tener varias por día (ej: mediodía + noche).
        </p>

        <BusinessHoursEditor
          action={upsertBusinessHours}
          initial={hours.map((h) => ({
            weekday: h.weekday,
            openTime: h.openTime,
            closeTime: h.closeTime,
          }))}
          weekdayLabels={WEEKDAYS}
        />
      </section>

      <section>
        <h2 className="text-xl font-heading font-bold mb-1">Días especiales / feriados</h2>
        <p className="text-sm text-th-text-muted mb-6">
          Marcá días donde el local está cerrado o tiene horario distinto.
        </p>

        <SafeForm action={safeCreateSpecialDay} className="card grid grid-cols-1 md:grid-cols-5 gap-3 items-end max-w-3xl" successMessage="Día especial agregado">
          <div className="md:col-span-2">
            <label className="label">Fecha</label>
            <input name="date" type="date" required className="input" />
          </div>
          <div>
            <label className="label">Cerrado</label>
            <select name="closed" className="input">
              <option value="true">Sí</option>
              <option value="false">No (horario distinto)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Nota</label>
            <input name="note" placeholder="Feriado nacional" className="input" />
          </div>
          <button className="btn-primary md:col-span-5 md:w-auto">Agregar</button>
        </SafeForm>

        <div className="mt-6">
          {special.length === 0 ? (
            <div className="text-sm text-th-text-muted">Sin días especiales cargados.</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm card p-0 overflow-hidden min-w-[440px]">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="text-left px-4 py-2">Fecha</th>
                  <th className="text-left px-4 py-2">Estado</th>
                  <th className="text-left px-4 py-2">Nota</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-th-border">
                {special.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2">
                      {new Date(s.date).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      {s.closed ? "Cerrado" : `${s.openTime} a ${s.closeTime}`}
                    </td>
                    <td className="px-4 py-2 text-th-text-muted">{s.note ?? ""}</td>
                    <td className="px-4 py-2 text-right">
                      <SafeForm action={safeDeleteSpecialDay}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="text-red-400 hover:underline text-xs">
                          Eliminar
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
      </section>
    </div>
  );
}
