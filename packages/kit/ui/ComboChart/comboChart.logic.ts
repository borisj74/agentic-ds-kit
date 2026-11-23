import { niceTicks } from "../shared/chartMath";
import type { ComboChartDatum } from "./ComboChart.types";

/** Bar series colours in order. --chart-3 is kept for the line, so bars skip it. */
const BAR_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"] as const;
export const LINE_COLOR = "var(--chart-3)";

export function barColor(index: number): string {
  return BAR_COLORS[index % BAR_COLORS.length];
}

/** A finite number from a row, or undefined when the field is missing or not a number. */
export function valueOf(row: ComboChartDatum, key: string): number | undefined {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Smallest and largest value over the given keys, always including zero (bars start at zero). */
export function extentOf(data: ComboChartDatum[], keys: string[]): [number, number] {
  let min = 0;
  let max = 0;
  for (const row of data) {
    for (const key of keys) {
      const value = valueOf(row, key);
      if (value === undefined) continue;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  if (min === max) max = min + 1;
  return [min, max];
}

/** Smallest and largest value of one key, without forcing zero: a line on its own axis can float. */
export function lineExtentOf(data: ComboChartDatum[], key: string): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    const value = valueOf(row, key);
    if (value === undefined) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (!Number.isFinite(min)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  return [min, max];
}

/**
 * Stacked bar segments for one column, in series order. Positive values pile up from zero, negative
 * values pile down from zero, so gains and losses (like new and churned revenue) sit either side of
 * the baseline. Missing values give null and take no room.
 */
export function stackSegments(row: ComboChartDatum, keys: string[]): ({ start: number; end: number } | null)[] {
  let up = 0;
  let down = 0;
  return keys.map((key) => {
    const value = valueOf(row, key);
    if (value === undefined || value === 0) return value === 0 ? { start: up, end: up } : null;
    if (value > 0) {
      const segment = { start: up, end: up + value };
      up += value;
      return segment;
    }
    const segment = { start: down, end: down + value };
    down += value;
    return segment;
  });
}

/** Lowest negative pile and highest positive pile over all columns, always including zero. */
export function stackedExtentOf(data: ComboChartDatum[], keys: string[]): [number, number] {
  let min = 0;
  let max = 0;
  for (const row of data) {
    for (const segment of stackSegments(row, keys)) {
      if (!segment) continue;
      min = Math.min(min, segment.end);
      max = Math.max(max, segment.end);
    }
  }
  if (min === max) max = min + 1;
  return [min, max];
}

/** Most value-axis ticks, so gridlines stay quiet. */
const MAX_TICKS = 5;

/**
 * Value-axis ticks: tries a four- and a five-tick target and keeps whichever leaves less empty space
 * above and below the data, so the bars and the line use the height. The five-tick target only wins when
 * it really gives five ticks or fewer, so the grid never gets busier than five lines. Ties keep four.
 * Whole numbers stay whole.
 */
export function axisTicks(min: number, max: number, integer: boolean): { ticks: number[]; min: number; max: number } {
  const four = niceTicks(min, max, 4, { integer });
  const five = niceTicks(min, max, 5, { integer });
  const waste = (axis: { min: number; max: number }) => (axis.max - max + (min - axis.min)) / (axis.max - axis.min || 1);
  return five.ticks.length <= MAX_TICKS && waste(five) < waste(four) ? five : four;
}

function stepUp(raw: number): number {
  const exponent = Math.floor(Math.log10(raw));
  const base = 10 ** exponent;
  const fraction = raw / base;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * base;
}

/**
 * Ticks for the right axis that sit on the left axis's gridlines: exactly `count` ticks with one nice
 * step, covering [min, max]. The step grows until the range fits.
 */
export function alignedTicks(min: number, max: number, count: number): { ticks: number[]; min: number; max: number } {
  const steps = Math.max(count - 1, 1);
  const span = max - min || 1;
  let step = stepUp(span / steps);
  for (let guard = 0; guard < 20; guard += 1) {
    const start = Math.floor(min / step) * step;
    if (start + step * steps >= max - 1e-9) {
      const ticks = Array.from({ length: steps + 1 }, (_, index) => Number((start + step * index).toFixed(10)));
      return { ticks, min: ticks[0], max: ticks[ticks.length - 1] };
    }
    step = stepUp(step * 1.0001);
  }
  const fallback = niceTicks(min, max, count);
  return fallback;
}

/** Every value in a column, in series order: bars first, then the line. */
export function columnValues(
  row: ComboChartDatum,
  bars: { key: string }[],
  line: { key: string },
): { bars: (number | undefined)[]; line: number | undefined } {
  return { bars: bars.map((series) => valueOf(row, series.key)), line: valueOf(row, line.key) };
}

/** Next column for a key press, or null when the key does not move. */
export function nextColumn(index: number, key: string, count: number): number | null {
  if (key === "ArrowRight" || key === "ArrowDown") return Math.min(count - 1, index + 1);
  if (key === "ArrowLeft" || key === "ArrowUp") return Math.max(0, index - 1);
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}
