import type { DashboardMetric } from "./dashboard-data";

/**
 * MRR's change per bucket, for the main chart's change strip. Each step is this bucket minus the one
 * before. The first bucket uses the value just before the period: the last previous-period point
 * when there is one, else net new MRR's first bucket (same length), else 0.
 */
export function mrrSteps(metric: DashboardMetric, metrics: readonly DashboardMetric[]): number[] {
  const current = metric.series.current;
  const before = metric.series.previous[metric.series.previous.length - 1];
  const netNew = metrics.find((m) => m.id === "netNew")?.series.current;
  const first =
    typeof before === "number" && Number.isFinite(before)
      ? (current[0] ?? 0) - before
      : netNew && netNew.length === current.length
        ? (netNew[0] ?? 0)
        : 0;
  return current.map((value, i) => (i === 0 ? first : value - (current[i - 1] ?? value)));
}

/** Index of the largest drop (most negative step), or -1 when nothing fell. */
export function largestDrop(steps: readonly number[]): number {
  let at = -1;
  steps.forEach((step, i) => {
    if (step < 0 && (at < 0 || step < (steps[at] ?? 0))) at = i;
  });
  return at;
}
