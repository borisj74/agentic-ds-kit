import type { GuardrailEvent, GuardrailFilters, GuardrailVerdict } from "./GuardrailLog.types";

/** Pure helpers behind GuardrailLog. No React here. */

export const VERDICT_LABEL: Record<GuardrailVerdict, string> = { blocked: "Blocked", rewritten: "Rewritten", flagged: "Flagged" };
export const VERDICTS: GuardrailVerdict[] = ["blocked", "rewritten", "flagged"];

export function filterEvents(events: GuardrailEvent[], filters: GuardrailFilters = {}): GuardrailEvent[] {
  return events.filter(
    (e) =>
      (!filters.verdict || e.verdict === filters.verdict) &&
      (!filters.rule || e.rule.name === filters.rule) &&
      (!filters.agent || e.agent.name === filters.agent),
  );
}

/** "14 blocked · 3 rewritten · 6 flagged this week". Zero counts are left out. */
export function summaryLine(events: GuardrailEvent[], window?: string): string {
  const parts = VERDICTS.map((v) => ({ v, n: events.filter((e) => e.verdict === v).length }))
    .filter(({ n }) => n > 0)
    .map(({ v, n }) => `${n} ${VERDICT_LABEL[v].toLowerCase()}`);
  if (parts.length === 0) return "No rule fired";
  return `${parts.join(" · ")}${window ? ` ${window.charAt(0).toLowerCase()}${window.slice(1)}` : ""}`;
}

/** Distinct values in first-seen order. */
export function distinct(values: string[]): string[] {
  return [...new Set(values)];
}

export function ruleNames(events: GuardrailEvent[]): string[] {
  return distinct(events.map((e) => e.rule.name));
}

export function agentNames(events: GuardrailEvent[]): string[] {
  return distinct(events.map((e) => e.agent.name));
}
