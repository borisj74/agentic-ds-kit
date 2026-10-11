import type { ComponentPropsWithoutRef, CSSProperties, ReactNode, Ref } from "react";

export type ShimmerTextSize = "sm" | "md" | "lg";
export type ShimmerTextSpeed = number | "slow" | "normal" | "fast";

/** Root attributes the kit sets itself. */
type ShimmerTextOwnedKeys = "aria-label";

/** `ref`, `className` and other attributes land on the root `<span>`. */
export interface ShimmerTextProps extends Omit<ComponentPropsWithoutRef<"span">, ShimmerTextOwnedKeys> {
  children: ReactNode;
  size?: ShimmerTextSize;
  speed?: ShimmerTextSpeed;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
  style?: CSSProperties;
}
