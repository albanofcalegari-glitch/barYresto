# barYResto — SaaS multi-tenant para bares y restaurantes

## Stack
- Next.js 14 (App Router) + TypeScript
- Prisma 5 + PostgreSQL
- Auth.js v5 (NextAuth, Credentials + JWT)
- Tailwind CSS + tema Qngine (dark purple)
- Cloudinary (imagenes)
- Docker + nginx

## Comandos
- `pnpm dev` — Dev server (puerto 3004)
- `npx prisma db push` — Sincronizar schema
- `npx prisma db seed` — Seed de datos demo
- `npx prisma studio` — UI de la DB
- `pnpm build` — Build de produccion
- `docker compose up -d` — Deploy con Docker

## URLs
- **Publico**: `https://baryresto.qngine.com.ar/{slug}`
- **Admin**: `https://baryresto-admin.qngine.com.ar`
- **Dev publico**: `http://localhost:3002/{slug}`
- **Dev admin**: `http://localhost:3002/admin`

## Credenciales dev (seed)
- **Super Admin**: admin@baryresto.app / admin123 → /platform
- **Owner demo**: owner@parrilla-bary.test / owner123 → /admin
- **Restaurante demo**: La Parrilla del Bary (slug: parrilla-bary)
- **DB**: postgresql://postgres:postgres@localhost:5432/baryresto

## Arquitectura
- Multi-tenant: todas las tablas scoped por `restaurantId`
- Middleware rutea por host: `baryresto.qngine.com.ar` (publico) vs `baryresto-admin.qngine.com.ar` (dashboard)
- RBAC: 5 roles (OWNER, MANAGER, WAITER, CASHIER, KITCHEN) con permisos granulares
- Platform admin (`/platform`): gestion global de restaurantes, usuarios, estados
- Restaurant admin (`/admin`): gestion del restaurante propio

## Modulos
- Reservas (CRUD, publica por slug, estados, mesas)
- Ordenes (items, cobro multi-metodo, descuento stock automatico)
- Salon (zonas + mesas)
- Menu (categorias, platos, variantes, disponibilidad)
- Clientes (email como clave unica, historial visitas)
- Inventario (materias primas, proveedores, recetas BOM, stock, alertas)
- Usuarios (RBAC, invite, roles por modulo)
- Sitio web (landing, carta QR, reserva online, galeria, horarios)
- Configuracion (datos, slug editable, timezone)
- Reportes (ventas, reservas, top productos)

## Convenciones
- UI en espanol (es-AR)
- Tema oscuro Qngine: bg #07070f, accent #7c5cfc, fonts Syne + DM Sans
- Server actions con `createSafeAction` + `SafeForm`
- Slug publico configurable desde admin y platform
