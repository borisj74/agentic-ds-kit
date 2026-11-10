import type { ComponentPropsWithoutRef, Ref } from "react";

export type ExperimentStatus = "draft" | "running" | "concluded" | "stopped";

export interface ExperimentVariant {
  id: string;
  /** e.g. "Checkout v2" */
  label: string;
  /** Share of traffic in percent, e.g. 50. */
  traffic: number;
  /** Formatted metric value, e.g. "4.6%". Omit before the experiment starts ("—"). */
  value?: string;
  /** Concluded with this variant ahead at the target confidence. */
  isWinner?: boolean;
  /** Ahead while running (not yet significant). */
  isLeading?: boolean;
}

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type ExperimentCardOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<article>`. */
export interface ExperimentCardProps extends Omit<ComponentPropsWithoutRef<"article">, ExperimentCardOwnedKeys> {
  /** e.g. "Checkout button copy" */
  name: string;
  /** e.g. "Conversion rate" */
  metricLabel: string;
  status: ExperimentStatus;
  variants: ExperimentVariant[];
  /** Right of the metric label, e.g. "Started 02 Nov · ends 16 Nov", "Ran 02 – 16 Nov", "Not started". */
  dates?: string;
  /** e.g. "84% confidence · needs ~4 more days for 95%." */
  confidenceNote?: string;
  onView?: () => void;
  /** Ship the winner. Confirms with a kit AlertDialog first. The one solid primary. */
  onShip?: (variantId: string) => void;
  /** Stop a running experiment. Confirms with a kit AlertDialog first. */
  onStop?: () => void;
  /** Start a draft. */
  onStart?: () => void;
  /** Edit a draft. */
  onEdit?: () => void;
  /** Extend a concluded experiment that has no winner. */
  onExtend?: () => void;
  extendLabel?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
