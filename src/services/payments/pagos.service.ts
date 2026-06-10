import { api } from "@/lib/api";
import type { DataResponse, MessageResponse, Paginated } from "@/lib/types";
import type { Gateway, MetodoPago, Pago } from "@/lib/payments";

export const PAYMENTS_BASE = "/payments";
const base = `${PAYMENTS_BASE}/pagos`;

export interface PagoCreatePayload {
  postulante_documento: string;
  convocatoria_id: number;
  monto: number;
  concepto: string;
  metodo: MetodoPago;
  fecha_pago: string;
}

export type PagoUpdatePayload = Partial<
  Pick<Pago, "monto" | "concepto" | "metodo" | "fecha_pago">
>;

export interface PagosFilter {
  postulante?: string;
  convocatoria?: number;
  per_page?: number;
}

export const pagosService = {
  async list(filter: PagosFilter = {}): Promise<Pago[]> {
    const { data } = await api.get<Paginated<Pago>>(base, {
      params: { per_page: 100, ...filter },
    });
    return data.data;
  },
  async get(id: number): Promise<Pago> {
    const { data } = await api.get<DataResponse<Pago>>(`${base}/${id}`);
    return data.data;
  },
  async create(payload: PagoCreatePayload): Promise<Pago> {
    const { data } = await api.post<DataResponse<Pago>>(base, payload);
    return data.data;
  },
  async update(id: number, payload: PagoUpdatePayload): Promise<Pago> {
    const { data } = await api.put<DataResponse<Pago>>(`${base}/${id}`, payload);
    return data.data;
  },
  async remove(id: number): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`${base}/${id}`);
    return data;
  },
  // Staff: confirmar (→ PAGADO) / rechazar (→ RECHAZADO con motivo).
  async confirmar(id: number): Promise<Pago> {
    const { data } = await api.post<DataResponse<Pago>>(`${base}/${id}/confirmar`);
    return data.data;
  },
  async rechazar(id: number, motivo: string): Promise<Pago> {
    const { data } = await api.post<DataResponse<Pago>>(`${base}/${id}/rechazar`, {
      motivo,
    });
    return data.data;
  },
  // Pago propio: checkout (Stripe/PayPal) → { url } a la que redirigir el navegador.
  async checkout(id: number, gateway?: Gateway): Promise<string> {
    const { data } = await api.post<{ url: string }>(
      `${base}/${id}/checkout`,
      undefined,
      { params: gateway ? { gateway } : undefined },
    );
    return data.url;
  },
};
