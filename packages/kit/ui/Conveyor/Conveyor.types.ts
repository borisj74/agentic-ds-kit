import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type ConveyorOrientation = "horizontal" | "vertical";

/**
 * `ref`, `className` and other attributes land on the outer root `<div>`. The scrolling track inside
 * (`role="group"`, `aria-label` from `label`, arrow keys) stays kit-owned.
 */
export interface ConveyorProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  children: ReactNode;
  orientation?: ConveyorOrientation;
  step?: number;
  label?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}
