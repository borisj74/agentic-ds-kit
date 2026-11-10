import type { ComponentPropsWithoutRef, Ref } from "react";

export type ChangeDirection = "up" | "down" | "flat";
export type ChangeSentiment = "good" | "bad" | "neutral";

export interface ChangeItem {
  id: string;
  /** e.g. "MRR" */
  label: string;
  /** Formatted value at the start of the period, e.g. "$48.2K". */
  before: string;
  /** Formatted value at the end, e.g. "$52.9K". */
  after: string;
  /** Formatted change, e.g. "+9.8%", "−5", "0 pts". */
  delta: string;
  direction: ChangeDirection;
  /** Whether this move is good for the business. Set per metric (churn down is good). Default neutral. */
  sentiment?: ChangeSentiment;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type ChangeSummaryOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface ChangeSummaryProps extends Omit<ComponentPropsWithoutRef<"section">, ChangeSummaryOwnedKeys> {
  /** Default "What moved". */
  title?: string;
  /** e.g. "Oct → Nov 2026" */
  period?: string;
  items: ChangeItem[];
  /** A link-style button under the list. */
  onViewAll?: () => void;
  viewAllLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
