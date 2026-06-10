import { describe, expect, it } from "vitest";
import { collectColumn, maxExamNumber, type Grid } from "./notasGrid";

const grid: Grid = {
  "111": { 1: "90", 2: "" },
  "222": { 1: "80", 2: "75" },
  "333": {},
};

describe("collectColumn", () => {
  it("toma solo celdas no vacías y convierte a número", () => {
    expect(collectColumn(["111", "222", "333"], grid, 1)).toEqual([
      { postulante_documento: "111", valor: 90 },
      { postulante_documento: "222", valor: 80 },
    ]);
  });

  it("ignora vacíos y ausentes en la columna pedida", () => {
    expect(collectColumn(["111", "222", "333"], grid, 2)).toEqual([
      { postulante_documento: "222", valor: 75 },
    ]);
  });

  it("respeta el orden de los documentos recibidos", () => {
    expect(collectColumn(["222", "111"], grid, 1).map((n) => n.postulante_documento)).toEqual([
      "222",
      "111",
    ]);
  });
});

describe("maxExamNumber", () => {
  it("devuelve el examen más alto cargado", () => {
    expect(maxExamNumber(grid)).toBe(2);
  });

  it("devuelve al menos 1 con grid vacío", () => {
    expect(maxExamNumber({})).toBe(1);
  });
});
