import { describe, expect, it } from "vitest";
import { parsePostulacionesReport } from "./reports.service";

const headers = ["Documento", "Postulante", "1ra opción", "2da opción", "Estado", "Turno pref."];

describe("parsePostulacionesReport", () => {
  it("mapea filas por nombre de columna", () => {
    const rows = [["999", "Test Prueba", "187-09", "187-10", "VERIFICADO", "MANANA"]];
    expect(parsePostulacionesReport(headers, rows)).toEqual([
      {
        documento: "999",
        postulante: "Test Prueba",
        primera: "187-09",
        segunda: "187-10",
        estado: "VERIFICADO",
        turno: "MANANA",
      },
    ]);
  });

  it("normaliza turno inválido/ausente a null", () => {
    const rows = [["111", "Ana", "187-09", "187-10", "PENDIENTE", "-"]];
    expect(parsePostulacionesReport(headers, rows)[0].turno).toBeNull();
  });

  it("tolera columnas reordenadas", () => {
    const h2 = ["Estado", "Documento", "Postulante", "1ra", "2da", "Turno"];
    const rows = [["RECHAZADO", "222", "Bob", "A", "B", "TARDE"]];
    const out = parsePostulacionesReport(h2, rows)[0];
    expect(out.documento).toBe("222");
    expect(out.estado).toBe("RECHAZADO");
    expect(out.turno).toBe("TARDE");
  });
});
