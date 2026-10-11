import type { ComponentPropsWithoutRef, Ref } from "react";

export type ThinkingAnimationSize = "sm" | "md" | "lg";

/** Root attributes the kit sets itself. */
type ThinkingAnimationOwnedKeys = "children" | "role" | "aria-label" | "aria-live";

/** `ref`, `className` and other attributes land on the root `<span>`. */
export interface ThinkingAnimationProps extends Omit<ComponentPropsWithoutRef<"span">, ThinkingAnimationOwnedKeys> {
  label?: string;
  size?: ThinkingAnimationSize;
  showLabel?: boolean;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}
