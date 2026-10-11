import type { ComponentPropsWithoutRef, Ref } from "react";

export type LoadingAnimationSize = "sm" | "md" | "lg";
export type LoadingAnimationVariant = "grid";

/** Root attributes the kit sets itself. */
type LoadingAnimationOwnedKeys = "children" | "role" | "aria-label" | "aria-live";

/** `ref`, `className` and other attributes land on the root `<span>`. */
export interface LoadingAnimationProps extends Omit<ComponentPropsWithoutRef<"span">, LoadingAnimationOwnedKeys> {
  label?: string;
  size?: LoadingAnimationSize;
  variant?: LoadingAnimationVariant;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}
