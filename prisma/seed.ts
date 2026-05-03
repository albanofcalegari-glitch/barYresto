/**
 * Seed inicial:
 *   - planes
 *   - permisos + roles globales (SUPER_ADMIN, OWNER, MANAGER, WAITER, CASHIER, KITCHEN)
 *   - usuario super admin (admin@baryresto.app)
 *   - restaurante demo "La Parrilla del Bary" con 1 owner, zonas, mesas,
 *     categorías, platos y horarios.
 *
 * Correr con:  pnpm db:seed
 */
import { PrismaClient, RoleCode } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ROLE_PERMISSIONS, ROLE_LABELS } from "../src/lib/permissions";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding…");

  // --- Planes ---
  await prisma.plan.upsert({
    where: { code: "BASIC" },
    create: {
      code: "BASIC",
      name: "Básico",
      priceArs: 9900,
      features: {
        reservations: true,
        publicSite: true,
        menuQr: true,
        service: false,
        payments: false,
      },
    },
    update: {},
  });

  await prisma.plan.upsert({
    where: { code: "PRO" },
    create: {
      code: "PRO",
      name: "Pro",
      priceArs: 19900,
      features: {
        reservations: true,
        publicSite: true,
        menuQr: true,
        service: true,
        payments: true,
        reports: true,
      },
    },
    update: {},
  });

  // --- Permisos ---
  for (const p of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { code: p.code },
      create: { code: p.code, label: p.label },
      update: { label: p.label },
    });
  }

  // --- Roles globales (restaurantId = null) ---
  // NB: compound unique con null no funciona con upsert → findFirst + create/update.
  for (const [code, permCodes] of Object.entries(ROLE_PERMISSIONS) as [
    RoleCode,
    string[],
  ][]) {
    let role = await prisma.role.findFirst({
      where: { code, restaurantId: null },
    });
    if (!role) {
      role = await prisma.role.create({
        data: { code, name: ROLE_LABELS[code], restaurantId: null },
      });
    }

    const perms = await prisma.permission.findMany({
      where: { code: { in: permCodes } },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
      skipDuplicates: true,
    });
  }

  // --- Super admin ---
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@baryresto.app" },
    create: {
      email: "admin@baryresto.app",
      name: "Super Admin",
      passwordHash: adminHash,
      isPlatformAdmin: true,
    },
    update: { passwordHash: adminHash, isPlatformAdmin: true },
  });

  // --- Restaurante demo ---
  const demo = await prisma.restaurant.upsert({
    where: { slug: "parrilla-bary" },
    create: {
      slug: "parrilla-bary",
      name: "La Parrilla del Bary",
      phone: "+54 11 4000-0000",
      whatsappPhone: "+54 9 11 4000-0000",
      address: "Av. Corrientes 1234, CABA",
      status: "ACTIVE",
      plan: { connect: { code: "PRO" } },
      siteContent: {
        create: {
          heroTitle: "La Parrilla del Bary",
          heroSubtitle: "Parrilla de barrio, de siempre.",
          heroImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80",
          aboutText:
            "Desde 1998 cocinando a las brasas en el corazón de Buenos Aires. Carnes seleccionadas, pastas caseras y una carta de vinos breve y buena. Tres generaciones manteniendo viva la tradición del asado argentino.",
          openingInfo: "Martes a domingo\nMediodía: 12:00 a 15:30\nNoche: 20:00 a 00:00\nLunes: cerrado",
          addressMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016887889527!2d-58.38375908477034!3d-34.60373888045949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacb4d1b4285%3A0x7d0a500c4186537!2sObelisco!5e0!3m2!1ses-419!2sar!4v1650000000000!5m2!1ses-419!2sar",
          instagramUrl: "https://instagram.com/parrilla-bary",
        },
      },
    },
    update: {},
  });

  // Clonar roles globales al tenant (si ya están, upsert)
  const globalRoles = await prisma.role.findMany({
    where: {
      restaurantId: null,
      code: { in: ["OWNER", "MANAGER", "WAITER", "CASHIER"] },
    },
    include: { permissions: true },
  });

  for (const template of globalRoles) {
    const tenantRole = await prisma.role.upsert({
      where: { code_restaurantId: { code: template.code, restaurantId: demo.id } },
      create: {
        code: template.code,
        name: template.name,
        restaurantId: demo.id,
      },
      update: {},
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: tenantRole.id } });
    await prisma.rolePermission.createMany({
      data: template.permissions.map((rp) => ({
        roleId: tenantRole.id,
        permissionId: rp.permissionId,
      })),
      skipDuplicates: true,
    });
  }

  // --- Owner demo ---
  const ownerRole = await prisma.role.findFirstOrThrow({
    where: { restaurantId: demo.id, code: "OWNER" },
  });
  const ownerHash = await bcrypt.hash("owner123", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@parrilla-bary.test" },
    create: {
      email: "owner@parrilla-bary.test",
      name: "Bary Gómez",
      passwordHash: ownerHash,
    },
    update: { passwordHash: ownerHash },
  });
  await prisma.userRestaurant.upsert({
    where: { userId_restaurantId: { userId: owner.id, restaurantId: demo.id } },
    create: { userId: owner.id, restaurantId: demo.id, roleId: ownerRole.id },
    update: { roleId: ownerRole.id },
  });

  // --- Zonas + mesas ---
  const salon = await prisma.zone.upsert({
    where: { id: `${demo.id}-salon` },
    create: { id: `${demo.id}-salon`, restaurantId: demo.id, name: "Salón", orderIndex: 0 },
    update: {},
  });
  const patio = await prisma.zone.upsert({
    where: { id: `${demo.id}-patio` },
    create: { id: `${demo.id}-patio`, restaurantId: demo.id, name: "Patio", orderIndex: 1 },
    update: {},
  });

  const tables = [
    { code: "M01", seats: 2, zoneId: salon.id },
    { code: "M02", seats: 2, zoneId: salon.id },
    { code: "M03", seats: 4, zoneId: salon.id },
    { code: "M04", seats: 4, zoneId: salon.id },
    { code: "M05", seats: 6, zoneId: salon.id },
    { code: "M06", seats: 2, zoneId: patio.id },
    { code: "M07", seats: 4, zoneId: patio.id },
    { code: "M08", seats: 4, zoneId: patio.id },
  ];
  for (const t of tables) {
    await prisma.table.upsert({
      where: { restaurantId_code: { restaurantId: demo.id, code: t.code } },
      create: { restaurantId: demo.id, ...t },
      update: {},
    });
  }

  // --- Menú ---
  const categories = [
    { name: "Entradas", orderIndex: 0 },
    { name: "Parrilla", orderIndex: 1 },
    { name: "Pastas", orderIndex: 2 },
    { name: "Postres", orderIndex: 3 },
    { name: "Bebidas", orderIndex: 4 },
    { name: "Vinos", orderIndex: 5 },
  ];
  const createdCats: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.menuCategory.upsert({
      where: { id: `${demo.id}-cat-${c.orderIndex}` },
      create: {
        id: `${demo.id}-cat-${c.orderIndex}`,
        restaurantId: demo.id,
        name: c.name,
        orderIndex: c.orderIndex,
      },
      update: { name: c.name },
    });
    createdCats[c.name] = cat.id;
  }

  const items = [
    { cat: "Entradas", name: "Provoleta clásica", price: 3500, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80" },
    { cat: "Entradas", name: "Empanadas de carne (6u)", price: 4200, image: "https://images.unsplash.com/photo-1604467707321-70d009801bf6?w=400&q=80" },
    { cat: "Entradas", name: "Ensalada César", price: 3800 },
    { cat: "Parrilla", name: "Bife de chorizo (400g)", price: 12500, featured: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80" },
    { cat: "Parrilla", name: "Ojo de bife (350g)", price: 11500 },
    { cat: "Parrilla", name: "Vacío a la parrilla", price: 9800 },
    { cat: "Parrilla", name: "Parrillada para 2", price: 22000, featured: true, image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80" },
    { cat: "Pastas", name: "Sorrentinos de jamón y queso", price: 7500 },
    { cat: "Pastas", name: "Ravioles de ricotta", price: 7200 },
    { cat: "Pastas", name: "Ñoquis caseros", price: 6800 },
    { cat: "Postres", name: "Flan casero con dulce de leche", price: 3200, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80" },
    { cat: "Postres", name: "Tiramisú", price: 3500, featured: true, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80" },
    { cat: "Bebidas", name: "Agua mineral 500ml", price: 1200 },
    { cat: "Bebidas", name: "Gaseosa línea Coca", price: 1800 },
    { cat: "Bebidas", name: "Limonada casera", price: 2500 },
    { cat: "Vinos", name: "Malbec de la casa (botella)", price: 9000 },
    { cat: "Vinos", name: "Malbec de la casa (copa)", price: 2500 },
    { cat: "Vinos", name: "Cabernet Sauvignon (botella)", price: 9500 },
  ];

  for (const [idx, it] of items.entries()) {
    await prisma.menuItem.upsert({
      where: { id: `${demo.id}-item-${idx}` },
      create: {
        id: `${demo.id}-item-${idx}`,
        restaurantId: demo.id,
        categoryId: createdCats[it.cat],
        name: it.name,
        priceCents: it.price * 100,
        featured: Boolean(it.featured),
        available: true,
        orderIndex: idx,
        imageUrl: (it as any).image ?? null,
      },
      update: {
        name: it.name,
        priceCents: it.price * 100,
        featured: Boolean(it.featured),
        imageUrl: (it as any).image ?? null,
      },
    });
  }

  // --- Galería ---
  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", alt: "Salón principal" },
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", alt: "Plato gourmet" },
    { url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", alt: "Parrilla" },
    { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", alt: "Patio" },
    { url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80", alt: "Detalle mesa" },
    { url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80", alt: "Barra de vinos" },
  ];
  for (const [idx, img] of galleryImages.entries()) {
    await prisma.mediaAsset.upsert({
      where: { id: `${demo.id}-gallery-${idx}` },
      create: {
        id: `${demo.id}-gallery-${idx}`,
        restaurantId: demo.id,
        url: img.url,
        publicId: "",
        kind: "GALLERY",
        alt: img.alt,
        orderIndex: idx,
      },
      update: { url: img.url, alt: img.alt },
    });
  }

  // --- Horarios (martes a domingo, 12-15 y 20-00) ---
  const daysOpen = [2, 3, 4, 5, 6, 0];
  for (const d of daysOpen) {
    await prisma.businessHours.deleteMany({
      where: { restaurantId: demo.id, weekday: d },
    });
    await prisma.businessHours.createMany({
      data: [
        { restaurantId: demo.id, weekday: d, openTime: "12:00", closeTime: "15:30" },
        { restaurantId: demo.id, weekday: d, openTime: "20:00", closeTime: "23:59" },
      ],
    });
  }

  // --- Feriados AR 2026 (muestra) ---
  const holidays2026 = [
    "2026-01-01",
    "2026-02-16",
    "2026-02-17",
    "2026-03-24",
    "2026-04-02",
    "2026-04-03",
    "2026-05-01",
    "2026-05-25",
    "2026-06-15",
    "2026-06-20",
    "2026-07-09",
    "2026-08-17",
    "2026-10-12",
    "2026-11-23",
    "2026-12-08",
    "2026-12-25",
  ];
  for (const iso of holidays2026) {
    await prisma.specialDay.upsert({
      where: { restaurantId_date: { restaurantId: demo.id, date: new Date(iso) } },
      create: {
        restaurantId: demo.id,
        date: new Date(iso),
        closed: true,
        note: "Feriado nacional",
      },
      update: {},
    });
  }

  console.log("✅ Seed listo");
  console.log("   super admin : admin@baryresto.app / admin123");
  console.log("   owner demo  : owner@parrilla-bary.test / owner123");
  console.log("   restaurante : /parrilla-bary");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
