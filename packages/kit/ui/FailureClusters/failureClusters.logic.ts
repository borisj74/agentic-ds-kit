import type { FailureCluster, FailureClusterStatus, FailureFilters } from "./FailureClusters.types";

/** Pure helpers behind FailureClusters. No React here. */

export const STATUS_LABEL: Record<FailureClusterStatus, string> = {
  new: "New",
  known: "Known",
  fixed: "Fixed",
  regressed: "Regressed",
};

export const STATUSES: FailureClusterStatus[] = ["new", "regressed", "known", "fixed"];

/** Largest first; ties keep their order. */
export function sortClusters(clusters: FailureCluster[]): FailureCluster[] {
  return clusters
    .map((c, i) => ({ c, i }))
    .sort((a, b) => b.c.count - a.c.count || a.i - b.i)
    .map(({ c }) => c);
}

export function filterClusters(clusters: FailureCluster[], filters: FailureFilters = {}): FailureCluster[] {
  return sortClusters(clusters).filter(
    (c) => (!filters.status || c.status === filters.status) && (!filters.agent || c.agents.some((a) => a.name === filters.agent)),
  );
}

export type TrendDirection = "up" | "down" | "flat" | "new";

/**
 * The trend in words, as counts: the last bucket against the one before, e.g. "4 more than the
 * previous period". Words, not status colours: the status Badge says whether it is a problem.
 */
export function trendWords(trend: number[]): { direction: TrendDirection; text: string } {
  if (trend.length < 2) return { direction: "flat", text: "Not enough data" };
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  if (prev === 0 && last === 0) return { direction: "flat", text: "None lately" };
  if (prev === 0) return { direction: "new", text: "New this period" };
  if (last === 0) return { direction: "down", text: "None this period" };
  const change = last - prev;
  if (change === 0) return { direction: "flat", text: "Same as the previous period" };
  return change > 0
    ? { direction: "up", text: `${change} more than the previous period` }
    : { direction: "down", text: `${-change} fewer than the previous period` };
}

/** "A", "A and B", "A, B and C". */
export function listWords(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function agentNames(clusters: FailureCluster[]): string[] {
  return [...new Set(clusters.flatMap((c) => c.agents.map((a) => a.name)))];
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
