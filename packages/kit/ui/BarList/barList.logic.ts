import type { BarListDatum, BarListScale, BarListSort } from "./BarList.types";

/** A value the list can draw: finite and zero or more. Anything else counts as zero. */
export function safeValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Rows in the order shown. Ties keep the order of `data`. */
export function sortRows(data: BarListDatum[], sort: BarListSort = "descending"): BarListDatum[] {
  if (sort === "none") return [...data];
  const direction = sort === "ascending" ? 1 : -1;
  return data
    .map((datum, index) => ({ datum, index }))
    .sort((a, b) => direction * (safeValue(a.datum.value) - safeValue(b.datum.value)) || a.index - b.index)
    .map(({ datum }) => datum);
}

/** Bar length as a percent of the largest value in all of `data`, so bars keep their length when more rows open. */
export function barPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, (safeValue(value) / max) * 100);
}

/** How many rows show: all of them, or `maxRows` until the list is open. */
export function visibleCount(total: number, maxRows: number | undefined, expanded: boolean): number {
  if (expanded || maxRows === undefined || !Number.isFinite(maxRows)) return total;
  return Math.max(0, Math.min(total, Math.floor(maxRows)));
}

/** What bars are measured against: the largest value, or the sum of every value for `scale="total"`. */
export function scaleBase(data: BarListDatum[], scale: BarListScale = "max"): number {
  return data.reduce(
    (base, row) => (scale === "total" ? base + safeValue(row.value) : Math.max(base, safeValue(row.value))),
    0,
  );
}

/** The row's share of the total as meta text, like 33.0% of total. */
export function shareText(value: number, total: number): string {
  return `${barPercent(value, total).toFixed(1)}% of total`;
}

export type BarListChange = { direction: "up" | "down" | "flat"; text: string };

/** The change from `previous`, worded so it never relies on colour. No badge without a usable previous value. */
export function changeFrom(value: number, previous: number | undefined): BarListChange | null {
  if (previous === undefined || !Number.isFinite(previous) || previous <= 0) return null;
  const percent = Math.round(((safeValue(value) - previous) / previous) * 1000) / 10;
  if (percent === 0) return { direction: "flat", text: "No change" };
  const amount = `${Math.abs(percent).toFixed(1)}%`;
  return percent > 0 ? { direction: "up", text: `Up ${amount}` } : { direction: "down", text: `Down ${amount}` };
}
