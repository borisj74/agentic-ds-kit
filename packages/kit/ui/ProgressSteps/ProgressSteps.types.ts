import type { ComponentPropsWithoutRef, Ref } from "react";

export type ProgressStepsOrientation = "horizontal" | "vertical";
export type ProgressStepsSize = "sm" | "md";
export type ProgressStepsStatus = "complete" | "current" | "upcoming" | "error";

export interface ProgressStepsItem {
  id: string;
  label: string;
  description?: string;
  status?: ProgressStepsStatus;
  /** Marks a step people may skip. An upcoming optional step gets a dashed marker and the word Optional. */
  optional?: boolean;
}

/** Native nav attributes the kit sets itself (or replaces with its own prop). */
type ProgressStepsOwnedKeys = "children" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<nav>`. */
export interface ProgressStepsProps extends Omit<ComponentPropsWithoutRef<"nav">, ProgressStepsOwnedKeys> {
  steps: ProgressStepsItem[];
  current?: number;
  orientation?: ProgressStepsOrientation;
  size?: ProgressStepsSize;
  ariaLabel?: string;
  /** When set, completed steps become buttons that call this with the step's index and item. Upcoming steps stay inert. */
  onStepClick?: (index: number, step: ProgressStepsItem) => void;
  className?: string;
  ref?: Ref<HTMLElement>;
}
