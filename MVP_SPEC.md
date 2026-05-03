# baryresto — Especificación de MVP

> SaaS multi-tenant para restaurantes. Unifica sitio público, carta online/QR, reservas (web + WhatsApp), operación de salón, mozos y cobros.
> Autor: arquitectura inicial. Fecha: 2026-04-16. Target: Argentina / LATAM.

---

## 1. Resumen ejecutivo

baryresto es una plataforma SaaS multi-tenant que permite a un restaurante reemplazar al menos 3 herramientas (web + sistema de reservas + comanda en mesa) con un único producto deployable en semanas. El MVP cubre el ciclo completo: el cliente descubre el local por la web, ve la carta por QR, reserva desde la web o WhatsApp, un mozo lo atiende desde el celular, y el pago se registra (manual o Mercado Pago). Un super-admin opera la plataforma y da de alta nuevos restaurantes.

**Diferencial vs competencia (CoverManager, Fudo, Mozo, MenuMaster)**: integración nativa de los 3 verticales (web + reservas + operación) + precio agresivo para LATAM + onboarding en minutos.

**Modelo de negocio**: suscripción mensual por local. Plan BASIC (web + carta QR + reservas) y plan PRO (+ operación mozo + cobros + reportes).

---

## 2. Alcance recomendado del MVP

Un restaurante puede, al terminar el MVP:

1. Registrarse (vía super-admin) y configurar identidad, galería, horarios y feriados.
2. Publicar un sitio propio en `baryresto.app/{slug}` con home, galería, carta, reservas, contacto y botón WhatsApp.
3. Gestionar su carta (categorías + platos + precios + imágenes + disponibilidad + destacados + orden).
4. Exponer su carta vía un QR general del local.
5. Recibir reservas por la web con validación de cupo, email de confirmación y gestión por token.
6. Recibir pedidos de reserva por WhatsApp vía `wa.me` con mensaje prellenado (registradas en backoffice con un clic).
7. Configurar zonas y mesas con cantidad de sillas.
8. Operar el salón desde mobile: abrir mesa, cargar pedido, enviar comanda, pedir cuenta, cerrar.
9. Registrar cobros (efectivo, tarjeta manual, transferencia, Mercado Pago Checkout Pro con webhook).
10. Administrar usuarios, roles y permisos + ver audit log básico + reporte básico de ventas y top ítems.

---

## 3. Funcionalidades descartadas del MVP

| Feature | Decisión | Motivo | Impacto complejidad |
|---|---|---|---|
| KDS / pantalla cocina | V1 | Muchos locales usan ticket impreso o canto verbal; hardware adicional | Alta |
| Impresión ESC/POS de comandas | V1 | Drivers + bridge + USB/BT + permisos; complica MVP | Alta |
| División de cuenta | V1 | UI + motor de reparto; se resuelve a mano por ahora | Media |
| Propinas configurables | MVP | Campo libre en cobro, bajo costo | Baja |
| Descuentos / promociones | V1 | Requiere motor de reglas. Se simula con ítem “descuento manual” | Media |
| Cupones | V1 | Depende del motor de promos | Media |
| Delivery / takeaway | Roadmap | Otro vertical: zonas, repartidores, logística | Alta |
| Mercado Pago Checkout Pro | MVP | Clave para LATAM, integración sencilla | Media |
| Stripe | Roadmap | Para expansión internacional posterior | Media |
| Facturación fiscal (AFIP / ARCA) | Roadmap | Proyecto regulatorio aparte | Alta |
| Reportes de ventas | MVP (básico) | Totales día/semana/mes, top platos | Baja |
| Reportes de ocupación | V1 | Tasa de ocupación, no-show ratio, etc. | Baja |
| Historial de clientes | MVP (básico) | Nombre + tel + visitas + última reserva | Baja |
| Fidelización (stamps / puntos) | Roadmap | Sumar cuando haya tracción | Media |
| Multi-sucursal | V1 | Modelo de datos ya lo soporta; UI posterior | Baja |
| Stock / inventario | Roadmap | Módulo propio y pesado | Alta |
| Horarios especiales / feriados | MVP | Crítico para reservas correctas | Baja |
| Lista de espera | V1 | Cuando haya volumen real | Media |
| Confirmación automática de reservas | MVP | Email + link de gestión | Baja |
| Recordatorios WhatsApp automáticos | V1 | Requiere Cloud API + templates aprobados | Media |
| QR por mesa | V1 | QR general del local alcanza para MVP | Baja |
| Encuestas de satisfacción | Roadmap | Nice-to-have | Baja |
| Panel analítico avanzado | V1 | Reportes simples alcanzan | Media |
| Multi idioma | Roadmap | Español AR/LATAM alcanza | Baja |
| Multi-tenant | MVP | Diseñado desde el día 1 | Baja (si se diseña bien) |
| Auditoría / logs | MVP (básico) | Acciones críticas | Baja |

---

## 4. Módulos del sistema

1. **Public Site** — sitio web público por tenant.
2. **Menu** — categorías, ítems, precios, imágenes, disponibilidad.
3. **Reservations** — web + WhatsApp + backoffice + calendario.
4. **Floor** — zonas, mesas, sillas, estado en vivo.
5. **Service** — operación de mozos, órdenes, comandas.
6. **Billing** — cobros, métodos de pago, Mercado Pago, historial.
7. **CRM (lite)** — clientes.
8. **CMS** — contenido del sitio público, galería.
9. **Admin** — usuarios, roles, permisos, config del restaurante.
10. **Reports** — dashboard básico.
11. **Platform** — super-admin, onboarding de restaurantes, planes.

---

## 5. Actores, roles y permisos

### Actores

| Actor | Descripción | Canal |
|---|---|---|
| `SUPER_ADMIN` | Operador de la plataforma | Backoffice plataforma |
| `OWNER` | Dueño del restaurante | Backoffice restaurante |
| `MANAGER` | Encargado / gerente | Backoffice restaurante |
| `WAITER` | Mozo | PWA mobile |
| `CASHIER` | Caja | PWA / backoffice |
| `KITCHEN` | Cocina (lee comandas) — **V1** | KDS (V1) |
| `CUSTOMER` | Cliente final | Sitio público + WhatsApp |

### Matriz de permisos (MVP)

Convención: ✅ permitido · 🟡 con restricción · ❌ no permitido.

| Recurso / acción | SUPER_ADMIN | OWNER | MANAGER | WAITER | CASHIER | CUSTOMER |
|---|---|---|---|---|---|---|
| Crear restaurant (tenant) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Config restaurante | ❌ | ✅ | 🟡 (no billing/plan) | ❌ | ❌ | ❌ |
| ABM usuarios del tenant | ❌ | ✅ | 🟡 (solo WAITER/CASHIER) | ❌ | ❌ | ❌ |
| ABM categorías / platos | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Toggle disponibilidad plato | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| ABM mesas / zonas | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver estado de salón | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Abrir mesa | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cargar pedido | ❌ | ✅ | ✅ | ✅ | 🟡 (cobrar) | ❌ |
| Enviar comanda (fire) | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cerrar mesa | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Registrar cobro | ❌ | ✅ | ✅ | 🟡 (solo su mesa) | ✅ | ❌ |
| Ver historial cobros | ❌ | ✅ | ✅ | 🟡 (día propio) | ✅ | ❌ |
| ABM reservas | ❌ | ✅ | ✅ | 🟡 (check-in) | ❌ | ❌ |
| Crear reserva propia | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gestionar su reserva (token) | ❌ | ❌ | ❌ | ❌ | ❌ | 🟡 |
| CMS sitio público | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ |
| Subir imágenes / galería | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver reportes | ❌ | ✅ | ✅ | ❌ | 🟡 (caja día) | ❌ |
| Ver audit log | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ |
| Ver carta pública | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Impersonar usuario | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Modelado RBAC

`Role` + `Permission` (code: `menu.edit`, `order.fire`, etc) + `RolePermission`. Cada permiso chequeado por guard `requirePermission('...')`. Roles se siembran por tenant al crear restaurant. Admite agregar roles custom en V1 sin cambiar el modelo.

---

## 6. Flujos principales

### 6.1 Reserva desde la web

1. Cliente abre `baryresto.app/{slug}` → **Reservar**.
2. Elige fecha, franja, pax.
3. `GET /api/public/{slug}/availability?date&pax` devuelve franjas con cupo.
4. Completa nombre, teléfono (obligatorio), email (opcional), observaciones. Recaptcha v3.
5. `POST /api/public/{slug}/reservations` → `Reservation.status = PENDING` (si `require_confirmation`) o `CONFIRMED` (auto).
6. Email con link `baryresto.app/r/{token}` para gestionar (cancelar).
7. Notificación al manager (email + push en dashboard).

### 6.2 Reserva por WhatsApp (MVP híbrido, sin Cloud API)

1. Sitio público muestra botón **Reservar por WhatsApp** → abre `wa.me/{phone}?text=...` con mensaje prellenado.
2. El restaurante responde por WhatsApp Business normal.
3. Manager crea la reserva en backoffice con un clic: deep link `admin/reservas/nueva?source=whatsapp&phone=...&date=...`.
4. `Reservation.source = WHATSAPP` para tracking.

> V1 → bot con Meta Cloud API + templates aprobados.

### 6.3 Apertura de mesa y pedido (mozo)

1. Mozo abre PWA, login.
2. Ve grid del salón con estado en vivo (polling 5 s en MVP; SSE en V1).
3. Selecciona mesa libre → **Abrir** → captura comensales → crea `Order(status=OPEN)`.
4. Busca productos por categoría o nombre → agrega `OrderItem` con cantidad y observación.
5. **Enviar a cocina** → items pasan a `FIRED` con timestamp.
6. Puede agregar más rondas.
7. **Pedir cuenta** → mesa `CLOSING`.
8. Registra cobro (ver 6.4). Al aprobar, mesa vuelve a `FREE` y order a `CLOSED`.

### 6.4 Cobro

1. Desde mesa en `CLOSING` → **Cobrar**.
2. Resumen total + propina (input opcional).
3. Elige método: `CASH`, `CARD_MANUAL`, `MERCADOPAGO_LINK`, `MERCADOPAGO_QR`, `TRANSFER`.
4. Si MP: backend crea Preference → muestra link/QR → espera webhook.
5. Si manual: aprueba al instante.
6. Crea `Payment` ligado a `Order`. Audit log.

### 6.5 Carga de plato

1. Manager en Admin > Menú > **Nuevo plato**.
2. Define categoría, nombre, descripción, precio, imagen (upload Cloudinary unsigned), tags (vegano, sin TACC, etc), disponibilidad, orden, destacado.
3. Guarda → inmediatamente disponible en carta pública y app de mozo.

---

## 7. Arquitectura técnica

**Estilo**: **monolito modular** en Next.js 14 full-stack.
- Un solo proceso + un solo repo + un solo deploy.
- Prisma compartido.
- SSR para SEO del sitio público.
- Server Actions para backoffice, Route Handlers para API pública y webhooks.
- Modularización por bounded context en `src/modules/*`.
- Extraíble a servicios dedicados si crece (ej. KDS en V1, motor de notificaciones en V2).

**Multi-tenant**: single DB, shared schema, columna `restaurantId` en toda tabla de negocio. Middleware resuelve tenant por `/{slug}` (público) o `session.restaurantId` (privado). Prisma extension fuerza el filtro `where: { restaurantId }` para bloquear leaks cross-tenant.

**Tiempo real**: polling 5 s en MVP (más simple, sin infra adicional). SSE en V1. Pusher/Ably si escala más allá de ~100 conexiones simultáneas.

**Autorización**: RBAC (tabla `Role` + `Permission` + `RolePermission`), guard `requirePermission('...')`.

---

## 8. Stack tecnológico

| Capa | Elección | Justificación |
|---|---|---|
| Framework | **Next.js 14 App Router** | SSR/SEO + API + backoffice + PWA en un repo |
| Lenguaje | **TypeScript** | Type safety end-to-end con Prisma |
| DB | **PostgreSQL en Neon** | Serverless, free tier decente, branching para staging |
| ORM | **Prisma** | Migrations, type-safe, relaciones complejas |
| Auth | **Auth.js v5 (credenciales + magic link via Resend)** | Self-hosted, gratis, multi-tenant custom |
| UI | **Tailwind + shadcn/ui + Radix** | Velocidad, accesible, copy-paste |
| Storage | **Cloudinary** | Upload directo desde el cliente + transformaciones + 25 GB gratis |
| Email | **Resend** | DX simple, 100 emails/día gratis |
| Pagos | **Mercado Pago Checkout Pro** | LATAM, webhook simple, ARS, QR dinámico |
| WhatsApp | **wa.me (MVP)** → **Meta Cloud API (V1)** | Evitar fricción Meta / costos en MVP |
| Deploy | **Vercel** | Zero-config Next.js + edge + SSL + dominios |
| Observabilidad | **Sentry + Vercel Analytics** | Free tier suficiente |
| PWA mozo | **next-pwa** | Instalable + cache básico |
| Validación | **Zod** | Schemas compartidos client/server |
| Forms | **react-hook-form + Zod** | Estándar Next |
| Estado server | **TanStack Query** | Cache + invalidaciones |
| Tests | **Vitest + Playwright** | Rápido + smoke E2E |

### Decisiones explícitas

| Pregunta | Decisión | Justificación |
|---|---|---|
| ¿Monolito o microservicios? | Monolito modular | MVP rápido, un solo deploy, extraíble |
| ¿Next full-stack o separado? | **Next full-stack** | Menos piezas; separar solo si crece |
| ¿PostgreSQL o alternativa? | **PostgreSQL (Neon)** | SQL fuerte, relacional, probado |
| ¿Prisma sí o no? | **Sí** | Type-safety + migrations + DX |
| ¿RBAC? | Role + Permission + RolePermission + guard | Flexible sin overkill |
| ¿WhatsApp Cloud API? | **No en MVP**, usar wa.me | Evita aprobación Meta + costo |
| ¿Pagos reales en MVP? | **Sí, MP Checkout Pro** + manual | Valor inmediato |
| ¿Mesa auto o manual? | **Manual asistida** (sugiere, confirma humano) | Simple y sin conflictos |
| ¿KDS en MVP? | **No**, V1 | Hardware + UX dedicada |
| ¿Multi-tenant día 1? | **Sí**, single DB + `restaurantId` | Evita refactor y habilita demo con varios tenants |

---

## 9. Entidades principales

`Restaurant` · `Plan` · `User` · `Role` · `Permission` · `RolePermission` · `UserRestaurant` · `Customer` · `Reservation` · `Zone` · `Table` · `MenuCategory` · `MenuItem` · `Order` · `OrderItem` · `Payment` · `MediaAsset` · `SiteContent` · `BusinessHours` · `SpecialDay` · `AuditLog` · `Session`.

---

## 10. Esquema de base de datos inicial (Prisma)

```prisma
// --- PLATFORM ---
model Plan {
  id        String   @id @default(cuid())
  code      String   @unique           // BASIC, PRO
  name      String
  priceArs  Int
  features  Json
  createdAt DateTime @default(now())
  restaurants Restaurant[]
}

model Restaurant {
  id            String           @id @default(cuid())
  slug          String           @unique
  name          String
  timezone      String           @default("America/Argentina/Buenos_Aires")
  currency      String           @default("ARS")
  phone         String?
  whatsappPhone String?
  address       String?
  logoUrl       String?
  planId        String?
  plan          Plan?            @relation(fields: [planId], references: [id])
  status        RestaurantStatus @default(TRIAL)
  createdAt     DateTime         @default(now())
  users         UserRestaurant[]
  zones         Zone[]
  tables        Table[]
  categories    MenuCategory[]
  items         MenuItem[]
  reservations  Reservation[]
  orders        Order[]
  customers     Customer[]
  siteContent   SiteContent?
  media         MediaAsset[]
  businessHours BusinessHours[]
  specialDays   SpecialDay[]
  auditLogs     AuditLog[]
  payments      Payment[]
  @@index([slug])
}

enum RestaurantStatus { ACTIVE SUSPENDED TRIAL }

// --- AUTH & RBAC ---
model User {
  id              String           @id @default(cuid())
  email           String           @unique
  name            String
  phone           String?
  passwordHash    String?
  isPlatformAdmin Boolean          @default(false)
  createdAt       DateTime         @default(now())
  restaurants     UserRestaurant[]
  sessions        Session[]
}

model UserRestaurant {
  id           String     @id @default(cuid())
  userId       String
  restaurantId String
  roleId       String
  createdAt    DateTime   @default(now())
  user         User       @relation(fields: [userId], references: [id])
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  role         Role       @relation(fields: [roleId], references: [id])
  @@unique([userId, restaurantId])
  @@index([restaurantId])
}

model Role {
  id           String            @id @default(cuid())
  code         RoleCode
  name         String
  restaurantId String?           // null = rol global plataforma
  permissions  RolePermission[]
  memberships  UserRestaurant[]
  @@unique([code, restaurantId])
}

enum RoleCode { SUPER_ADMIN OWNER MANAGER WAITER CASHIER KITCHEN }

model Permission {
  id    String           @id @default(cuid())
  code  String           @unique     // "order.create", "menu.edit", etc.
  label String
  roles RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

// --- FLOOR ---
model Zone {
  id           String     @id @default(cuid())
  restaurantId String
  name         String
  orderIndex   Int        @default(0)
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  tables       Table[]
  @@index([restaurantId])
}

model Table {
  id           String        @id @default(cuid())
  restaurantId String
  zoneId       String?
  code         String
  seats        Int
  status       TableStatus   @default(FREE)
  posX         Int?
  posY         Int?
  restaurant   Restaurant    @relation(fields: [restaurantId], references: [id])
  zone         Zone?         @relation(fields: [zoneId], references: [id])
  orders       Order[]
  reservations Reservation[]
  @@unique([restaurantId, code])
  @@index([restaurantId, status])
}

enum TableStatus { FREE OCCUPIED RESERVED CLOSING OUT_OF_SERVICE }

// --- MENU ---
model MenuCategory {
  id           String     @id @default(cuid())
  restaurantId String
  name         String
  description  String?
  orderIndex   Int        @default(0)
  visible      Boolean    @default(true)
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  items        MenuItem[]
  @@index([restaurantId])
}

model MenuItem {
  id           String        @id @default(cuid())
  restaurantId String
  categoryId   String
  name         String
  description  String?
  priceCents   Int
  imageUrl     String?
  tags         String[]
  featured     Boolean       @default(false)
  available    Boolean       @default(true)
  orderIndex   Int           @default(0)
  restaurant   Restaurant    @relation(fields: [restaurantId], references: [id])
  category     MenuCategory  @relation(fields: [categoryId], references: [id])
  orderItems   OrderItem[]
  @@index([restaurantId, categoryId])
}

// --- RESERVATIONS ---
model Reservation {
  id           String            @id @default(cuid())
  restaurantId String
  customerId   String?
  tableId      String?
  startsAt     DateTime
  durationMin  Int               @default(90)
  pax          Int
  status       ReservationStatus @default(PENDING)
  source       ReservationSource @default(WEB)
  publicToken  String            @unique @default(cuid())
  contactName  String
  contactPhone String
  contactEmail String?
  notes        String?
  createdBy    String?
  createdAt    DateTime          @default(now())
  confirmedAt  DateTime?
  canceledAt   DateTime?
  arrivedAt    DateTime?
  restaurant   Restaurant        @relation(fields: [restaurantId], references: [id])
  customer     Customer?         @relation(fields: [customerId], references: [id])
  table        Table?            @relation(fields: [tableId], references: [id])
  @@index([restaurantId, startsAt])
  @@index([contactPhone])
}

enum ReservationStatus { PENDING CONFIRMED CANCELED NO_SHOW ARRIVED COMPLETED }
enum ReservationSource { WEB WHATSAPP BACKOFFICE PHONE }

// --- CUSTOMERS ---
model Customer {
  id           String        @id @default(cuid())
  restaurantId String
  name         String
  phone        String
  email        String?
  notes        String?
  visitsCount  Int           @default(0)
  lastVisitAt  DateTime?
  createdAt    DateTime      @default(now())
  restaurant   Restaurant    @relation(fields: [restaurantId], references: [id])
  reservations Reservation[]
  orders       Order[]
  @@unique([restaurantId, phone])
  @@index([restaurantId])
}

// --- SERVICE / ORDERS ---
model Order {
  id            String      @id @default(cuid())
  restaurantId  String
  tableId       String?
  customerId    String?
  waiterId      String?
  code          Int
  status        OrderStatus @default(OPEN)
  type          OrderType   @default(DINE_IN)
  guests        Int?
  subtotalCents Int         @default(0)
  tipCents      Int         @default(0)
  totalCents    Int         @default(0)
  notes         String?
  openedAt      DateTime    @default(now())
  firedAt       DateTime?
  closedAt      DateTime?
  restaurant    Restaurant  @relation(fields: [restaurantId], references: [id])
  table         Table?      @relation(fields: [tableId], references: [id])
  customer      Customer?   @relation(fields: [customerId], references: [id])
  items         OrderItem[]
  payments      Payment[]
  @@unique([restaurantId, code])
  @@index([restaurantId, status])
}

enum OrderStatus { OPEN FIRED SERVING CLOSING CLOSED CANCELED }
enum OrderType { DINE_IN TAKEAWAY }

model OrderItem {
  id                 String          @id @default(cuid())
  orderId            String
  itemId             String
  nameSnapshot       String
  priceCentsSnapshot Int
  quantity           Int
  notes              String?
  status             OrderItemStatus @default(PENDING)
  createdAt          DateTime        @default(now())
  order              Order           @relation(fields: [orderId], references: [id])
  item               MenuItem        @relation(fields: [itemId], references: [id])
  @@index([orderId])
}

enum OrderItemStatus { PENDING FIRED READY DELIVERED CANCELED }

// --- PAYMENTS ---
model Payment {
  id             String        @id @default(cuid())
  restaurantId   String
  orderId        String
  method         PaymentMethod
  amountCents    Int
  tipCents       Int           @default(0)
  status         PaymentStatus @default(PENDING)
  mpPreferenceId String?
  mpPaymentId    String?
  createdBy      String
  createdAt      DateTime      @default(now())
  paidAt         DateTime?
  order          Order         @relation(fields: [orderId], references: [id])
  restaurant     Restaurant    @relation(fields: [restaurantId], references: [id])
  @@index([restaurantId, createdAt])
}

enum PaymentMethod { CASH CARD_MANUAL MERCADOPAGO_LINK MERCADOPAGO_QR TRANSFER }
enum PaymentStatus { PENDING APPROVED REJECTED REFUNDED }

// --- CMS / PUBLIC SITE ---
model SiteContent {
  id            String     @id @default(cuid())
  restaurantId  String     @unique
  heroTitle     String?
  heroSubtitle  String?
  heroImage     String?
  aboutText     String?
  addressMapUrl String?
  instagramUrl  String?
  openingInfo   String?
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id])
}

model MediaAsset {
  id           String     @id @default(cuid())
  restaurantId String
  url          String
  publicId     String
  kind         MediaKind
  alt          String?
  orderIndex   Int        @default(0)
  createdAt    DateTime   @default(now())
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  @@index([restaurantId, kind])
}

enum MediaKind { GALLERY LOGO DISH HERO }

// --- HOURS ---
model BusinessHours {
  id           String     @id @default(cuid())
  restaurantId String
  weekday      Int
  openTime     String
  closeTime    String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  @@index([restaurantId])
}

model SpecialDay {
  id           String     @id @default(cuid())
  restaurantId String
  date         DateTime   @db.Date
  closed       Boolean    @default(false)
  openTime     String?
  closeTime    String?
  note         String?
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  @@unique([restaurantId, date])
}

// --- AUDIT ---
model AuditLog {
  id           String      @id @default(cuid())
  restaurantId String?
  userId       String?
  action       String
  entity       String
  entityId     String?
  diff         Json?
  ip           String?
  createdAt    DateTime    @default(now())
  restaurant   Restaurant? @relation(fields: [restaurantId], references: [id])
  @@index([restaurantId, createdAt])
}

// --- AUTH SESSION ---
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 11. API design (endpoints)

Nomenclatura: `/api/public/*` (sin auth, por slug), `/api/admin/*` (auth + RBAC), `/api/platform/*` (super admin), `/api/webhooks/*`.

### Público (tenant por slug)

| Método | Path | Propósito |
|---|---|---|
| GET | `/api/public/{slug}/site` | Contenido del sitio + horarios |
| GET | `/api/public/{slug}/menu` | Categorías + ítems visibles |
| GET | `/api/public/{slug}/gallery` | Imágenes galería |
| GET | `/api/public/{slug}/availability?date&pax` | Franjas con cupo |
| POST | `/api/public/{slug}/reservations` | Crear reserva |
| GET | `/api/public/reservations/{token}` | Ver reserva por token |
| POST | `/api/public/reservations/{token}/cancel` | Cancelar por token |

### Auth

| Método | Path | Propósito |
|---|---|---|
| POST | `/api/auth/signin` | Login credenciales |
| POST | `/api/auth/magic` | Magic link |
| POST | `/api/auth/signout` | Logout |

### Admin — Config (OWNER, MANAGER)

| Método | Path | Propósito | Roles |
|---|---|---|---|
| GET | `/api/admin/restaurant` | Datos del tenant | OWNER, MANAGER |
| PATCH | `/api/admin/restaurant` | Editar datos base | OWNER |
| GET · PATCH | `/api/admin/site-content` | CMS sitio | OWNER, MANAGER |
| GET · POST · DELETE | `/api/admin/media` | Galería | OWNER, MANAGER |
| GET · POST · PATCH | `/api/admin/hours` | Horarios | OWNER, MANAGER |
| GET · POST · PATCH · DELETE | `/api/admin/special-days` | Feriados | OWNER, MANAGER |

### Admin — Usuarios / Roles

| Método | Path | Propósito | Roles |
|---|---|---|---|
| GET | `/api/admin/users` | Listar | OWNER, MANAGER(limit) |
| POST | `/api/admin/users` | Invitar | OWNER |
| PATCH | `/api/admin/users/:id` | Editar rol | OWNER |
| DELETE | `/api/admin/users/:id` | Revocar | OWNER |
| GET | `/api/admin/roles` | Listar roles | OWNER |

### Menu

| Método | Path | Propósito | Roles |
|---|---|---|---|
| GET · POST | `/api/admin/menu/categories` | ABM categorías | OWNER, MANAGER |
| PATCH · DELETE | `/api/admin/menu/categories/:id` | - | OWNER, MANAGER |
| GET · POST | `/api/admin/menu/items` | ABM ítems | OWNER, MANAGER |
| PATCH · DELETE | `/api/admin/menu/items/:id` | - | OWNER, MANAGER |
| PATCH | `/api/admin/menu/items/:id/availability` | Toggle rápido | OWNER, MANAGER, WAITER |

### Floor

| Método | Path | Propósito | Roles |
|---|---|---|---|
| GET · POST | `/api/admin/zones` | ABM zonas | OWNER, MANAGER |
| PATCH · DELETE | `/api/admin/zones/:id` | - | OWNER, MANAGER |
| GET · POST | `/api/admin/tables` | ABM mesas | OWNER, MANAGER |
| PATCH · DELETE | `/api/admin/tables/:id` | - | OWNER, MANAGER |
| GET | `/api/admin/floor/state` | Grid salón + órdenes vivas | todos internos |
| GET | `/api/admin/floor/stream` (SSE / V1) | Cambios en vivo | todos internos |

### Reservations

| Método | Path | Propósito | Roles |
|---|---|---|---|
| GET | `/api/admin/reservations?date` | Lista | OWNER, MANAGER, WAITER |
| POST | `/api/admin/reservations` | Crear manual | OWNER, MANAGER |
| PATCH | `/api/admin/reservations/:id` | Estado/mesa | OWNER, MANAGER, WAITER(checkin) |
| DELETE | `/api/admin/reservations/:id` | Cancelar | OWNER, MANAGER |

### Service / Orders

| Método | Path | Propósito | Roles |
|---|---|---|---|
| POST | `/api/admin/orders` | Abrir mesa | WAITER+ |
| GET | `/api/admin/orders?status=OPEN` | Lista | WAITER+ |
| GET | `/api/admin/orders/:id` | Detalle | WAITER+ |
| POST | `/api/admin/orders/:id/items` | Agregar items | WAITER+ |
| PATCH | `/api/admin/orders/:id/items/:itemId` | Editar qty/notes | WAITER+ |
| DELETE | `/api/admin/orders/:id/items/:itemId` | Quitar (si no fired) | WAITER+ |
| POST | `/api/admin/orders/:id/fire` | Enviar comanda | WAITER+ |
| POST | `/api/admin/orders/:id/request-bill` | Pedir cuenta | WAITER+ |
| POST | `/api/admin/orders/:id/close` | Cerrar | OWNER, MANAGER, CASHIER |

### Payments

| Método | Path | Propósito | Roles |
|---|---|---|---|
| POST | `/api/admin/payments` | Registrar | CASHIER+ |
| GET | `/api/admin/payments?date` | Listado | CASHIER+ |
| POST | `/api/admin/payments/mp/preference` | Preference MP | CASHIER+ |
| POST | `/api/webhooks/mercadopago` | Webhook MP | firma |

### Reports

| Método | Path | Propósito | Roles |
|---|---|---|---|
| GET | `/api/admin/reports/sales?range` | Totales | OWNER, MANAGER |
| GET | `/api/admin/reports/top-items` | Top productos | OWNER, MANAGER |
| GET | `/api/admin/reports/reservations` | Reservas por día | OWNER, MANAGER |

### Platform (SUPER_ADMIN)

| Método | Path | Propósito |
|---|---|---|
| GET · POST | `/api/platform/restaurants` | ABM tenants |
| PATCH | `/api/platform/restaurants/:id/status` | Activar/suspender |
| GET | `/api/platform/metrics` | KPIs plataforma |
| POST | `/api/platform/impersonate/:userId` | Impersonar |

---

## 12. Diseño frontend — pantallas por actor

### Cliente final (sitio público, mobile-first)
- `/` — landing genérica baryresto (marketing / onboarding).
- `/{slug}` — home restaurante (hero + CTA reservar + CTA WhatsApp + CTA carta).
- `/{slug}/menu` — carta navegable por categorías, con imágenes y precios.
- `/{slug}/galeria`.
- `/{slug}/reservar` — wizard 3 pasos (fecha/pax → horario → datos).
- `/{slug}/reservar/ok?token` — confirmación.
- `/r/{token}` — gestionar reserva (cancelar).
- `/qr/{slug}` — redirect a `/{slug}/menu?ref=qr`.

### Mozo (PWA mobile, instalable)
- `/app/login`.
- `/app/salon` — grid de mesas con colores por estado.
- `/app/mesa/:id` — detalle mesa + pedido.
- `/app/mesa/:id/agregar` — buscador/categorías.
- `/app/mesa/:id/cobrar` — resumen + método pago.
- `/app/reservas-hoy` — reservas del turno + check-in.

### Caja
- `/app/caja` — órdenes en `CLOSING`.
- `/app/caja/historial`.
- `/app/caja/mp` — estado de links/QR generados.

### Manager / Owner (backoffice desktop-first, responsive)
- `/admin` — dashboard (ocupación hoy, próximas reservas, ventas día).
- `/admin/reservas` — calendario + lista + crear manual.
- `/admin/salon` — config zonas + mesas.
- `/admin/menu/categorias`, `/admin/menu/items`.
- `/admin/clientes`.
- `/admin/usuarios`.
- `/admin/sitio` — CMS (hero, about, galería, instagram, horarios).
- `/admin/config` — datos del restaurante, feriados, QR.
- `/admin/reportes`.
- `/admin/audit`.

### Super admin
- `/platform/restaurants`.
- `/platform/restaurants/:id`.
- `/platform/metrics`.

---

## 13. Backoffice — lineamientos

- Layout con sidebar colapsable + topbar con selector de tenant (para usuarios con acceso a varios).
- shadcn Table · Dialog · Sheet · Form · Toast · Calendar · Command (⌘K quick search).
- Vista **Hoy** arriba de todo: próximas reservas, salón resumido, ventas día.
- Empty states con siguiente acción sugerida.

---

## 14. Integración con WhatsApp

### MVP — estrategia híbrida sin costo
- Campo `Restaurant.whatsappPhone`.
- Botón `wa.me/{phone}?text=...` en sitio público y email de confirmación.
- Deep link desde el mensaje entrante al backoffice: `admin/reservas/nueva?source=whatsapp&phone=...&date=...&pax=...`.
- `Reservation.source = WHATSAPP` para tracking.

### V1 — Meta WhatsApp Cloud API
- Verificación de número con Meta.
- Templates aprobados: confirmación, recordatorio 24 h, recordatorio 2 h, agradecimiento.
- Webhook `/api/webhooks/whatsapp` + queue + state machine por conversación.
- Costo: ~USD 0.005–0.03 por conversación iniciada por negocio.

### Roadmap
- Bot con IA (pregunta por carta, horarios, disponibilidad en lenguaje natural; reservas conversacionales).

---

## 15. Gestión de QR

### MVP
- QR único por restaurante (`https://baryresto.app/qr/{slug}` → redirect a `/{slug}/menu?ref=qr`).
- Backoffice genera imagen PNG + SVG descargable (lib `qrcode`).
- Restaurante lo imprime / pega en pared.

### V1
- QR por mesa (`/{slug}/menu?table={code}`).
- Pre-requisito para auto-pedido (Roadmap).

---

## 16. Gestión de pagos

### MVP
- **Manual**: `CASH`, `CARD_MANUAL`, `TRANSFER` → un clic, sin integración.
- **Mercado Pago Checkout Pro**:
  - Backend crea `Preference` con items del order.
  - Frontend muestra link + QR dinámico.
  - Cliente paga, MP llama `/api/webhooks/mercadopago` firmado.
  - Validación de firma + idempotencia por `mpPaymentId` → `Payment.status = APPROVED` → mesa libre.
- **Propina**: input libre, `tipCents`.

**Por qué MP antes que Stripe**: 90% del target es AR/LATAM, MP tiene adopción masiva, ARS nativo, QR dinámico, checkout embebido en español. Stripe requiere tarjeta internacional.

### V1
- División de cuenta.
- Propinas sugeridas (10/15/20 %).
- Reembolsos.
- Pagos parciales.

### Roadmap
- Stripe (expansión internacional).
- Facturación AFIP (proyecto regulatorio aparte).

---

## 17. Reglas de negocio críticas

1. El precio de un plato no cambia en órdenes ya abiertas: **snapshot** del precio al agregar el item.
2. No se puede cerrar una orden con `sum(Payment.APPROVED) < total` salvo override de MANAGER+.
3. Disponibilidad de reserva = horario abierto ∧ no feriado cerrado ∧ capacity ≥ pax.
4. Capacity por franja = Σ sillas de mesas no `OUT_OF_SERVICE` − reservas superpuestas (margen duración, default 90 min).
5. Una mesa no puede volver a `FREE` si tiene order no `CLOSED`.
6. Una order no puede pasar a `FIRED` sin al menos 1 item.
7. Una reserva solo puede `CANCEL` en `PENDING` / `CONFIRMED` y con ≥ 2 h de anticipación (configurable).
8. Cross-tenant: toda query filtra por `restaurantId` derivado de sesión/slug, nunca del body.
9. Códigos de mesa únicos por restaurante.
10. `User.email` único global: un usuario puede pertenecer a varios restaurantes con distintos roles.

---

## 18. Validaciones clave (Zod)

- `Reservation`: `pax ∈ [1,30]`, `startsAt > now + 30min`, `contactPhone` E.164/AR, `contactEmail` válido si presente.
- `MenuItem`: `priceCents > 0`, `name ∈ [2,80]`, `tags.length ≤ 5`.
- `Table`: `seats ∈ [1,20]`, `code` alfanumérico único.
- `Order`: ≥ 1 `OrderItem` para `FIRE`.
- `Payment`: `amountCents > 0`, `method` enum, `tipCents ≥ 0`.

---

## 19. Riesgos y decisiones de arquitectura

| Riesgo | Mitigación |
|---|---|
| Cross-tenant leak | Prisma extension que fuerza `restaurantId` + tests de aislamiento |
| Webhook MP sin firma válida | Verificar `x-signature` + idempotencia por `mpPaymentId` |
| Doble booking por carrera | Transacción + advisory lock por `(restaurantId, startsAt_slot)` |
| PWA mozo offline | MVP best-effort: cache carta + grid; crear items requiere online |
| Email a spam | Resend + SPF/DKIM + dominio verificado |
| Escalado SSE Vercel | Polling en MVP; SSE/Ably en V1 si crecen conexiones |
| Migración multi-tenant → domain custom | CNAME + SSL on-demand (V1) |
| AFIP/fiscal | Fuera de MVP; integración externa (Talonario, Fudo Fiscal, Tiendanube Facturas) |

---

## 20. Roadmap por fases

- **MVP (0–6 semanas)**: sitio público, carta, QR general, reservas web, WhatsApp wa.me, salón, mozo, cobros (manual + MP), admin, RBAC, audit básico, reportes simples.
- **V1 (6–12 semanas)**: WhatsApp Cloud API + recordatorios, QR por mesa, KDS simple, impresión, división de cuenta, descuentos, reportes ocupación, multi-sucursal UI, lista de espera.
- **V2 (3–6 meses)**: auto-pedido por QR, delivery/takeaway, stock básico, fidelización, encuestas, Stripe.
- **Roadmap**: AFIP/fiscal, IA assistant, app cliente multi-local, marketplace baryresto.

---

## 21. Backlog priorizado

### P0 — imprescindible MVP

1. Setup repo (Next 14 + Prisma + Neon + Tailwind + shadcn + Auth.js + Cloudinary + Resend).
2. Schema Prisma base + migrations + seed (roles, permisos, plan BASIC).
3. Onboarding SUPER_ADMIN → alta Restaurant + OWNER.
4. Login + RBAC guard.
5. CMS sitio: datos restaurante, hero, about, galería, horarios, feriados.
6. ABM categorías + platos + imágenes (Cloudinary unsigned preset).
7. Sitio público por slug: home + menu + galería + contacto.
8. ABM zonas + mesas.
9. Motor disponibilidad reservas.
10. Reserva pública web + email confirmación (Resend).
11. Backoffice reservas: lista / calendario / crear / confirmar / cancelar / no-show / arrived.
12. Botón WhatsApp wa.me en sitio + deep link backoffice.
13. PWA mozo: login + salón + abrir mesa + items + fire + pedir cuenta.
14. Cobro manual + MP Checkout Pro + webhook.
15. QR general del restaurante (generador).
16. Admin usuarios + invitaciones por email.
17. Audit log de acciones críticas.
18. Reporte básico: ventas día/semana, top ítems.
19. Super admin: ABM restaurants + suspender.
20. Deploy Vercel + Neon + Cloudinary + dominio.

### P1 — v1
- WhatsApp Cloud API + templates + recordatorios.
- KDS + comanda imprimible.
- QR por mesa.
- División de cuenta.
- Descuentos + propinas sugeridas.
- Multi-sucursal UI.
- Reportes ocupación + no-show.
- Lista de espera.

### P2 — posterior
- Auto-pedido por QR.
- Fidelización (stamp cards / puntos).
- Delivery/takeaway.
- Stock.
- Stripe.
- AFIP fiscal.
- i18n.
- App cliente nativa.

---

## 22. Criterios de aceptación del MVP

- [ ] Un OWNER puede registrarse (invitado por super-admin), configurar su sitio, subir galería, cargar 20 platos, configurar mesas, activar su URL pública y recibir una reserva real desde la web con email de confirmación.
- [ ] Un mozo puede abrir mesa, cargar 5 items, enviar comanda, pedir cuenta y cobrar con MP, todo desde celular en menos de 60 s.
- [ ] La carta pública carga en menos de 1.5 s en móvil, es accesible por QR y es responsive.
- [ ] Un pago aprobado por MP libera la mesa automáticamente vía webhook.
- [ ] El super-admin puede suspender un restaurante y este deja de atender reservas en menos de 1 min.
- [ ] Ningún usuario de un restaurante puede ver data de otro (verificado por suite de tests multi-tenant).
- [ ] Las acciones críticas quedan en `AuditLog`.
- [ ] Deploy productivo con SSL y dominio custom (`baryresto.app`).

---

## 23. Estructura del repositorio

```
baryresto/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── favicon.ico
│   └── brand/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                      # landing baryresto
│   │   │   └── [slug]/
│   │   │       ├── page.tsx                  # home restaurante
│   │   │       ├── menu/page.tsx
│   │   │       ├── galeria/page.tsx
│   │   │       ├── reservar/page.tsx
│   │   │       └── reservar/ok/page.tsx
│   │   ├── r/[token]/page.tsx                # gestionar reserva
│   │   ├── qr/[slug]/route.ts                # redirect QR
│   │   ├── app/                              # PWA mozo/caja
│   │   │   ├── login/page.tsx
│   │   │   ├── salon/page.tsx
│   │   │   ├── mesa/[id]/page.tsx
│   │   │   └── caja/page.tsx
│   │   ├── admin/                            # backoffice
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── reservas/
│   │   │   ├── salon/
│   │   │   ├── menu/
│   │   │   ├── clientes/
│   │   │   ├── usuarios/
│   │   │   ├── sitio/
│   │   │   ├── config/
│   │   │   └── reportes/
│   │   ├── platform/                         # super admin
│   │   └── api/
│   │       ├── public/
│   │       ├── admin/
│   │       ├── platform/
│   │       ├── auth/
│   │       └── webhooks/
│   ├── modules/
│   │   ├── auth/
│   │   ├── tenant/
│   │   ├── menu/
│   │   ├── reservations/
│   │   ├── floor/
│   │   ├── service/
│   │   ├── billing/
│   │   ├── customers/
│   │   ├── cms/
│   │   └── reports/
│   ├── db/
│   │   └── client.ts
│   ├── lib/
│   │   ├── rbac.ts
│   │   ├── tenant.ts
│   │   ├── cloudinary.ts
│   │   ├── mercadopago.ts
│   │   ├── email.ts
│   │   ├── qr.ts
│   │   └── zod/
│   ├── ui/
│   │   ├── components/
│   │   └── theme/
│   └── middleware.ts                         # resolución tenant + auth
└── tests/
    ├── e2e/
    └── unit/
```

---

## 24. Plan de implementación en 4 sprints

### Sprint 1 — Fundamentos (semana 1)
- Setup repo, dependencias, shadcn init.
- Schema Prisma + migrations + seed (plan, permisos, roles).
- Middleware multi-tenant (slug + sesión).
- Auth.js v5 (credenciales + magic link).
- Guard RBAC.
- Layout backoffice + público.
- Super-admin: crear Restaurant + OWNER.
- **Demo**: super-admin crea restaurant → owner loguea y ve `/admin` vacío.

### Sprint 2 — Contenido + Carta + Sitio público (semana 2)
- CMS (hero, about, contacto, instagram).
- Galería (upload Cloudinary unsigned).
- Horarios + feriados AR precargados.
- ABM categorías + platos.
- Sitio público: home + menu + galería.
- Generador QR general descargable.
- **Demo**: restaurante con sitio navegable + carta + QR.

### Sprint 3 — Reservas + Salón + Mozo (semana 3)
- ABM zonas + mesas.
- Motor de disponibilidad (transacción + advisory lock).
- Reserva pública web + email Resend.
- Backoffice reservas (lista, calendario, estados).
- Botón `wa.me` + deep link backoffice.
- PWA mozo: login + salon grid + apertura mesa + carga items + fire + pedir cuenta.
- Polling 5 s del estado del salón.
- **Demo**: reserva end-to-end + mozo opera mesa completa salvo cobrar.

### Sprint 4 — Cobros + Admin + Reportes + Deploy (semana 4)
- Payment manual (cash, card, transfer).
- MP Checkout Pro + webhook firmado + idempotencia.
- ABM usuarios + invitaciones.
- Audit log.
- Reporte ventas básico + top ítems.
- Tests multi-tenant.
- Deploy Vercel + dominio + DNS + emails verificados.
- Smoke test E2E.
- **Demo**: MVP completo productivo, 1 restaurante piloto real.

---

## 25. Variables de entorno

```bash
# Core
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."             # Neon bypass pooler para migrations
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://baryresto.app"
APP_BASE_URL="https://baryresto.app"

# Auth / email
RESEND_API_KEY="..."
EMAIL_FROM="no-reply@baryresto.app"

# Storage
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_UPLOAD_PRESET="baryresto_unsigned"

# Pagos
MP_ACCESS_TOKEN="TEST-..."
MP_PUBLIC_KEY="TEST-..."
MP_WEBHOOK_SECRET="..."

# Observabilidad
SENTRY_DSN="..."

# Feature flags
FEATURE_MP_ENABLED="true"
FEATURE_WA_CLOUD_API="false"

# WhatsApp Cloud (V1)
WA_PHONE_ID=""
WA_ACCESS_TOKEN=""
WA_VERIFY_TOKEN=""

# Anti-spam
RECAPTCHA_SITE_KEY="..."
RECAPTCHA_SECRET_KEY="..."
```

---

## 26. Seed inicial

- `Plan`: BASIC, PRO.
- `Permission` (~40 codes): `restaurant.edit`, `menu.edit`, `menu.availability`, `order.create`, `order.fire`, `order.close`, `payment.create`, `reservation.create`, `reservation.cancel`, `user.invite`, `audit.view`, etc.
- `Role`: SUPER_ADMIN (global) + OWNER, MANAGER, WAITER, CASHIER por tenant con sus permisos.
- `Restaurant` demo: `La Parrilla del Bary`, slug `parrilla-bary`.
- `User` OWNER demo: `owner@parrilla-bary.test` / `123456`.
- `Zone`: "Salón", "Patio".
- 8 `Table` (M01–M08), mezcla 2/4 sillas.
- `MenuCategory`: Entradas, Principales, Pastas, Postres, Bebidas, Vinos.
- ~20 `MenuItem` con precios reales AR.
- `BusinessHours`: martes a domingo 12-15 y 20-24.
- `SpecialDay`: feriados nacionales 2026 AR.
- 1 `Customer` con 2 reservas históricas.

---

## 27. Casos de prueba críticos

### Unit
- Motor de disponibilidad: no devuelve franjas cuando hay 0 capacity.
- Snapshot de precio congela el valor al crear `OrderItem`.
- RBAC: WAITER no puede `payment.create` sin override.
- Prisma extension filtra por `restaurantId` automáticamente.

### Integración
- Reserva web se crea, envía email, persiste con `source = WEB`.
- Order: abrir mesa → +3 items → fire → +2 items → close requiere pagos.
- Pago MP: mock webhook `APPROVED` libera la mesa.
- Cross-tenant: user de R1 pide `/api/admin/orders` y **no** ve orders de R2.

### E2E (Playwright)
- Cliente: entrar al sitio → ver carta → reservar → recibir confirmación.
- Mozo (mobile): login → abrir mesa → cargar 3 items → fire → cobrar cash → mesa libre.
- Admin: crear plato con foto → aparece en menu público.
- MP sandbox: cobrar con link → pagar en MP test → webhook aprobado → mesa libre.

---

## 28. Ideas de mejora futura

- Modo "fiesta" (reservas de eventos privados con seña).
- Distribución de propinas por mozo.
- Analítica predictiva de ocupación (ML con histórico).
- Sync con Google Business Profile (horarios + reseñas).
- Pedido previo a llegar (reserva + carta marcada).
- Alianzas con proveedores (API de precios mayoristas).
- Mesa digital: tablet con llamador de mozo + sugerencias IA.
- Cadenas / franquicias.
- Marketplace de platos destacados en `baryresto.app`.
- Reservas desde Instagram / Meta Business Suite.

---

# Entregables extra

## A. MVP final cerrado

### Incluye
- Sitio público multi-tenant por slug: home, menú, galería, reservar, contacto, botón WhatsApp.
- QR general del restaurante (descargable).
- Reservas web con validación de cupo, confirmación por email, gestión por token.
- Backoffice de reservas (calendario + lista + estados + creación manual).
- ABM completo de carta (categorías + platos + imágenes + disponibilidad).
- ABM zonas y mesas, estado en vivo (polling 5 s).
- PWA para mozos: operación completa (abrir mesa → items → fire → pedir cuenta).
- Cobros: manual (efectivo, tarjeta, transferencia) + Mercado Pago Checkout Pro + webhook.
- CMS del sitio + galería.
- RBAC con SUPER_ADMIN, OWNER, MANAGER, WAITER, CASHIER.
- Audit log básico.
- Reportes simples (ventas día/semana, top ítems).
- Super-admin: ABM de restaurantes + suspensión.

### No incluye (V1/Roadmap)
- KDS, impresión de comandas, división de cuenta, descuentos, cupones, delivery, Stripe, AFIP, reportes avanzados, fidelización, stock, WhatsApp Cloud API conversacional, QR por mesa, multi-sucursal UI, multi-idioma, auto-pedido desde QR, app nativa, encuestas.

### Supuestos
- El restaurante tiene al menos 1 persona con smartphone moderno.
- El restaurante posee cuenta Mercado Pago o usa registro manual.
- WhatsApp existe y es WhatsApp Business (o común) — para MVP alcanza con `wa.me`.
- Mercado objetivo: Argentina (zona horaria, ARS, feriados).
- Internet estable en el local; offline sólo best-effort.
- Dominio custom por restaurante queda para V1 (MVP: subpath `/{slug}`).
- Facturación fiscal a cargo de un tercero.

## B. Backlog con prioridades
Ver §21.

## C. Plan de 4 sprints
Ver §24.

## D. Estructura de carpetas
Ver §23.

## E. Set inicial de modelos
Ver §10 (Prisma schema).

## F. Pantallas mínimas
Ver §12.

## G. Por dónde empezar mañana

Orden de tareas día 1:

1. `pnpm create next-app baryresto --ts --tailwind --app --src-dir` + limpieza inicial.
2. Instalar dependencias: `prisma @prisma/client next-auth@beta @auth/prisma-adapter zod react-hook-form @tanstack/react-query resend cloudinary mercadopago qrcode date-fns`.
3. `pnpm dlx shadcn@latest init` + agregar: button, input, form, dialog, sheet, table, card, calendar, toast, command.
4. Crear cuenta Neon → copiar `DATABASE_URL` → `pnpm prisma init`.
5. Pegar schema de §10 → `pnpm prisma migrate dev --name init`.
6. `prisma/seed.ts` con permisos, roles, plan, restaurante demo, owner demo.
7. `src/middleware.ts` que resuelve tenant por slug y auth.
8. `src/lib/rbac.ts` con `requirePermission('code')`.
9. Config Auth.js v5 (credenciales + magic link Resend).
10. `/app/login` + `/admin/layout.tsx` + guard.
11. `/platform/restaurants/new` como super-admin.
12. Al cerrar el día 1: super-admin crea un restaurant → owner logea → aterriza en `/admin` vacío con auth y tenant resueltos correctamente.

A partir de ahí, seguir el plan de §24.

---

Fin del documento. Listo para ejecutar.
