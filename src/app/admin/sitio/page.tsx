import Link from "next/link";
import { prisma } from "@/db/client";
import { requirePermission } from "@/lib/rbac";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { SafeForm } from "@/components/safe-form";
import { safeUpdateSiteContent } from "@/modules/cms/safe-actions";
import { ImageUpload } from "@/components/image-upload";
import { CopyUrlBanner } from "@/components/copy-url-banner";
import { BusinessHoursEditor } from "./horarios/editor";
import { upsertBusinessHours } from "@/modules/hours/actions";
import { env } from "@/lib/env";

export const metadata = { title: "Sitio web" };

export default async function SitePage() {
  await requirePermission("site.edit");
  const { restaurant } = await requireCurrentRestaurant();

  const [site, galleryCount, hours] = await Promise.all([
    prisma.siteContent.findUnique({
      where: { restaurantId: restaurant.id },
    }),
    prisma.mediaAsset.count({
      where: { restaurantId: restaurant.id, kind: "GALLERY" },
    }),
    prisma.businessHours.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: [{ weekday: "asc" }, { openTime: "asc" }],
    }),
  ]);

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
          name="addressMapUrl"
          label="Link de Google Maps (opcional)"
          defaultValue={site?.addressMapUrl ?? ""}
          type="url"
          hint="Copiá el src del iframe de Google Maps → Compartir → Incorporar un mapa."
        />

        <Field
          name="instagramUrl"
          label="Instagram (opcional)"
          defaultValue={site?.instagramUrl ?? ""}
          type="url"
          placeholder="https://instagram.com/..."
        />

        <div className="pt-4 border-t">
          <button className="btn-primary">Guardar cambios</button>
        </div>
      </SafeForm>

      {/* ── Horarios ── */}
      <div className="max-w-2xl mt-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">Horarios de atención</h2>
          <Link href="/admin/sitio/horarios" className="text-sm text-brand-400 hover:underline">
            Feriados y días especiales →
          </Link>
        </div>
        <BusinessHoursEditor
          action={upsertBusinessHours}
          initial={hours.map((h) => ({
            weekday: h.weekday,
            openTime: h.openTime,
            closeTime: h.closeTime,
          }))}
          weekdayLabels={WEEKDAYS}
        />
      </div>
    </div>
  );
}

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

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
