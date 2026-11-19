import type { ChartSeries } from "../shared/chartMath";
import type { LineChartStack } from "./LineChart.types";

/** One series as a band: where it starts (`lower`) and ends (`upper`) at each label, in axis units. */
export interface StackLayer {
  seriesIndex: number;
  /** The value each band stands for at each label: missing, NaN and negative count as 0. */
  values: number[];
  lower: number[];
  upper: number[];
}

export interface StackResult {
  layers: StackLayer[];
  /** The stacked total per label, from `values` (not scaled in percent mode). */
  totals: number[];
  /** Top of the value axis: the largest total, or 100 in percent mode. */
  max: number;
}

/** A value a band can stand for: finite and zero or more. Missing, NaN and negative values count as 0. */
export function stackValue(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

/** True when any series has a negative value, which stacking cannot draw. */
export function hasNegative(series: ChartSeries[]): boolean {
  return series.some((entry) => entry.data.some((value) => Number.isFinite(value) && value < 0));
}

/**
 * Stack series bottom to top, the first series at the bottom. `stacked` keeps axis units, so the top
 * edge is the total. `percent` scales every label to 100, so each band is that series' share; a label
 * whose total is 0 has every band at 0.
 */
export function stackLayers(series: ChartSeries[], count: number, mode: Exclude<LineChartStack, "none">): StackResult {
  const values = series.map((entry) => Array.from({ length: count }, (_, index) => stackValue(entry.data[index])));
  const totals = Array.from({ length: count }, (_, index) => values.reduce((sum, row) => sum + row[index], 0));
  const running = new Array<number>(count).fill(0);
  const layers: StackLayer[] = values.map((row, seriesIndex) => {
    const lower = running.slice();
    row.forEach((value, index) => {
      running[index] += value;
    });
    const upper = running.slice();
    if (mode === "percent") {
      const scale = (amount: number, index: number) => (totals[index] > 0 ? (amount / totals[index]) * 100 : 0);
      return { seriesIndex, values: row, lower: lower.map(scale), upper: upper.map(scale) };
    }
    return { seriesIndex, values: row, lower, upper };
  });
  const max = mode === "percent" ? 100 : Math.max(0, ...totals);
  return { layers, totals, max };
}

/** Share of the total, rounded to whole percent; 0 when the total is 0. */
export function sharePercent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

/** Percent axis and tooltip label: 0%, 50%, 100%. */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

const warned = new Set<string>();

/**
 * Development warnings, once per page: `stack` set on a line chart (where it does nothing), and
 * negative values in a stacked chart (they count as 0).
 */
export function warnStackMisuse(stack: LineChartStack, isArea: boolean, series: ChartSeries[]): void {
  if (process.env.NODE_ENV === "production" || stack === "none") return;
  if (!isArea && !warned.has("line")) {
    warned.add("line");
    console.warn(`[agentic-ds-kit] LineChart stack="${stack}" only applies to variant="area"; it is ignored for variant="line".`);
  }
  if (isArea && !warned.has("negative") && hasNegative(series)) {
    warned.add("negative");
    console.warn('[agentic-ds-kit] LineChart stacks negative values as 0. Use stack="none" for series that can go negative.');
  }
}
