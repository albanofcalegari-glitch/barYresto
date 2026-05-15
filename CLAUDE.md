# barYResto — SaaS multi-tenant para bares y restaurantes

## Stack
- Next.js 14 (App Router) + TypeScript
- Prisma 5 + PostgreSQL
- Auth.js v5 (NextAuth, Credentials + JWT)
- Tailwind CSS + tema Qngine (dark purple)
- Cloudinary (imagenes)
- Docker + nginx + Cloudflare DNS

## Comandos
- `pnpm dev` — Dev server (puerto 3000)
- `npx prisma db push` — Sincronizar schema
- `npx prisma db seed` — Seed de datos demo
- `npx prisma studio` — UI de la DB
- `pnpm build` — Build de produccion
- `docker compose up -d --build` — Deploy con Docker

## Arquitectura de hosts (3 subdominios)

| Host | Dominio | Rutas |
|------|---------|-------|
| **Publico** | `baryresto.qngine.com.ar` | `/{slug}` (carta, reservas, sitio del restaurante) |
| **Admin** | `baryresto-admin.qngine.com.ar` | `/admin`, `/login`, `/registro` |
| **Platform** | `platform-baryresto.qngine.com.ar` | `/platform`, `/login` (super-admin) |

- Middleware (`src/middleware.ts`) rutea por host header
- En localhost dev se accede a todo: `/admin`, `/platform`, `/{slug}`
- `/registro` es publico en admin y dev (no requiere auth)

### Env vars clave
- `ADMIN_HOST` / `ADMIN_URL` — hostname y URL base del admin
- `PLATFORM_HOST` / `PLATFORM_URL` — hostname y URL base de platform
- `APP_BASE_URL` — URL del sitio publico
- `AUTH_SECRET` — secreto JWT para next-auth
- `AUTH_URL` — URL del admin (usada internamente por next-auth)
- NO usar `NEXT_PUBLIC_*` para URLs — usar `force-dynamic` + `process.env` en runtime

### Auth gotchas
- `getToken()` en middleware: NO pasar `salt` — en HTTPS las cookies tienen prefijo `__Secure-` y el salt por defecto cambia
- Landing page usa `export const dynamic = "force-dynamic"` para leer env vars en runtime (no build time)

## URLs produccion
- **Publico**: `https://baryresto.qngine.com.ar/{slug}`
- **Admin**: `https://baryresto-admin.qngine.com.ar`
- **Platform**: `https://platform-baryresto.qngine.com.ar`
- **VPS**: 31.97.167.30, Docker puerto 3004:3000, nginx reverse proxy

## Credenciales dev (seed)
- **Super Admin**: admin@baryresto.app / admin123 → /platform
- **Owner demo**: owner@parrilla-bary.test / owner123 → /admin
- **Restaurante demo**: La Parrilla del Bary (slug: parrilla-bary)
- **DB local**: postgresql://postgres:postgres@localhost:5432/baryresto
- **DB prod**: postgresql://baryresto:baryresto_secret@db:5432/baryresto (container)

## Arquitectura
- Multi-tenant: todas las tablas scoped por `restaurantId`
- RBAC: 5 roles (OWNER, MANAGER, WAITER, CASHIER, KITCHEN) con permisos granulares
- Platform admin (`/platform`): gestion global de restaurantes, usuarios, estados
- Restaurant admin (`/admin`): gestion del restaurante propio
- Self-registration (`/registro`): crea restaurante + owner + roles en transaccion

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
- Registro self-service (restaurante + owner en una transaccion)

## Convenciones
- UI en espanol (es-AR)
- Tema oscuro Qngine: bg #07070f, accent #7c5cfc, fonts Syne + DM Sans
- Server actions con `createSafeAction` + `SafeForm`
- Slug publico configurable desde admin y platform
- Brand component: `src/components/brand.tsx` (BrandIcon + BrandLogo)

## Deploy
- Docker build con standalone output + sharp para imagenes
- Dockerfile: base node:20-alpine, 3 stages (deps → builder → runner)
- nginx config: `/etc/nginx/sites-available/baryresto` con 3 server blocks
- Cloudflare DNS: 3 A records proxied → 31.97.167.30
