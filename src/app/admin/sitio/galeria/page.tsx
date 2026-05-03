import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { safeAddMediaAsset, safeDeleteMediaAsset, safeReorderMediaAsset } from "@/modules/media/safe-actions";
import { SafeForm } from "@/components/safe-form";
import { GalleryUploader } from "./uploader";

export const metadata = { title: "Galería de fotos" };

export default async function GalleryPage() {
  await requirePermission("site.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const images = await prisma.mediaAsset.findMany({
    where: { restaurantId: restaurant.id, kind: "GALLERY" },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Galería de fotos</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Las fotos se muestran en la página pública del restaurante. Podés subir hasta 12.
      </p>

      {images.length < 12 && (
        <>
          <GalleryUploader />
          <details className="mt-3 card">
            <summary className="text-xs text-brand-600 cursor-pointer">Agregar por URL (sin Cloudinary)</summary>
            <SafeForm
              action={safeAddMediaAsset}
              className="mt-3 flex flex-col sm:flex-row gap-2 items-end"
              successMessage="Imagen agregada"
              resetOnSuccess
            >
              <input type="hidden" name="kind" value="GALLERY" />
              <input type="hidden" name="publicId" value="" />
              <div className="flex-1">
                <label className="label">URL</label>
                <input name="url" type="url" required placeholder="https://..." className="input" />
              </div>
              <div className="sm:w-40">
                <label className="label">Texto alt</label>
                <input name="alt" type="text" placeholder="Descripción" className="input" />
              </div>
              <button className="btn-primary whitespace-nowrap">Agregar</button>
            </SafeForm>
          </details>
        </>
      )}

      {images.length === 0 ? (
        <div className="card text-center text-sm text-zinc-500 py-8">
          Sin fotos cargadas todavía.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {images.map((img, i) => (
            <div key={img.id} className="card p-2 group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? "Galería"}
                className="w-full aspect-square object-cover rounded"
              />
              <div className="mt-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  {i > 0 && (
                    <SafeForm action={safeReorderMediaAsset}>
                      <input type="hidden" name="id" value={img.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button className="text-xs text-zinc-500 hover:text-brand-600 px-1" title="Mover antes">
                        ←
                      </button>
                    </SafeForm>
                  )}
                  {i < images.length - 1 && (
                    <SafeForm action={safeReorderMediaAsset}>
                      <input type="hidden" name="id" value={img.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button className="text-xs text-zinc-500 hover:text-brand-600 px-1" title="Mover después">
                        →
                      </button>
                    </SafeForm>
                  )}
                </div>
                <SafeForm action={safeDeleteMediaAsset}>
                  <input type="hidden" name="id" value={img.id} />
                  <button className="text-xs text-red-600 hover:underline">
                    Eliminar
                  </button>
                </SafeForm>
              </div>
              {img.alt && (
                <div className="text-xs text-zinc-500 mt-1 truncate">{img.alt}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
