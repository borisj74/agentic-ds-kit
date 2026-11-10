import type { ComponentPropsWithoutRef, Ref } from "react";

export type TraceSpanKind = "model" | "tool" | "wait" | "approval" | "other";
export type TraceStatus = "running" | "complete" | "failed";

export interface TraceSpan {
  id: string;
  label: string;
  kind: TraceSpanKind;
  /** Offset from the run start, in ms. */
  startMs: number;
  /** Offset from the run start, in ms. Missing on a span that still runs. */
  endMs?: number;
  /** Cost in the run currency. */
  cost?: number;
  tokensIn?: number;
  tokensOut?: number;
  failed?: boolean;
  /** Extra detail rows, e.g. [{ label: "Model", value: "Claude Sonnet 5.5" }]. */
  detail?: { label: string; value: string }[];
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type TraceWaterfallOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface TraceWaterfallProps extends Omit<ComponentPropsWithoutRef<"section">, TraceWaterfallOwnedKeys> {
  /** e.g. "Run trace · Billing refactor" */
  title: string;
  spans: TraceSpan[];
  status?: TraceStatus;
  /** Run length in ms. Default: the latest span end (or start for running spans). */
  totalMs?: number;
  /** Default: the sum of span costs. */
  totalCost?: number;
  /** Failed run: why, under the spans. */
  error?: string;
  selectedId?: string | null;
  /** Rows become buttons that open the span detail. */
  onSpanClick?: (id: string | null) => void;
  /** One-line totals bar. */
  compact?: boolean;
  /** Currency symbol. Default "$". */
  currency?: string;
  loading?: boolean;
  loadError?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
