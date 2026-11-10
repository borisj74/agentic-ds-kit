import type { ComponentPropsWithoutRef, Ref } from "react";

export interface ContextSegment {
  id: string;
  /** e.g. "System", "Memory", "Tools", "Messages", "Reserved". */
  label: string;
  tokens: number;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type ContextWindowOwnedKeys = "children";

/** `ref`, `className` and other native attributes land on the root element. */
export interface ContextWindowProps extends Omit<ComponentPropsWithoutRef<"section">, ContextWindowOwnedKeys> {
  /** Tokens used. Pass real numbers, not a percent. */
  used: number;
  /** Context size. Without it the card shows "limit unknown". */
  limit?: number;
  /** What uses the space, in display order. */
  segments?: ContextSegment[];
  /** Warning from this share of the limit. Default 0.8. */
  warningAt?: number;
  /** A one-line bar for a header. */
  compact?: boolean;
  /** Default "Context window". */
  label?: string;
  /** Trim oldest: a secondary Button. */
  onTrim?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
