import type { ComponentPropsWithoutRef, Ref } from "react";

export type FailureClusterStatus = "new" | "known" | "fixed" | "regressed";

export interface FailureAgent {
  name: string;
  src?: string;
}

/** One failed run in a cluster. */
export interface FailureRun {
  id: string;
  /** Run label, e.g. "run_913". */
  label: string;
  href?: string;
  agent: string;
  /** When, as shown, e.g. "14:02". */
  when: string;
  /** The step that failed, e.g. "stripe.refunds.create". */
  step: string;
}

/** A sample failing tool call, shown in a ToolCallCard opened to its error. */
export interface FailureSample {
  name: string;
  summary?: string;
  args?: unknown;
  error: string | string[];
  duration?: string;
}

export interface FailureCluster {
  id: string;
  /** Short likely cause, e.g. "Stripe 429 rate limit". */
  title: string;
  status: FailureClusterStatus;
  /** Failed runs in the window. */
  count: number;
  agents: FailureAgent[];
  /** Failures per time bucket, oldest first. */
  trend: number[];
  /** Labels for the trend buckets (LineChart axis). */
  trendLabels?: string[];
  firstSeen: string;
  lastSeen: string;
  sample: FailureSample;
  runs: FailureRun[];
  /** Set while muted, e.g. "until 14:02 tomorrow". */
  mutedUntil?: string;
}

export interface FailureFilters {
  /** Time window label, e.g. "Last 24 hours". The caller passes the clusters for that window. */
  time?: string;
  agent?: string;
  status?: FailureClusterStatus;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type FailureClustersOwnedKeys = "children" | "title" | "aria-labelledby" | "onSelect";

export interface FailureClustersProps extends Omit<ComponentPropsWithoutRef<"section">, FailureClustersOwnedKeys> {
  clusters: FailureCluster[];
  /** Default "Failures". */
  title?: string;
  /** Selected cluster. Uncontrolled (largest first) when omitted. */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Uncontrolled when omitted. */
  filters?: FailureFilters;
  onFiltersChange?: (filters: FailureFilters) => void;
  /** Default ["Last hour", "Last 24 hours", "Last 7 days"]. */
  timeOptions?: string[];
  onMarkKnown?: (id: string) => void;
  onMute?: (id: string) => void;
  onOpenIssue?: (id: string) => void;
  ref?: Ref<HTMLElement>;
}
