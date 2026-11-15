import type { ComponentPropsWithoutRef, Ref } from "react";

export type EvalResult = "pass" | "fail" | "error";
export type EvalView = "regressions" | "improvements" | "all";
export type EvalStatus = "running" | "done" | "error";

/** Suite-level numbers for one agent version. */
export interface EvalMetrics {
  /** Share of cases that pass, 0–1. */
  passRate: number;
  /** Average cost per case, in `currency`. */
  avgCost: number;
  /** Median latency per case, in milliseconds. */
  p50LatencyMs: number;
}

export interface EvalVersion {
  /** e.g. "v12". */
  label: string;
  metrics: EvalMetrics;
}

/** One version's run of one case. */
export interface EvalCaseRun {
  result: EvalResult;
  output: string;
  /** Grader score, 0–1. */
  score?: number;
  /** Cost of this run, in `currency`. */
  cost?: number;
}

export interface EvalCase {
  id: string;
  name: string;
  tags?: string[];
  dataset?: string;
  input: string;
  baseline: EvalCaseRun;
  candidate: EvalCaseRun;
  graderNote?: string;
  /** Set after Accept as new expected. Counts the regression as reviewed. */
  accepted?: boolean;
  /** Set after Flag case. Counts the regression as reviewed. */
  flagged?: boolean;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type EvalSuiteOwnedKeys = "children" | "title" | "aria-labelledby";

export interface EvalSuiteProps extends Omit<ComponentPropsWithoutRef<"section">, EvalSuiteOwnedKeys> {
  /** Default "Eval run". */
  title?: string;
  baseline: EvalVersion;
  candidate: EvalVersion;
  cases: EvalCase[];
  /** Which cases the table shows. Uncontrolled (default "regressions") when omitted. */
  view?: EvalView;
  onViewChange?: (view: EvalView) => void;
  /** Promote candidate, the one solid primary. Disabled while regressions are unreviewed. */
  onPromote?: () => void;
  onRerun?: () => void;
  onAcceptExpected?: (id: string) => void;
  onFlag?: (id: string) => void;
  status?: EvalStatus;
  /** 0–1 while running. */
  progress?: number;
  errorMessage?: string;
  /** ISO currency for costs. Default "USD". */
  currency?: string;
  ref?: Ref<HTMLElement>;
}
