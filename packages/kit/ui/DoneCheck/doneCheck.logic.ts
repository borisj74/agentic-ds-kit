import type { DoneCriterion, DoneCriterionStatus } from "./DoneCheck.types";

/** Pure helpers behind DoneCheck. No React here. */

export type DoneVerdictTone = "success" | "warning" | "danger" | "neutral";

export const STATUS_LABEL: Record<DoneCriterionStatus, string> = {
  met: "Met",
  not_met: "Not met",
  unverified: "Unverified",
  checking: "Checking",
};

const ORDER: Record<DoneCriterionStatus, number> = { not_met: 0, unverified: 1, checking: 2, met: 3 };

/** Not met first, then unverified, checking, met. Stable within a status. */
export function sortCriteria(criteria: DoneCriterion[]): DoneCriterion[] {
  return criteria
    .map((item, index) => ({ item, index }))
    .sort((a, b) => ORDER[a.item.status] - ORDER[b.item.status] || a.index - b.index)
    .map(({ item }) => item);
}

/** Only "met" counts. Unverified never does. */
export function metCount(criteria: DoneCriterion[]): number {
  return criteria.filter((c) => c.status === "met").length;
}

export function allMet(criteria: DoneCriterion[]): boolean {
  return criteria.length > 0 && metCount(criteria) === criteria.length;
}

/** The header Badge: "All met", "2 of 5 met", "Needs review" or "Checking". */
export function verdict(criteria: DoneCriterion[]): { label: string; tone: DoneVerdictTone } {
  const total = criteria.length;
  const met = metCount(criteria);
  if (total === 0) return { label: "No checks", tone: "neutral" };
  if (met === total) return { label: "All met", tone: "success" };
  if (criteria.some((c) => c.status === "not_met")) return { label: `${met} of ${total} met`, tone: "danger" };
  if (criteria.some((c) => c.status === "unverified")) return { label: "Needs review", tone: "warning" };
  return { label: "Checking", tone: "neutral" };
}

/** Met over total as 0–100 for the Progress. */
export function metPercent(criteria: DoneCriterion[]): number {
  return criteria.length === 0 ? 0 : Math.round((metCount(criteria) / criteria.length) * 100);
}
