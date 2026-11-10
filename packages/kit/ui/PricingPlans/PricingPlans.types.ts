import type { ComponentPropsWithoutRef, Ref } from "react";

export type PricingInterval = "month" | "year";

export interface PricingPlan {
  id: string;
  name: string;
  /** e.g. "For growing teams" */
  tagline?: string;
  /** Price per unit per month when billed monthly. */
  price: number;
  /** Price per unit per month when billed yearly. Default: same as price. */
  yearlyPrice?: number;
  features: string[];
  /** Button label. Default "Choose <name>". */
  ctaLabel?: string;
  /** The plan to steer toward: its CTA is the one solid primary. */
  recommended?: boolean;
  /** The plan the workspace is on: CTA reads "Current plan" and is disabled. */
  current?: boolean;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type PricingPlansOwnedKeys = "children" | "title" | "aria-labelledby" | "onSelect";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface PricingPlansProps extends Omit<ComponentPropsWithoutRef<"section">, PricingPlansOwnedKeys> {
  plans: PricingPlan[];
  interval: PricingInterval;
  onIntervalChange: (interval: PricingInterval) => void;
  onSelect: (id: string) => void;
  /** Default "Choose a plan". */
  title?: string;
  description?: string;
  /** Next to the interval switch, e.g. "Save 17% with yearly". */
  savingsLabel?: string;
  /** Under the cards, e.g. "Prices exclude tax. Change or cancel any time." */
  footnote?: string;
  /** Default "$". */
  currency?: string;
  /** Default "/ seat / month". */
  unitLabel?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
