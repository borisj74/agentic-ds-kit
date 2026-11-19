import { colorAt, niceTicks } from "../shared/chartMath";
import type { ScatterChartDatum } from "./ScatterChart.types";

/** Rows the chart can place: a finite x and y. */
export function plottable(data: ScatterChartDatum[]): ScatterChartDatum[] {
  return data.filter((row) => Number.isFinite(row.x) && Number.isFinite(row.y));
}

/** Group names in order of first appearance. Rows without a group share one unnamed group. */
export function groupsOf(data: ScatterChartDatum[]): string[] {
  const seen: string[] = [];
  for (const row of data) {
    const group = row.group ?? "";
    if (!seen.includes(group)) seen.push(group);
  }
  return seen;
}

/** --chart-1 to --chart-6 by group order. */
export function groupColor(groups: string[], group: string | undefined): string {
  return colorAt(Math.max(0, groups.indexOf(group ?? "")));
}

/**
 * Axis ticks for one measure. Counts and amounts that are all zero or more start at zero, so the
 * position reads as size; data with negatives keeps its own range.
 */
export function axisTicks(values: number[], target: number): { ticks: number[]; min: number; max: number } {
  if (!values.length) return niceTicks(0, 1, target);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min >= 0) min = 0;
  if (min === max) max = min + 1;
  const integer = values.every((value) => Number.isInteger(value));
  return niceTicks(min, max, target, { integer });
}

/**
 * Dot radius by size value, by area: the radius grows with the square root, so a value four times as
 * big gets twice the width. Missing or non-finite sizes take the smallest dot.
 */
export function radiusScale(
  sizes: (number | undefined)[],
  range: [number, number],
): (size: number | undefined) => number {
  const roots = sizes
    .filter((size): size is number => typeof size === "number" && Number.isFinite(size) && size >= 0)
    .map(Math.sqrt);
  const [rMin, rMax] = range;
  if (!roots.length) return () => rMin;
  const low = Math.min(...roots);
  const high = Math.max(...roots);
  return (size) => {
    if (typeof size !== "number" || !Number.isFinite(size) || size < 0) return rMin;
    if (high === low) return (rMin + rMax) / 2;
    return rMin + ((Math.sqrt(size) - low) / (high - low)) * (rMax - rMin);
  };
}

/** Keyboard order: by x, then y, then the order in data. Returns indexes into `rows`. */
export function keyboardOrder(rows: ScatterChartDatum[]): number[] {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => a.row.x - b.row.x || a.row.y - b.row.y || a.index - b.index)
    .map(({ index }) => index);
}

/** Next position in keyboard order for a key, or null when the key does not move. */
export function nextPosition(position: number, key: string, count: number): number | null {
  if (key === "ArrowRight" || key === "ArrowDown") return Math.min(count - 1, position + 1);
  if (key === "ArrowLeft" || key === "ArrowUp") return Math.max(0, position - 1);
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}
