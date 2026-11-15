import type { ComponentPropsWithoutRef, Ref } from "react";

export type AssumptionStatus = "open" | "confirmed" | "corrected";
export type AssumptionFilter = "open" | "confirmed" | "corrected" | "all";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface Assumption {
  id: string;
  /** The guess in one sentence, e.g. "Prices are in EUR". */
  text: string;
  /** How sure the agent is, 0–1. Below 0.5 is Low, below 0.8 Medium, else High. */
  confidence: number;
  /** Where the guess came from, e.g. "file", "earlier chat", "default". A kit Tag. */
  source?: string;
  /** Steps that depend on it. "used in n steps" opens them in a Popover. */
  steps?: string[];
  status: AssumptionStatus;
  /** The person's fix when status is "corrected". */
  correction?: string;
}

/** Native article attributes the kit sets itself (the root is a kit Card, or a one-line section when compact). */
type AssumptionLogOwnedKeys = "children" | "title" | "aria-labelledby";

export interface AssumptionLogProps extends Omit<ComponentPropsWithoutRef<"article">, AssumptionLogOwnedKeys> {
  items: Assumption[];
  /** Card title. Default "Assumptions". */
  title?: string;
  /** Which rows show. Uncontrolled (default "open") when omitted. */
  filter?: AssumptionFilter;
  onFilterChange?: (filter: AssumptionFilter) => void;
  onConfirm?: (id: string) => void;
  /** Save on a Correct row: the new text. */
  onCorrect?: (id: string, correction: string) => void;
  /** One line for a run header: open count plus the weakest open assumption. */
  compact?: boolean;
  ref?: Ref<HTMLElement>;
}
