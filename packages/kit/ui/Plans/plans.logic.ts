import type { PlansFaq, PlansInterval } from "./Plans.types";

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
