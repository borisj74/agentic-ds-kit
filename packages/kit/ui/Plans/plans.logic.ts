import type { PlansComparisonRow, PlansFaq, PlansInterval, PlansPlan } from "./Plans.types";

/** What one comparison cell says: a check, a dash, or text. `label` is the spoken (and sr) text. */
export type PlansCell =
  | { kind: "yes"; label: string }
  | { kind: "no"; label: string }
  | { kind: "text"; label: string };

export const INCLUDED = "Included";
export const NOT_INCLUDED = "Not included";

/** One cell from a row's value for a plan. Missing, false or empty: not included. */
export function comparisonCell(value: boolean | string | undefined): PlansCell {
  if (value === true) return { kind: "yes", label: INCLUDED };
  if (value === false || value === undefined || value.trim() === "") return { kind: "no", label: NOT_INCLUDED };
  return { kind: "text", label: value };
}

/** Table columns: the feature, then one per plan in plan order. */
export function comparisonColumns(plans: PlansPlan[]) {
  return [
    { key: "feature", header: "Feature", emphasis: true },
    ...plans.map((plan) => ({ key: plan.id, header: plan.recommended && !plan.current ? `${plan.name} (recommended)` : plan.name })),
  ];
}

/** Rows of cells, keyed like the columns. */
export function comparisonGrid(plans: PlansPlan[], rows: PlansComparisonRow[]) {
  return rows.map((row) => ({
    feature: row.feature,
    cells: plans.map((plan) => ({ planId: plan.id, cell: comparisonCell(row.values[plan.id]) })),
  }));
}

/** Kit Accordion needs two or more items; one FAQ is not a list worth folding. */
export function faqItems(faqs: PlansFaq[] | undefined) {
  if (!faqs || faqs.length < 2) return [];
  return faqs.map((faq) => ({ id: faq.id, title: faq.question, content: faq.answer }));
}

/**
 * What the block hands PricingPlans: an interval change (kept inside the block when it is
 * uncontrolled, then reported) and a choice, reported with the interval on screen.
 */
export function plansHandlers(options: {
  interval: PlansInterval;
  setInterval?: (interval: PlansInterval) => void;
  onIntervalChange?: (interval: PlansInterval) => void;
  onChoosePlan?: (planId: string, interval: PlansInterval) => void;
}) {
  return {
    changeInterval(next: PlansInterval) {
      options.setInterval?.(next);
      options.onIntervalChange?.(next);
    },
    choose(planId: string) {
      options.onChoosePlan?.(planId, options.interval);
    },
  };
}
