import type { ScorecardProps } from "../../ui/Scorecard";
import type { DashboardMetric } from "./dashboard-data";

/** "Overdue · 14 invoices" → "Overdue": the tile label without its count. */
export function shortName(label: string): string {
  return label.split(" · ")[0];
}

/**
 * The chart card's title states the finding: how far the latest point sits from the reference,
 * e.g. "MRR is $7.4k below the $420k target". The reference label's first word names it (Target,
 * Goal, Limit).
 */
export function findingFor(m: DashboardMetric): string {
  const latest = m.series.current[m.series.current.length - 1];
  const name = shortName(m.label);
  if (latest === undefined || !Number.isFinite(latest)) return name;
  const [kind, ...rest] = m.reference.label.split(" ");
  const what = rest.length ? `the ${m.format(m.reference.value)} ${kind.toLowerCase()}` : m.reference.label;
  const gap = latest - m.reference.value;
  const verb = /s$/.test(name) ? "are" : "is";
  if (gap === 0) return `${name} ${verb} at ${what}`;
  return `${name} ${verb} ${m.format(Math.abs(gap))} ${gap < 0 ? "below" : "above"} ${what}`;
}

/** Scorecard arrow from the delta text's sign, else from where the period's line went. */
export function trendFor(m: DashboardMetric): NonNullable<ScorecardProps["trend"]> {
  const sign = m.delta.trim()[0];
  if (sign === "+") return "up";
  if (sign === "-" || sign === "−") return "down";
  const first = m.series.current[0];
  const latest = m.series.current[m.series.current.length - 1];
  if (first === undefined || latest === undefined || first === latest) return "flat";
  return latest > first ? "up" : "down";
}
