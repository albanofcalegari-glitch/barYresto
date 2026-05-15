import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/db/client";
import { requirePlatformAdmin } from "@/lib/rbac";
import { RoleCode } from "@prisma/client";

export const metadata = { title: "Nuevo restaurante" };

const schema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "sólo minúsculas, números y guiones"),
  phone: z.string().optional().nullable(),
  whatsappPhone: z.string().optional().nullable(),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6),
});

async function createRestaurantAction(formData: FormData) {
  "use server";
  await requirePlatformAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse({
    ...raw,
    phone: raw.phone || null,
    whatsappPhone: raw.whatsappPhone || null,
  });
  if (!parsed.success) {
    throw new Error(
      "Datos inválidos: " +
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
    );
  }
  const data = parsed.data;

  const exists = await prisma.restaurant.findUnique({ where: { slug: data.slug } });
  if (exists) throw new Error(`El slug "${data.slug}" ya existe.`);

  const emailTaken = await prisma.user.findUnique({ where: { email: data.ownerEmail } });
  if (emailTaken) throw new Error(`El email "${data.ownerEmail}" ya está en uso.`);

  const passwordHash = await bcrypt.hash(data.ownerPassword, 10);

  const restaurant = await prisma.$transaction(async (tx) => {
    const r = await tx.restaurant.create({
      data: {
        slug: data.slug,
        name: data.name,
        phone: data.phone,
        whatsappPhone: data.whatsappPhone,
        status: "TRIAL",
        siteContent: {
          create: { heroTitle: data.name, heroSubtitle: "Bienvenidos" },
        },
      },
    });

    // Buscar o crear los roles tenant-scoped para este restaurant
    const roles = await tx.role.findMany({
      where: { restaurantId: null, code: { in: ["OWNER", "MANAGER", "WAITER", "CASHIER", "KITCHEN"] } },
      include: { permissions: true },
    });

    // Clonar roles globales al tenant
    for (const template of roles) {
      await tx.role.create({
        data: {
          code: template.code,
          name: template.name,
          restaurantId: r.id,
          permissions: {
            create: template.permissions.map((rp) => ({
              permissionId: rp.permissionId,
            })),
          },
        },
      });
    }

    const ownerRole = await tx.role.findFirstOrThrow({
      where: { restaurantId: r.id, code: RoleCode.OWNER },
    });

    const owner = await tx.user.create({
      data: {
        email: data.ownerEmail,
        name: data.ownerName,
        passwordHash,
        restaurants: {
          create: { restaurantId: r.id, roleId: ownerRole.id },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        action: "restaurant.create",
        entity: "Restaurant",
        entityId: r.id,
        restaurantId: r.id,
        userId: owner.id,
      },
    });

    return r;
  });

  redirect(`/platform/restaurants?created=${restaurant.slug}`);
}

export default async function NewRestaurantPage() {
  await requirePlatformAdmin();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-heading font-bold mb-6">Nuevo restaurante</h1>
      <form action={createRestaurantAction} className="space-y-5 rounded-lg border border-th-border bg-surface-card p-6">
        <Field name="name" label="Nombre del restaurante" required placeholder="La Parrilla del Bary" />
        <Field
          name="slug"
          label="Slug (URL)"
          required
          placeholder="parrilla-bary"
          hint="se usará en baryresto.app/{slug}"
        />
        <div className="grid grid-cols-2 gap-4">
          <Field name="phone" label="Teléfono" placeholder="+54 11 1234-5678" />
          <Field name="whatsappPhone" label="WhatsApp" placeholder="+54 9 11 1234-5678" />
        </div>

        <div className="pt-4 border-t border-th-border">
          <div className="text-sm font-semibold text-th-text-primary mb-3">Dueño inicial</div>
          <Field name="ownerName" label="Nombre" required placeholder="Juan Pérez" />
          <Field name="ownerEmail" label="Email" type="email" required placeholder="owner@parrilla.com" />
          <Field name="ownerPassword" label="Contraseña temporal" type="password" required minLength={6} />
        </div>

        <button className="btn-primary bg-brand-500 hover:bg-brand-600 w-full">
          Crear restaurante
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
  hint,
  minLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label className="label text-th-text-primary" htmlFor={name}>
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="input bg-surface border-th-border text-th-text-primary"
      />
      {hint && <p className="text-xs text-th-text-muted mt-1">{hint}</p>}
    </div>
  );
}
