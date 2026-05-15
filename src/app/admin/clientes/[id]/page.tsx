import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { updateCustomer } from "@/modules/customers/actions";

export const metadata = { title: "Editar cliente" };

export default async function EditClientePage({
  params,
}: {
  params: { id: string };
}) {
  await requirePermission("customer.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, restaurantId: restaurant.id },
  });
  if (!customer) notFound();

  async function save(formData: FormData) {
    "use server";
    await updateCustomer(formData);
    redirect("/admin/clientes");
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Editar cliente</h1>
        <Link href="/admin/clientes" className="text-sm text-th-text-muted hover:underline">
          ← volver
        </Link>
      </div>

      <form action={save} className="card space-y-4">
        <input type="hidden" name="id" value={customer.id} />
        <div>
          <label className="label">Nombre *</label>
          <input name="name" required defaultValue={customer.name} className="input" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input name="email" type="email" required defaultValue={customer.email} className="input" />
        </div>
        <div>
          <label className="label">Telefono</label>
          <input name="phone" type="tel" defaultValue={customer.phone ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} className="input" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/admin/clientes" className="btn-ghost">Cancelar</Link>
          <button className="btn-primary">Guardar</button>
        </div>
      </form>

      <div className="mt-6 card bg-surface-elevated text-sm">
        <dl className="grid grid-cols-[120px_1fr] gap-y-1 text-th-text-muted">
          <dt>Visitas</dt>
          <dd>{customer.visitsCount}</dd>
          <dt>Última visita</dt>
          <dd>{customer.lastVisitAt?.toLocaleDateString("es-AR") ?? "—"}</dd>
          <dt>Creado</dt>
          <dd>{customer.createdAt.toLocaleDateString("es-AR")}</dd>
        </dl>
      </div>
    </div>
  );
}
