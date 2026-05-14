import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import { safeRegisterStockEntry } from "@/modules/inventory/safe-actions";

export const metadata = { title: "Stock & Movimientos" };

const UNIT_LABELS: Record<string, string> = {
  KG: "kg",
  G: "g",
  LT: "lt",
  ML: "ml",
  UNIT: "u",
};

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  PURCHASE: { label: "Compra", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  SALE: { label: "Venta", cls: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  ADJUSTMENT: { label: "Ajuste", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  WASTE: { label: "Merma", cls: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: { dias?: string };
}) {
  await requirePermission("inventory.view");
  const { restaurant } = await requireCurrentRestaurant();

  const days = Number(searchParams.dias) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [materials, movements] = await Promise.all([
    prisma.rawMaterial.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true, currentStock: true, reorderPoint: true, criticalPoint: true },
    }),
    prisma.stockMovement.findMany({
      where: { restaurantId: restaurant.id, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { rawMaterial: { select: { name: true, unit: true } } },
    }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold">Stock & Movimientos</h1>
      </div>

      {/* Stock overview */}
      <div className="card p-0 overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Materia prima</th>
              <th className="px-4 py-3 text-right">Stock actual</th>
              <th className="px-4 py-3 text-right">Reposición</th>
              <th className="px-4 py-3 text-right">Crítico</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {materials.map((m) => {
              const isCritical = m.currentStock <= m.criticalPoint && m.criticalPoint > 0;
              const isLow = !isCritical && m.currentStock <= m.reorderPoint && m.reorderPoint > 0;
              const pct = m.reorderPoint > 0 ? Math.min(100, (m.currentStock / m.reorderPoint) * 100) : 100;
              return (
                <tr key={m.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={isCritical ? "text-red-400 font-bold" : isLow ? "text-amber-400 font-semibold" : ""}>
                      {m.currentStock} {UNIT_LABELS[m.unit]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500">{m.reorderPoint} {UNIT_LABELS[m.unit]}</td>
                  <td className="px-4 py-3 text-right text-zinc-500">{m.criticalPoint} {UNIT_LABELS[m.unit]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCritical ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {isCritical && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                          CRITICO
                        </span>
                      )}
                      {isLow && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                          REPONER
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Register stock entry */}
      {materials.length > 0 && (
        <div className="card mb-8">
          <h2 className="font-heading font-semibold mb-4">Registrar movimiento</h2>
          <SafeForm action={safeRegisterStockEntry} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="label">Materia prima *</label>
              <select name="rawMaterialId" required className="input">
                <option value="">Elegir...</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({UNIT_LABELS[m.unit]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Cantidad *</label>
              <input name="quantity" type="number" step="0.01" min="0.01" required className="input" />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select name="type" required className="input">
                <option value="PURCHASE">Compra (+)</option>
                <option value="ADJUSTMENT">Ajuste (+)</option>
                <option value="WASTE">Merma (-)</option>
              </select>
            </div>
            <div>
              <label className="label">Motivo</label>
              <input name="reason" maxLength={200} className="input" placeholder="Opcional" />
            </div>
            <button className="btn-primary">Registrar</button>
          </SafeForm>
        </div>
      )}

      {/* Recent movements */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-heading font-semibold">Últimos movimientos</h2>
          <div className="flex gap-2 text-xs">
            {[7, 15, 30].map((d) => (
              <Link
                key={d}
                href={`/admin/inventario/stock?dias=${d}`}
                className={`px-2 py-1 rounded ${
                  days === d ? "bg-zinc-100 text-zinc-900" : "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08]"
                }`}
              >
                {d}d
              </Link>
            ))}
          </div>
        </div>

        {movements.length === 0 ? (
          <div className="card text-center text-zinc-500">Sin movimientos en los últimos {days} días.</div>
        ) : (
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Materia prima</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {movements.map((mv) => {
                  const t = TYPE_LABELS[mv.type] ?? { label: mv.type, cls: "" };
                  return (
                    <tr key={mv.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {mv.createdAt.toLocaleDateString("es-AR")} {mv.createdAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-medium">{mv.rawMaterial.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${t.cls}`}>
                          {t.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={mv.type === "WASTE" || mv.type === "SALE" ? "text-red-400" : "text-emerald-400"}>
                          {mv.type === "WASTE" || mv.type === "SALE" ? "-" : "+"}{mv.quantity} {UNIT_LABELS[mv.rawMaterial.unit]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {mv.reason || (mv.orderId ? `Orden #${mv.orderId.slice(-6)}` : "—")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
