import type { ComponentPropsWithoutRef, Ref } from "react";
import type { PricingInterval, PricingPlan } from "../PricingPlans/PricingPlans.types";

/** A plan: same shape as PricingPlans plans. Mark one `recommended`: its CTA is the one solid primary. */
export type PlansPlan = PricingPlan;

/** Billing interval: same as PricingPlans. */
export type PlansInterval = PricingInterval;

/**
 * One row of the feature comparison. `values` is keyed by plan id: `true` reads "Included",
 * `false` (or a missing plan) "Not included", a string is shown as written (e.g. "5 seats").
 */
export interface PlansComparisonRow {
  feature: string;
  values: Record<string, boolean | string>;
}

/** One FAQ entry (a kit Accordion item). */
export interface PlansFaq {
  id: string;
  question: string;
  answer: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type PlansOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface PlansProps extends Omit<ComponentPropsWithoutRef<"section">, PlansOwnedKeys> {
  plans: PlansPlan[];
  /** Controlled interval. */
  interval?: PlansInterval;
  /** Uncontrolled starting interval. Default "month". */
  defaultInterval?: PlansInterval;
  /** The Monthly / Yearly switch changed. */
  onIntervalChange?: (interval: PlansInterval) => void;
  /** A plan's CTA was pressed, with the interval shown at the time. */
  onChoosePlan?: (planId: string, interval: PlansInterval) => void;
  /** Rows of the comparison table. Omit or [] to leave the comparison out. */
  comparison?: PlansComparisonRow[];
  /** FAQ entries. Shown as a kit Accordion when there are two or more. */
  faqs?: PlansFaq[];
  /** Block heading (h2). Default "Pricing". */
  title?: string;
  /** One line under the heading. */
  description?: string;
  /** PricingPlans heading (h3). Default "Choose a plan". */
  plansTitle?: string;
  /** Comparison heading (h3). Default "Compare plans". */
  comparisonTitle?: string;
  /** FAQ heading (h3). Default "Questions". */
  faqTitle?: string;
  /** Passed to PricingPlans, e.g. "Save 17% with yearly". */
  savingsLabel?: string;
  /** Passed to PricingPlans, under the cards. */
  footnote?: string;
  /** Passed to PricingPlans. Default "$". */
  currency?: string;
  /** Passed to PricingPlans. Default "/ seat / month". */
  unitLabel?: string;
  ref?: Ref<HTMLElement>;
}
