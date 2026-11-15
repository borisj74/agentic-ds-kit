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

/** The trend in words, last bucket against the one before: "3× vs previous", "40% down", "Steady". */
export function trendWords(trend: number[]): { direction: TrendDirection; text: string } {
  if (trend.length < 2) return { direction: "flat", text: "Not enough data" };
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  if (prev === 0 && last === 0) return { direction: "flat", text: "None lately" };
  if (prev === 0) return { direction: "new", text: "New this period" };
  if (last === 0) return { direction: "down", text: "None this period" };
  const ratio = last / prev;
  if (ratio >= 2) return { direction: "up", text: `${Math.round(ratio * 10) / 10}× vs previous` };
  const change = Math.round((ratio - 1) * 100);
  if (Math.abs(change) < 10) return { direction: "flat", text: "Steady" };
  return change > 0 ? { direction: "up", text: `Up ${change}% vs previous` } : { direction: "down", text: `Down ${-change}% vs previous` };
}

export function agentNames(clusters: FailureCluster[]): string[] {
  return [...new Set(clusters.flatMap((c) => c.agents.map((a) => a.name)))];
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
