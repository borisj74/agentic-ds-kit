import type { ComponentPropsWithoutRef, Ref } from "react";

export interface UsageCategory {
  id: string;
  label: string;
  value: number;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type UsageMeterOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface UsageMeterProps extends Omit<ComponentPropsWithoutRef<"section">, UsageMeterOwnedKeys> {
  /** e.g. "AI credits · Pro plan" */
  title: string;
  used: number;
  limit: number;
  /** e.g. "credits" */
  unit?: string;
  /** Usage by category, listed with a kit UsageList. */
  categories?: UsageCategory[];
  /** Left of the axis, e.g. "Nov 1". */
  periodStart?: string;
  /** Right of the axis, e.g. "resets Dec 1". */
  resetLabel?: string;
  /** Daily usage, oldest first; drawn with a kit LineChart (area). */
  daily?: number[];
  /** Labels for the daily points; default "1"… */
  dailyLabels?: string[];
  /** Daily cap; drawn as a second series. */
  dailyCap?: number;
  /** Warning from this share of the limit. Default 0.9. */
  warnAt?: number;
  /** Second line of the warning, e.g. "At this pace you hit the limit in ~2 days." */
  paceNote?: string;
  /** The one primary action. */
  onUpgrade?: () => void;
  onViewUsage?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
