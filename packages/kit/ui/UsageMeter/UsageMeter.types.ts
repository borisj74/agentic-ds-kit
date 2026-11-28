import type { ComponentPropsWithoutRef, Ref } from "react";

export interface UsageCategory {
  id: string;
  label: string;
  value: number;
}

/** What usage past the limit costs. Pre-formatted: currency stays with the caller. */
export interface UsageOverage {
  /** e.g. "$4.00 per 100 credits". */
  rateLabel: string;
  /** Billed so far, e.g. "$49.60". */
  amount: string;
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
  /** Daily usage, oldest first; drawn as kit BarChart bars. */
  daily?: number[];
  /** Labels for the daily points; default "1"… */
  dailyLabels?: string[];
  /** Daily cap: days from warnAt of it take the soft warning tone, days over it the soft danger tone. */
  dailyCap?: number;
  /** Warning from this share of the limit. Default 0.8, the same as UsageList. */
  warnAt?: number;
  /** Second line of the warning, e.g. "At this pace you hit the limit in ~2 days." */
  paceNote?: string;
  /** Usage past the limit keeps running and is billed: the rate and the amount so far, said in the warning and the meter's name. */
  overage?: UsageOverage;
  /**
   * One block for a settings page: title, badge and Upgrade on one line, then "used of limit · reset · pace",
   * the meter and the categories in a row. No figure, axis, daily bars or Alert. Spans its container; under
   * 40rem the categories drop and Upgrade goes full width below the meter.
   */
  compact?: boolean;
  /** The one primary action. */
  onUpgrade?: () => void;
  /** Upgrade button label. Default "Upgrade plan". */
  upgradeLabel?: string;
  onViewUsage?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
