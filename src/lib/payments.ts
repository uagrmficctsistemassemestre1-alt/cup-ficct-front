// Dominio del módulo Payments (espejo de la API Laravel).

// Permiso de gestión (staff). El pago propio (checkout/comprobante/recibo) lo hace
// cualquier usuario autenticado, sin permiso especial.
export const PAYMENT_MANAGE = "payment.manage";

// Enums (para selects).
export const METODOS_PAGO = ["EFECTIVO", "TRANSFERENCIA", "QR", "TARJETA"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export const ESTADOS_PAGO = ["PENDIENTE", "PAGADO", "RECHAZADO"] as const;
export type EstadoPago = (typeof ESTADOS_PAGO)[number];

export const GATEWAYS = ["stripe", "paypal"] as const;
export type Gateway = (typeof GATEWAYS)[number];

// Entidades.
export interface Pago {
  id: number;
  postulante_documento: string;
  convocatoria_id: number;
  monto: number;
  concepto: string;
  metodo: MetodoPago;
  fecha_pago: string; // "YYYY-MM-DD HH:mm"
  estado: EstadoPago;
  confirmado_por: number | null;
  confirmado_at: string | null;
  motivo_rechazo: string | null;
  created_at: string;
}

export interface Comprobante {
  id: number;
  pago_id: number;
  nombre_original: string;
  mime: string;
  tamano: number;
  created_at: string;
}

// Estilos de badge por estado de pago.
export const ESTADO_PAGO_STYLE: Record<EstadoPago, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  PAGADO: "bg-green-100 text-green-700",
  RECHAZADO: "bg-red-100 text-red-700",
};
