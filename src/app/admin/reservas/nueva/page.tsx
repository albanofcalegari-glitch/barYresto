import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { createBackofficeReservation } from "@/modules/reservations/actions";

export const metadata = { title: "Nueva reserva" };

export default async function NuevaReservaPage() {
  await requirePermission("reservation.create");
  const { restaurant } = await requireCurrentRestaurant();

  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { code: "asc" },
    include: { zone: { select: { name: true } } },
  });

  async function create(formData: FormData) {
    "use server";
    await createBackofficeReservation(formData);
    redirect("/admin/reservas");
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Nueva reserva</h1>
        <Link href="/admin/reservas" className="text-sm text-zinc-400 hover:underline">
          ← volver
        </Link>
      </div>

      <form action={create} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre *</label>
            <input
              name="contactName"
              required
              minLength={2}
              maxLength={80}
              className="input"
            />
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              name="contactEmail"
              required
              type="email"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Telefono (opcional)</label>
          <input name="contactPhone" type="tel" className="input" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Fecha *</label>
            <input name="date" type="date" required className="input" />
          </div>
          <div>
            <label className="label">Hora *</label>
            <input name="time" type="time" required className="input" />
          </div>
          <div>
            <label className="label">Personas *</label>
            <input
              name="pax"
              type="number"
              required
              min={1}
              max={50}
              defaultValue={2}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Origen</label>
            <select name="source" className="input" defaultValue="BACKOFFICE">
              <option value="BACKOFFICE">Manual</option>
              <option value="PHONE">Teléfono</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className="label">Mesa (opcional)</label>
            <select name="tableId" className="input" defaultValue="">
              <option value="">Sin asignar</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code} ({t.zone?.name ?? "Sin zona"}, {t.seats} lug.)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Notas (opcional)</label>
          <textarea
            name="notes"
            maxLength={500}
            rows={2}
            className="input"
            placeholder="Cumpleaños, alergias, etc."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <Link href="/admin/reservas" className="btn-ghost">
            Cancelar
          </Link>
          <button className="btn-primary">Crear reserva</button>
        </div>
      </form>
    </div>
  );
}
