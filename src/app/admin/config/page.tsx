import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { safeUpdateRestaurantInfo } from "@/modules/cms/safe-actions";
import { SafeForm } from "@/components/safe-form";

export const metadata = { title: "Configuración" };

export default async function ConfigPage() {
  await requirePermission("restaurant.edit");
  const { restaurant } = await requireCurrentRestaurant();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Configuración</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Datos del restaurante. El slug público (<code className="font-mono">{restaurant.slug}</code>) no se puede cambiar desde acá.
      </p>

      <SafeForm action={safeUpdateRestaurantInfo} className="card space-y-4" successMessage="Guardado">
        <div>
          <label className="label">Nombre *</label>
          <input
            name="name"
            required
            defaultValue={restaurant.name}
            maxLength={80}
            minLength={2}
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Teléfono</label>
            <input
              name="phone"
              defaultValue={restaurant.phone ?? ""}
              placeholder="+54 11 4444-5555"
              className="input"
            />
          </div>
          <div>
            <label className="label">WhatsApp (con código país)</label>
            <input
              name="whatsappPhone"
              defaultValue={restaurant.whatsappPhone ?? ""}
              placeholder="5491144445555"
              className="input"
            />
            <p className="text-xs text-zinc-500 mt-1">Sin + ni espacios. Ej: 5491144445555</p>
          </div>
        </div>

        <div>
          <label className="label">Dirección</label>
          <input
            name="address"
            defaultValue={restaurant.address ?? ""}
            placeholder="Av. Corrientes 1234, CABA"
            className="input"
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button className="btn-primary">Guardar</button>
        </div>
      </SafeForm>

      <div className="mt-8 card bg-zinc-50 border-zinc-200 text-sm">
        <div className="font-semibold mb-2">Datos de la cuenta</div>
        <dl className="grid grid-cols-[140px_1fr] gap-y-1 text-zinc-600">
          <dt>Slug público</dt>
          <dd className="font-mono">{restaurant.slug}</dd>
          <dt>Zona horaria</dt>
          <dd>{restaurant.timezone}</dd>
          <dt>Moneda</dt>
          <dd>{restaurant.currency}</dd>
          <dt>Estado</dt>
          <dd>{restaurant.status}</dd>
        </dl>
      </div>
    </div>
  );
}
