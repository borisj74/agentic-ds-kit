import type { Assumption, AssumptionFilter, ConfidenceLevel } from "./AssumptionLog.types";

/** Pure helpers behind AssumptionLog. No React here. */

export const LEVEL_LABEL: Record<ConfidenceLevel, string> = { low: "Low", medium: "Medium", high: "High" };

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/** 0–1 confidence as a word: below 0.5 Low, below 0.8 Medium, else High. */
export function confidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence < 0.5) return "low";
  if (confidence < 0.8) return "medium";
  return "high";
}

export function openCount(items: Assumption[]): number {
  return items.filter((item) => item.status === "open").length;
}

/** Open rows first, weakest first; then the rest in their given order. */
export function sortAssumptions(items: Assumption[]): Assumption[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ao = a.item.status === "open" ? 0 : 1;
      const bo = b.item.status === "open" ? 0 : 1;
      if (ao !== bo) return ao - bo;
      if (ao === 0 && a.item.confidence !== b.item.confidence) return a.item.confidence - b.item.confidence;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

export function filterAssumptions(items: Assumption[], filter: AssumptionFilter): Assumption[] {
  return filter === "all" ? items : items.filter((item) => item.status === filter);
}

/** The open assumption with the lowest confidence, or undefined. */
export function weakestOpen(items: Assumption[]): Assumption | undefined {
  return sortAssumptions(items).find((item) => item.status === "open");
}

/** Empty-state title per filter. */
export function emptyTitle(filter: AssumptionFilter): string {
  if (filter === "open") return "Nothing left to check";
  if (filter === "confirmed") return "No confirmed assumptions yet";
  if (filter === "corrected") return "No corrections yet";
  return "The agent made no assumptions";
}
