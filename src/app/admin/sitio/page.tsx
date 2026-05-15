import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import { safeUpdateSiteContent } from "@/modules/cms/safe-actions";
import { ImageUpload } from "@/components/image-upload";
import { CopyUrlBanner } from "@/components/copy-url-banner";
import { env } from "@/lib/env";

export const metadata = { title: "Sitio web" };

export default async function SitePage() {
  await requirePermission("site.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const site = await prisma.siteContent.findUnique({
    where: { restaurantId: restaurant.id },
  });

  const galleryCount = await prisma.mediaAsset.count({
    where: { restaurantId: restaurant.id, kind: "GALLERY" },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold">Sitio web</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/admin/sitio/galeria" className="text-brand-400 hover:underline">
            Galería ({galleryCount} fotos) →
          </Link>
          <Link href="/admin/sitio/horarios" className="text-brand-400 hover:underline">
            Horarios y feriados →
          </Link>
          <Link href="/admin/sitio/qr" className="text-brand-400 hover:underline">
            QR de la carta →
          </Link>
          <Link
            href={`/${restaurant.slug}`}
            target="_blank"
            className="text-brand-400 hover:underline"
          >
            Ver sitio público ↗
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mb-6">
        <CopyUrlBanner
          url={`${env.APP_BASE_URL}/${restaurant.slug}`}
          slug={restaurant.slug}
        />
        <p className="text-xs text-th-text-muted -mt-4 mb-0">
          Slug actual: <code className="font-mono text-brand-400">{restaurant.slug}</code>
          {" · "}
          <Link href="/admin/config" className="text-brand-400 hover:underline">
            Cambiar slug →
          </Link>
        </p>
      </div>

      <SafeForm action={safeUpdateSiteContent} className="card max-w-2xl space-y-5" successMessage="Cambios guardados">
        <Field
          name="heroTitle"
          label="Título principal (hero)"
          defaultValue={site?.heroTitle ?? restaurant.name}
          maxLength={80}
        />
        <Field
          name="heroSubtitle"
          label="Subtítulo (hero)"
          defaultValue={site?.heroSubtitle ?? ""}
          maxLength={160}
          hint={'Una frase corta. Ej: "Parrilla de barrio, de siempre."'}
        />

        <ImageUpload
          name="heroImage"
          defaultValue={site?.heroImage ?? ""}
          label="Imagen hero (fondo)"
          hint="Recomendado: 1920x1080 o mayor. Si Cloudinary no está configurado, pegá una URL."
        />

        <TextArea
          name="aboutText"
          label="Sobre el restaurante"
          defaultValue={site?.aboutText ?? ""}
          rows={5}
          maxLength={2000}
        />

        <Field
          name="openingInfo"
          label="Info de horarios (texto libre)"
          defaultValue={site?.openingInfo ?? ""}
          hint={'Ej: "Abrimos de martes a domingo, 12 a 15 y 20 a 24."'}
        />

        <Field
          name="addressMapUrl"
          label="Link de Google Maps (embed)"
          defaultValue={site?.addressMapUrl ?? ""}
          type="url"
          hint="Copiá el src del iframe de Google Maps → Compartir → Incorporar un mapa."
        />

        <Field
          name="instagramUrl"
          label="Instagram"
          defaultValue={site?.instagramUrl ?? ""}
          type="url"
          placeholder="https://instagram.com/..."
        />

        <div className="pt-4 border-t">
          <button className="btn-primary">Guardar cambios</button>
        </div>
      </SafeForm>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  placeholder,
  hint,
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        maxLength={maxLength}
        className="input"
      />
      {hint && <p className="text-xs text-th-text-muted mt-1">{hint}</p>}
    </div>
  );
}

function TextArea({
  name,
  label,
  defaultValue,
  rows = 4,
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        className="input resize-none"
      />
    </div>
  );
}
