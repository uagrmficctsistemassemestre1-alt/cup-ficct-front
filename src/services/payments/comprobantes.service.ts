import { api } from "@/lib/api";
import type { DataResponse } from "@/lib/types";
import type { Comprobante } from "@/lib/payments";
import { PAYMENTS_BASE } from "./pagos.service";

export const comprobantesService = {
  // Subida (dueño / autenticado): multipart "comprobante".
  async upload(pagoId: number, file: File): Promise<Comprobante> {
    const form = new FormData();
    form.append("comprobante", file);
    const { data } = await api.post<DataResponse<Comprobante>>(
      `${PAYMENTS_BASE}/pagos/${pagoId}/comprobantes`,
      form,
    );
    return data.data;
  },
  // Listado (staff).
  async list(pagoId: number): Promise<Comprobante[]> {
    const { data } = await api.get<DataResponse<Comprobante[]>>(
      `${PAYMENTS_BASE}/pagos/${pagoId}/comprobantes`,
    );
    return data.data;
  },
};
