import { prisma } from "@/db/client";

export const metadata = { title: "Plataforma" };

export default async function PlatformHome() {
  const [restaurants, users, reservations, orders] = await Promise.all([
    prisma.restaurant.count(),
    prisma.user.count(),
    prisma.reservation.count(),
    prisma.order.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Métricas</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Restaurantes" value={restaurants} />
        <Metric label="Usuarios" value={users} />
        <Metric label="Reservas totales" value={reservations} />
        <Metric label="Órdenes totales" value={orders} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-th-border bg-surface-card p-4">
      <div className="text-xs uppercase tracking-wide text-th-text-muted">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}
