import type { ComponentPropsWithoutRef, Ref } from "react";

export type CountIntent = "info" | "danger" | "neutral";
export type CountSize = "sm" | "md" | "lg";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type CountOwnedKeys = "children" | "aria-disabled";

/** `ref`, `className` and other native attributes land on the root `<span>`. */
export interface CountProps extends Omit<ComponentPropsWithoutRef<"span">, CountOwnedKeys> {
  count: number;
  intent?: CountIntent;
  size?: CountSize;
  subtle?: boolean;
  disabled?: boolean;
  max?: number;
  label?: string;
  ref?: Ref<HTMLSpanElement>;
}
