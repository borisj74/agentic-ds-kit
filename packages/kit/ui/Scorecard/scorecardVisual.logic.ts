import { linearPath, smoothPath, type PathPoint } from "../shared/curve";
import type { ScorecardMeter } from "./Scorecard.types";

/** Drawing box for the reference and expressive sparklines. The svg stretches it to the slot. */
export const VISUAL_W = 100;
export const VISUAL_H = 40;
/** Room above the highest value (for the dots) and below the lowest (for the area). */
const PAD_TOP = 4;
/** Expressive lines leave room above for the end tag, so it never covers the value. */
export const PAD_TOP_TAG = 12;
const PAD_BOTTOM = 3;

export type SparklineLayout = {
  /** Points of the current period in the 100 × 40 box. */
  points: PathPoint[];
  line: string;
  /** The line closed down to the floor, for the area fill. */
  area: string;
  /** Previous period, when two or more finite values were passed. */
  compareLine: string | null;
  /** Y of the reference line in the box, when a finite reference was passed. */
  referenceY: number | null;
};

const finiteOf = (values: number[] | undefined) => (values ?? []).filter((v) => Number.isFinite(v));

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Layout for a reference or expressive sparkline: one value scale shared by the line, the previous
 * period and the reference, so they read against each other. Null with fewer than two finite values.
 */
export function sparklineLayout(
  values: number[] | undefined,
  options: { compare?: number[]; reference?: number; smooth?: boolean; padTop?: number } = {},
): SparklineLayout | null {
  const current = finiteOf(values);
  if (current.length < 2) return null;
  const previous = finiteOf(options.compare);
  const reference = Number.isFinite(options.reference) ? (options.reference as number) : null;
  const all = [...current, ...(previous.length >= 2 ? previous : []), ...(reference === null ? [] : [reference])];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min;
  const top = options.padTop ?? PAD_TOP;
  const yOf = (v: number) =>
    span === 0 ? VISUAL_H / 2 : round(top + (VISUAL_H - top - PAD_BOTTOM) * (1 - (v - min) / span));
  const toPoints = (series: number[]) =>
    series.map((v, i) => ({ x: round((i * VISUAL_W) / (series.length - 1)), y: yOf(v) }));
  const draw = options.smooth ? smoothPath : linearPath;
  const points = toPoints(current);
  const line = draw(points);
  const area = `${line} L ${VISUAL_W} ${VISUAL_H} L 0 ${VISUAL_H} Z`;
  return {
    points,
    line,
    area,
    compareLine: previous.length >= 2 ? draw(toPoints(previous)) : null,
    referenceY: reference === null ? null : yOf(reference),
  };
}

export type MeterState = {
  /** Rounded share of max, not clamped (110 when a target is beaten by 10%). */
  percent: number;
  /** True when a lower-is-better value is over its limit. A higher-is-better value is never off track. */
  overLimit: boolean;
};

/** Percent of max and whether a lower-is-better meter has gone over its limit. Null when max is not above 0. */
export function meterState(meter: ScorecardMeter | undefined): MeterState | null {
  if (!meter || !Number.isFinite(meter.max) || meter.max <= 0 || !Number.isFinite(meter.value)) return null;
  const percent = Math.round((meter.value / meter.max) * 100);
  return { percent, overLimit: meter.direction === "lower" && meter.value > meter.max };
}
