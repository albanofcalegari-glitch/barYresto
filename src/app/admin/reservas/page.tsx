import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import {
  safeConfirmReservation,
  safeCancelReservation,
  safeMarkArrived,
  safeMarkNoShow,
  safeCompleteReservation,
} from "@/modules/reservations/safe-actions";
import type { ReservationStatus } from "@prisma/client";

export const metadata = { title: "Reservas" };

const STATUS_STYLES: Record<
  ReservationStatus,
  { label: string; cls: string }
> = {
  PENDING: {
    label: "Pendiente",
    cls: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  CONFIRMED: {
    label: "Confirmada",
    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  ARRIVED: {
    label: "Llegó",
    cls: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  CANCELED: {
    label: "Cancelada",
    cls: "bg-surface-elevated text-th-text-muted border-th-border",
  },
  NO_SHOW: {
    label: "No vino",
    cls: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  COMPLETED: {
    label: "Completada",
    cls: "bg-surface-elevated text-th-text-muted border-th-border",
  },
};

const SOURCE_LABELS: Record<string, string> = {
  WEB: "Web",
  WHATSAPP: "WhatsApp",
  BACKOFFICE: "Manual",
  PHONE: "Teléfono",
};

function StatusBadge({ status }: { status: ReservationStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: { fecha?: string; estado?: string };
}) {
  await requirePermission("reservation.create");
  const { restaurant } = await requireCurrentRestaurant();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = searchParams.fecha ?? today.toISOString().split("T")[0];
  const dayStart = new Date(`${selectedDate}T00:00:00`);
  const dayEnd = new Date(`${selectedDate}T23:59:59`);

  const statusFilter = searchParams.estado as ReservationStatus | undefined;

  const reservations = await prisma.reservation.findMany({
    where: {
      restaurantId: restaurant.id,
      startsAt: { gte: dayStart, lte: dayEnd },
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { startsAt: "asc" },
    include: {
      table: { select: { code: true } },
      customer: { select: { visitsCount: true } },
    },
  });

  const counts = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === "PENDING").length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    pax: reservations
      .filter((r) => ["PENDING", "CONFIRMED", "ARRIVED"].includes(r.status))
      .reduce((s, r) => s + r.pax, 0),
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold">Reservas</h1>
        <Link href="/admin/reservas/nueva" className="btn-primary">
          + Nueva reserva
        </Link>
      </div>

      {/* Filters */}
      <form className="card mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="label">Fecha</label>
          <input
            name="fecha"
            type="date"
            defaultValue={selectedDate}
            className="input"
          />
        </div>
        <div>
          <label className="label">Estado</label>
          <select name="estado" defaultValue={statusFilter ?? ""} className="input">
            <option value="">Todos</option>
            {Object.entries(STATUS_STYLES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-secondary">Filtrar</button>
      </form>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold">{counts.total}</div>
          <div className="text-xs text-th-text-muted">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-amber-400">{counts.pending}</div>
          <div className="text-xs text-th-text-muted">Pendientes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-emerald-400">{counts.confirmed}</div>
          <div className="text-xs text-th-text-muted">Confirmadas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold">{counts.pax}</div>
          <div className="text-xs text-th-text-muted">Personas</div>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="card text-center text-th-text-muted">
          Sin reservas para esta fecha.
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-start gap-4">
              {/* Time */}
              <div className="w-16 text-center">
                <div className="text-lg font-bold">
                  {r.startsAt.toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
                <div className="text-xs text-th-text-muted">{r.pax} pax</div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{r.contactName}</span>
                  <StatusBadge status={r.status} />
                  <span className="text-xs text-th-text-muted">
                    {SOURCE_LABELS[r.source] ?? r.source}
                  </span>
                  {r.customer && r.customer.visitsCount > 0 && (
                    <span className="text-xs text-brand-300">
                      {r.customer.visitsCount} visita(s)
                    </span>
                  )}
                </div>
                <div className="text-sm text-th-text-muted mt-0.5">
                  {r.contactPhone}
                  {r.contactEmail && ` · ${r.contactEmail}`}
                </div>
                {r.table && (
                  <div className="text-xs text-th-text-muted mt-0.5">
                    Mesa {r.table.code}
                  </div>
                )}
                {r.notes && (
                  <div className="text-xs text-th-text-muted mt-1 italic">
                    {r.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 items-center">
                {r.status === "PENDING" && (
                  <>
                    <SafeForm action={safeConfirmReservation}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                        Confirmar
                      </button>
                    </SafeForm>
                    <SafeForm action={safeCancelReservation}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs text-red-400 hover:underline">
                        Cancelar
                      </button>
                    </SafeForm>
                  </>
                )}
                {r.status === "CONFIRMED" && (
                  <>
                    <SafeForm action={safeMarkArrived}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                        Llegó
                      </button>
                    </SafeForm>
                    <SafeForm action={safeMarkNoShow}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs text-th-text-muted hover:underline">
                        No vino
                      </button>
                    </SafeForm>
                    <SafeForm action={safeCancelReservation}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs text-red-400 hover:underline">
                        Cancelar
                      </button>
                    </SafeForm>
                  </>
                )}
                {r.status === "ARRIVED" && (
                  <SafeForm action={safeCompleteReservation}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-xs px-3 py-1.5 rounded-md bg-zinc-700 text-white hover:bg-zinc-800">
                      Completar
                    </button>
                  </SafeForm>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
