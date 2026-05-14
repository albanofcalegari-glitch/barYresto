import { RoleCode } from "@prisma/client";

/**
 * Catálogo maestro de permisos del sistema.
 * Al agregar un nuevo permiso:
 *   1. agregarlo acá
 *   2. agregarlo al mapa ROLE_PERMISSIONS abajo
 *   3. correr `pnpm db:seed` para propagar a la DB
 */
export const PERMISSIONS = {
  // --- restaurant config ---
  RESTAURANT_EDIT: { code: "restaurant.edit", label: "Editar datos del restaurante" },
  RESTAURANT_BILLING: { code: "restaurant.billing", label: "Gestionar plan y facturación" },

  // --- CMS ---
  SITE_EDIT: { code: "site.edit", label: "Editar sitio público" },
  MEDIA_MANAGE: { code: "media.manage", label: "Subir/eliminar imágenes" },
  HOURS_EDIT: { code: "hours.edit", label: "Editar horarios y feriados" },

  // --- users / roles ---
  USER_INVITE: { code: "user.invite", label: "Invitar usuarios" },
  USER_EDIT: { code: "user.edit", label: "Editar usuarios" },
  USER_REVOKE: { code: "user.revoke", label: "Revocar acceso" },
  ROLE_VIEW: { code: "role.view", label: "Ver roles" },

  // --- menu ---
  MENU_EDIT: { code: "menu.edit", label: "ABM de categorías y platos" },
  MENU_AVAILABILITY: { code: "menu.availability", label: "Toggle disponibilidad" },

  // --- floor ---
  FLOOR_EDIT: { code: "floor.edit", label: "ABM zonas y mesas" },
  FLOOR_VIEW: { code: "floor.view", label: "Ver estado del salón" },

  // --- reservations ---
  RESERVATION_CREATE: { code: "reservation.create", label: "Crear reserva" },
  RESERVATION_EDIT: { code: "reservation.edit", label: "Editar reserva" },
  RESERVATION_CANCEL: { code: "reservation.cancel", label: "Cancelar reserva" },
  RESERVATION_CHECKIN: { code: "reservation.checkin", label: "Check-in de reserva" },

  // --- orders / service ---
  ORDER_CREATE: { code: "order.create", label: "Abrir mesa" },
  ORDER_EDIT: { code: "order.edit", label: "Editar orden" },
  ORDER_FIRE: { code: "order.fire", label: "Enviar comanda" },
  ORDER_CLOSE: { code: "order.close", label: "Cerrar orden" },
  ORDER_CANCEL: { code: "order.cancel", label: "Cancelar orden" },

  // --- payments ---
  PAYMENT_CREATE: { code: "payment.create", label: "Registrar pago" },
  PAYMENT_REFUND: { code: "payment.refund", label: "Emitir reembolso" },
  PAYMENT_VIEW: { code: "payment.view", label: "Ver historial de pagos" },

  // --- customers ---
  CUSTOMER_EDIT: { code: "customer.edit", label: "ABM clientes" },

  // --- reports ---
  REPORT_VIEW: { code: "report.view", label: "Ver reportes" },

  // --- inventory ---
  INVENTORY_VIEW: { code: "inventory.view", label: "Ver inventario" },
  INVENTORY_EDIT: { code: "inventory.edit", label: "ABM materias primas y recetas" },
  INVENTORY_STOCK: { code: "inventory.stock", label: "Gestionar stock (entradas/ajustes)" },

  // --- audit ---
  AUDIT_VIEW: { code: "audit.view", label: "Ver audit log" },

  // --- platform ---
  PLATFORM_MANAGE: { code: "platform.manage", label: "Administrar la plataforma" },
  PLATFORM_IMPERSONATE: { code: "platform.impersonate", label: "Impersonar usuarios" },
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]["code"];

const P = PERMISSIONS;

export const ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  SUPER_ADMIN: Object.values(P).map((p) => p.code) as PermissionCode[],

  OWNER: [
    P.RESTAURANT_EDIT.code,
    P.RESTAURANT_BILLING.code,
    P.SITE_EDIT.code,
    P.MEDIA_MANAGE.code,
    P.HOURS_EDIT.code,
    P.USER_INVITE.code,
    P.USER_EDIT.code,
    P.USER_REVOKE.code,
    P.ROLE_VIEW.code,
    P.MENU_EDIT.code,
    P.MENU_AVAILABILITY.code,
    P.FLOOR_EDIT.code,
    P.FLOOR_VIEW.code,
    P.RESERVATION_CREATE.code,
    P.RESERVATION_EDIT.code,
    P.RESERVATION_CANCEL.code,
    P.RESERVATION_CHECKIN.code,
    P.ORDER_CREATE.code,
    P.ORDER_EDIT.code,
    P.ORDER_FIRE.code,
    P.ORDER_CLOSE.code,
    P.ORDER_CANCEL.code,
    P.PAYMENT_CREATE.code,
    P.PAYMENT_REFUND.code,
    P.PAYMENT_VIEW.code,
    P.CUSTOMER_EDIT.code,
    P.INVENTORY_VIEW.code,
    P.INVENTORY_EDIT.code,
    P.INVENTORY_STOCK.code,
    P.REPORT_VIEW.code,
    P.AUDIT_VIEW.code,
  ],

  MANAGER: [
    P.SITE_EDIT.code,
    P.MEDIA_MANAGE.code,
    P.HOURS_EDIT.code,
    P.ROLE_VIEW.code,
    P.MENU_EDIT.code,
    P.MENU_AVAILABILITY.code,
    P.FLOOR_EDIT.code,
    P.FLOOR_VIEW.code,
    P.RESERVATION_CREATE.code,
    P.RESERVATION_EDIT.code,
    P.RESERVATION_CANCEL.code,
    P.RESERVATION_CHECKIN.code,
    P.ORDER_CREATE.code,
    P.ORDER_EDIT.code,
    P.ORDER_FIRE.code,
    P.ORDER_CLOSE.code,
    P.ORDER_CANCEL.code,
    P.PAYMENT_CREATE.code,
    P.PAYMENT_VIEW.code,
    P.CUSTOMER_EDIT.code,
    P.INVENTORY_VIEW.code,
    P.INVENTORY_EDIT.code,
    P.INVENTORY_STOCK.code,
    P.REPORT_VIEW.code,
  ],

  WAITER: [
    P.FLOOR_VIEW.code,
    P.MENU_AVAILABILITY.code,
    P.RESERVATION_CHECKIN.code,
    P.ORDER_CREATE.code,
    P.ORDER_EDIT.code,
    P.ORDER_FIRE.code,
    P.ORDER_CLOSE.code,
  ],

  CASHIER: [
    P.FLOOR_VIEW.code,
    P.ORDER_CLOSE.code,
    P.PAYMENT_CREATE.code,
    P.PAYMENT_VIEW.code,
  ],

  KITCHEN: [P.FLOOR_VIEW.code],
};

export const ROLE_LABELS: Record<RoleCode, string> = {
  SUPER_ADMIN: "Super Admin",
  OWNER: "Dueño",
  MANAGER: "Encargado",
  WAITER: "Mozo",
  CASHIER: "Cajero",
  KITCHEN: "Cocina",
};

export const ROLE_DESCRIPTIONS: Record<RoleCode, string> = {
  SUPER_ADMIN: "Acceso total a la plataforma y todos los restaurantes",
  OWNER: "Acceso completo al restaurante: menú, reservas, órdenes, pagos, inventario, reportes, usuarios y configuración",
  MANAGER: "Gestión operativa: menú, reservas, órdenes, pagos, inventario, reportes y clientes",
  WAITER: "Operación de salón: ver mesas, abrir/editar órdenes, enviar comandas, check-in de reservas",
  CASHIER: "Cobros y caja: ver salón, cerrar órdenes, registrar pagos",
  KITCHEN: "Vista de cocina: ver estado del salón y comandas",
};

export const ROLE_MODULES: Record<RoleCode, string[]> = {
  SUPER_ADMIN: ["Plataforma", "Restaurantes", "Usuarios globales"],
  OWNER: ["Menú", "Reservas", "Órdenes", "Salón", "Pagos", "Clientes", "Inventario", "Reportes", "Usuarios", "Sitio web", "Configuración"],
  MANAGER: ["Menú", "Reservas", "Órdenes", "Salón", "Pagos", "Clientes", "Inventario", "Reportes", "Sitio web"],
  WAITER: ["Órdenes", "Salón", "Reservas (check-in)"],
  CASHIER: ["Órdenes (cerrar)", "Pagos", "Salón"],
  KITCHEN: ["Salón (vista)"],
};
