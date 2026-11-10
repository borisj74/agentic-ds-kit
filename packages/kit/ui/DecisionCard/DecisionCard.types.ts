import type { ComponentPropsWithoutRef, Ref } from "react";

export type DecisionCardStatus = "pending" | "sending" | "error" | "resolved" | "skipped";

export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  /** Shows a quiet Recommended badge. */
  recommended?: boolean;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type DecisionCardOwnedKeys = "children" | "title" | "aria-labelledby" | "onKeyDown";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface DecisionCardProps extends Omit<ComponentPropsWithoutRef<"section">, DecisionCardOwnedKeys> {
  /** Who asks, e.g. "Billing refactor asks". */
  title: string;
  question: string;
  /** Header note, e.g. "paused · 0:42". */
  meta?: string;
  /** Choices. Without options (or with allowFreeText and no options) the card asks for free text. */
  options?: DecisionOption[];
  allowFreeText?: boolean;
  /** Free-text label and hint. */
  freeTextLabel?: string;
  freeTextHint?: string;
  /** Chosen option id, or the free-text answer. */
  value?: string;
  onValueChange?: (value: string) => void;
  status?: DecisionCardStatus;
  /** Error text for status error. */
  errorMessage?: string;
  /** Resolved / skipped line, e.g. "Keep v1 endpoint for 30 days" or "agent used its default: keep v1". Default: the chosen label. */
  resolvedLabel?: string;
  /** Time on the resolved line, e.g. "14:03". */
  resolvedAt?: string;
  /** Confirm: the one solid primary; ⌘/Ctrl+Enter inside the card. */
  onConfirm?: () => void;
  onSkip?: () => void;
  ref?: Ref<HTMLElement>;
}
