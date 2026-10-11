import type { ComponentPropsWithoutRef, Ref } from "react";

export type SpinnerSize = "sm" | "md" | "lg";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type SpinnerOwnedKeys = "children" | "role" | "aria-live" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<span>`. */
export interface SpinnerProps extends Omit<ComponentPropsWithoutRef<"span">, SpinnerOwnedKeys> {
  size?: SpinnerSize;
  label?: string;
  ref?: Ref<HTMLSpanElement>;
}
