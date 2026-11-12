import type { ChartDatum } from "../shared/chartMath";
import type { DataTableRow } from "../DataTable/DataTable.types";
import type { KpiBoardMetric, KpiBoardRange, KpiBoardValue } from "./KpiBoard.types";

/** Shown on the selected card; the card's accessible name reads it too. */
export const SELECTED_BADGE = "In chart";

const MISSING: KpiBoardValue = { value: "—" };

/** The range in use: the asked one when it exists, else the first. */
export function resolveRange(ranges: KpiBoardRange[], wanted: string | undefined): KpiBoardRange | undefined {
  return ranges.find((range) => range.value === wanted) ?? ranges[0];
}

/** The metric in use: the asked one when it exists, else the first. */
export function resolveMetric(metrics: KpiBoardMetric[], wanted: string | undefined): KpiBoardMetric | undefined {
  return metrics.find((metric) => metric.id === wanted) ?? metrics[0];
}

export function valueFor(metric: KpiBoardMetric, range: string | undefined): KpiBoardValue {
  return (range !== undefined && metric.values[range]) || MISSING;
}

export interface KpiBoardCard {
  id: string;
  label: string;
  value: string;
  delta?: string;
  trend?: KpiBoardValue["trend"];
  deltaTone?: KpiBoardValue["deltaTone"];
  hint?: string;
  selected: boolean;
  badge?: string;
}

/** Scorecard props per metric for one range: the selected one carries the badge. */
export function cardsFor(metrics: KpiBoardMetric[], range: KpiBoardRange | undefined, selectedId: string | undefined): KpiBoardCard[] {
  return metrics.map((metric) => {
    const figures = valueFor(metric, range?.value);
    const selected = metric.id === selectedId;
    return {
      id: metric.id,
      label: metric.label,
      value: figures.value,
      delta: figures.delta,
      trend: figures.trend,
      deltaTone: figures.deltaTone,
      hint: range ? `last ${range.label}` : undefined,
      selected,
      badge: selected ? SELECTED_BADGE : undefined,
    };
  });
}

export function seriesFor(
  series: Record<string, Record<string, ChartDatum[]>>,
  metricId: string | undefined,
  range: string | undefined,
): ChartDatum[] {
  if (metricId === undefined || range === undefined) return [];
  return series[metricId]?.[range] ?? [];
}

function rankValue(cell: DataTableRow[string] | undefined): number {
  if (typeof cell === "number") return cell;
  if (typeof cell === "string") {
    const parsed = Number(cell.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
  }
  return Number.NEGATIVE_INFINITY;
}

/** The top rows behind a metric for one range: ranked by `rankBy` (highest first), then cut to `limit`. */
export function topRows(
  rows: Record<string, Record<string, DataTableRow[]>>,
  metric: KpiBoardMetric | undefined,
  range: string | undefined,
  limit: number,
): DataTableRow[] {
  if (!metric || range === undefined) return [];
  const list = rows[metric.id]?.[range] ?? [];
  const key = metric.rankBy;
  const ranked = key ? [...list].sort((a, b) => rankValue(b[key]) - rankValue(a[key])) : list;
  return ranked.slice(0, Math.max(0, limit));
}
