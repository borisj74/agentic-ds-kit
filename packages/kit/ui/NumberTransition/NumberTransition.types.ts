import type { ComponentPropsWithoutRef, Ref } from "react";

export type NumberTransitionSize = "sm" | "md" | "lg";

/** Root attributes the kit sets itself. */
type NumberTransitionOwnedKeys = "children" | "aria-label" | "aria-live";

/** `ref`, `className` and other attributes land on the root `<span>`. */
export interface NumberTransitionProps extends Omit<ComponentPropsWithoutRef<"span">, NumberTransitionOwnedKeys> {
  value: number | string;
  format?: (value: number | string) => string;
  size?: NumberTransitionSize;
  label?: string;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}
