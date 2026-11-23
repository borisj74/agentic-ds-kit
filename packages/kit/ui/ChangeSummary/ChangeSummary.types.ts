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
  /** One short reason under the values, e.g. "Annual offer brought 18 upgrades". A caption: no trailing period. */
  why?: string;
}

/** How rows are grouped. "sentiment" shows Better, Worse and Steady groups, each with a count. */
export type ChangeGroupBy = "sentiment";

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type ChangeSummaryOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface ChangeSummaryProps extends Omit<ComponentPropsWithoutRef<"section">, ChangeSummaryOwnedKeys> {
  /** Default "What moved". */
  title?: string;
  /** e.g. "Oct → Nov 2026" */
  period?: string;
  items: ChangeItem[];
  /** The headline sentence above the rows, e.g. "Growth came from upgrades; Starter churn doubled." With no items it stands alone (a quiet month). */
  summary?: string;
  /** "sentiment" groups rows into Better, Worse and Steady, each with a count. Default: one flat list. */
  groupBy?: ChangeGroupBy;
  /** An outline Button under the list. */
  onViewAll?: () => void;
  viewAllLabel?: string;
  /** Adds a neutral "Ask in Chat" Button with the MessageCircle icon beside View full report. */
  onAsk?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
