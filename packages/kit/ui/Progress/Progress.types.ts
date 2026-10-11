import type { ComponentPropsWithoutRef, Ref } from "react";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressValuePosition = "overlay" | "end";
export type ProgressTone = "brand" | "warning" | "danger" | "muted";
export type ProgressShape = "bar" | "circle" | "semicircle";

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type ProgressOwnedKeys = "children";

/** `ref`, `className` and other native attributes land on the root `<div>`. The progressbar role and its aria-* sit on the inner track or ring and stay the kit's. */
export interface ProgressProps extends Omit<ComponentPropsWithoutRef<"div">, ProgressOwnedKeys> {
  value?: number;
  size?: ProgressSize;
  shape?: ProgressShape;
  label?: string;
  showValue?: boolean;
  valuePosition?: ProgressValuePosition;
  tone?: ProgressTone;
  ariaLabel?: string;
  ref?: Ref<HTMLDivElement>;
}
