# baryresto

SaaS multi-tenant para restaurantes: sitio público, carta online/QR, reservas (web + WhatsApp), operación de salón, mozos y cobros.

Spec completo: ver [MVP_SPEC.md](./MVP_SPEC.md).

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- Auth.js v5 (credenciales + magic link)
- Cloudinary (imágenes), Resend (email), Mercado Pago (pagos)
- Deploy: Vercel + Neon

## Setup local

```bash
pnpm install
cp .env.example .env                    # completar DATABASE_URL y AUTH_SECRET
pnpm db:migrate                         # crea schema
pnpm db:seed                            # crea roles, permisos, restaurante demo
pnpm dev                                # http://localhost:3000
```

## Usuarios demo (después del seed)

- **Super admin**: `admin@baryresto.app` / `admin123`
- **Owner** (La Parrilla del Bary): `owner@parrilla-bary.test` / `owner123`

## Scripts

| script | qué hace |
|---|---|
| `pnpm dev` | dev server |
| `pnpm build` | build productivo |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm db:migrate` | migración dev |
| `pnpm db:seed` | siembra |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:reset` | reset + reseed |

## Estructura

Ver §23 del spec.
