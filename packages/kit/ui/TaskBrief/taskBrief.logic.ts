import type { TaskBriefValue } from "./TaskBrief.types";

/** Pure helpers behind TaskBrief. No React here. */

export const MAX_CRITERIA = 8;

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/** "Done when" checks with text in them. Blank rows do not count. */
export function filledCriteria(criteria: string[]): string[] {
  return criteria.map((line) => line.trim()).filter(Boolean);
}

/** Start needs a goal and at least one check. */
export function canStart(value: TaskBriefValue): boolean {
  return value.goal.trim().length > 0 && filledCriteria(value.criteria).length > 0;
}

/** What still blocks Start, in words, or "" when nothing does. */
export function startBlocker(value: TaskBriefValue): string {
  const goal = value.goal.trim().length > 0;
  const checks = filledCriteria(value.criteria).length > 0;
  if (!goal && !checks) return "Add a goal and one check to start.";
  if (!goal) return "Add a goal to start.";
  if (!checks) return "Add one check to start.";
  return "";
}

/** Spend cap as money, whole units without decimals: "$5", "$12.50". */
export function formatMoney(amount: number, currency = "USD", locale = "en"): string {
  const whole = Number.isInteger(amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** The limits that are set, in words: ["$5 cap", "30 min", "40 steps"]. */
export function limitParts(value: TaskBriefValue, currency = "USD", locale = "en"): string[] {
  const parts: string[] = [];
  if (value.spendCap != null) parts.push(`${formatMoney(value.spendCap, currency, locale)} cap`);
  if (value.minutes != null) parts.push(`${value.minutes} min`);
  if (value.maxSteps != null) parts.push(plural(value.maxSteps, "step"));
  return parts;
}

/** The started row after the goal: "3 checks · $5 cap · 30 min". */
export function foldSummary(value: TaskBriefValue, currency = "USD", locale = "en"): string {
  return [plural(filledCriteria(value.criteria).length, "check"), ...limitParts(value, currency, locale)].join(" · ");
}

/** Add a blank check row, up to MAX_CRITERIA. */
export function addCriterion(criteria: string[]): string[] {
  return criteria.length >= MAX_CRITERIA ? criteria : [...criteria, ""];
}

/** Remove a check row; one row always stays. */
export function removeCriterion(criteria: string[], index: number): string[] {
  const next = criteria.filter((_, i) => i !== index);
  return next.length > 0 ? next : [""];
}
