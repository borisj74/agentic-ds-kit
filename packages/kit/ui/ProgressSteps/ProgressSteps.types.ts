import type { ComponentPropsWithoutRef, Ref } from "react";

export type ProgressStepsOrientation = "horizontal" | "vertical";
export type ProgressStepsSize = "sm" | "md";
export type ProgressStepsStatus = "complete" | "current" | "upcoming" | "error";

export interface ProgressStepsItem {
  id: string;
  label: string;
  description?: string;
  status?: ProgressStepsStatus;
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
  className?: string;
  ref?: Ref<HTMLElement>;
}
