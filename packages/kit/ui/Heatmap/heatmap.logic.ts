import type { HeatmapDatum } from "./Heatmap.types";

/** Shade steps above zero. Level 0 is zero or empty; 1 to LEVELS run light to dark. */
export const LEVELS = 4;

/** Above this many columns, only every third column label shows, so the header stays readable. */
export const DENSE_COLUMNS = 12;
const DENSE_STRIDE = 3;

/** True when a column's label is drawn. Hidden labels stay in the grid for screen readers. */
export function showColumnLabel(index: number, count: number): boolean {
  return count <= DENSE_COLUMNS || index % DENSE_STRIDE === 0;
}

/** A value the grid can shade: finite and zero or more. */
export function safeValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Cell values by row and column. Unknown rows or columns are dropped; a repeated cell keeps the last entry. */
export function cellMap(rows: string[], columns: string[], data: HeatmapDatum[]): Map<string, number> {
  const rowSet = new Set(rows);
  const columnSet = new Set(columns);
  const map = new Map<string, number>();
  for (const datum of data) {
    if (!rowSet.has(datum.row) || !columnSet.has(datum.column)) continue;
    map.set(cellKey(datum.row, datum.column), safeValue(datum.value));
  }
  return map;
}

export function cellKey(row: string, column: string): string {
  return `${row}\u0000${column}`;
}

/** Largest value in the grid; 0 when every cell is zero or empty. */
export function maxValue(cells: Map<string, number>): number {
  let max = 0;
  for (const value of cells.values()) max = Math.max(max, value);
  return max;
}

/** Shade step for a value: 0 for zero or empty, then 1 to LEVELS by equal shares of the largest value. */
export function levelOf(value: number | undefined, max: number): number {
  if (value === undefined || max <= 0) return 0;
  const safe = safeValue(value);
  if (safe <= 0) return 0;
  return Math.min(LEVELS, Math.max(1, Math.ceil((safe / max) * LEVELS)));
}

/** Next focused cell for an arrow, Home or End key, clamped to the grid. Ctrl/Meta + Home/End jump to the corners. */
export function moveFocus(
  at: { row: number; column: number },
  key: string,
  size: { rows: number; columns: number },
  toCorner = false,
): { row: number; column: number } | null {
  const lastRow = size.rows - 1;
  const lastColumn = size.columns - 1;
  switch (key) {
    case "ArrowRight":
      return { row: at.row, column: Math.min(lastColumn, at.column + 1) };
    case "ArrowLeft":
      return { row: at.row, column: Math.max(0, at.column - 1) };
    case "ArrowDown":
      return { row: Math.min(lastRow, at.row + 1), column: at.column };
    case "ArrowUp":
      return { row: Math.max(0, at.row - 1), column: at.column };
    case "Home":
      return toCorner ? { row: 0, column: 0 } : { row: at.row, column: 0 };
    case "End":
      return toCorner ? { row: lastRow, column: lastColumn } : { row: at.row, column: lastColumn };
    default:
      return null;
  }
}
