import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { generateQrDataUrl } from "@/lib/qr";
import { env } from "@/lib/env";

export const metadata = { title: "QR de la carta" };

export default async function QrPage() {
  await requirePermission("site.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const menuUrl = `${env.APP_BASE_URL}/${restaurant.slug}/menu?ref=qr`;
  const qr = await generateQrDataUrl(menuUrl, 640);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-heading font-bold mb-1">QR de la carta</h1>
      <p className="text-sm text-th-text-muted mb-6">
        Descargá e imprimí este QR. Al escanearlo, tus clientes abren la carta en el navegador.
      </p>

      <div className="card flex flex-col items-center gap-4 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qr}
          alt={`QR de ${restaurant.name}`}
          className="w-72 h-72 rounded-md border border-th-border"
        />
        <div className="text-center">
          <div className="font-semibold">{restaurant.name}</div>
          <div className="text-xs text-th-text-muted break-all max-w-sm mt-1">
            {menuUrl}
          </div>
        </div>
        <div className="flex gap-3">
          <a
            href={qr}
            download={`qr-${restaurant.slug}.png`}
            className="btn-primary"
          >
            Descargar PNG
          </a>
          <a
            href={menuUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            Ver carta
          </a>
        </div>
      </div>

      <div className="mt-6 card bg-amber-500/10 border-amber-500/20">
        <div className="text-sm text-amber-400">
          <strong>Próximamente:</strong> QR por mesa con deep-link al autopedido (v1).
        </div>
      </div>
    </div>
  );
}
