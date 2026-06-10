// Lógica pura de la matriz de notas (planilla tipo Excel).

// grid[documento][numero] = valor (string del input).
export type Grid = Record<string, Record<number, string>>;

// Celdas no vacías de una columna (nº de examen) → payload de carga masiva.
export function collectColumn(
  documentos: string[],
  grid: Grid,
  numero: number,
): { postulante_documento: string; valor: number }[] {
  return documentos
    .filter((d) => {
      const v = grid[d]?.[numero];
      return v !== undefined && v !== "";
    })
    .map((d) => ({ postulante_documento: d, valor: Number(grid[d][numero]) }));
}

// Nº de columnas a mostrar: al menos 1, o hasta el examen más alto cargado.
export function maxExamNumber(grid: Grid): number {
  let max = 1;
  for (const doc of Object.keys(grid)) {
    for (const numero of Object.keys(grid[doc])) {
      const n = Number(numero);
      if (n > max) max = n;
    }
  }
  return max;
}
