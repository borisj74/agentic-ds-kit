import type { ComponentPropsWithoutRef, Ref } from "react";

export type MeterShape = "bar" | "circle" | "semicircle";
export type MeterSize = "sm" | "md" | "lg";
export type MeterThresholds = "none" | "bar" | "plotArea" | "all";
export type MeterIntent = "info" | "success" | "warning" | "danger";

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type MeterOwnedKeys = "children" | "role" | "aria-label" | "aria-valuemin" | "aria-valuemax" | "aria-valuenow" | "aria-valuetext";

/** `ref`, `className` and other native attributes land on the root `<div role="progressbar">`. */
export interface MeterProps extends Omit<ComponentPropsWithoutRef<"div">, MeterOwnedKeys> {
  value: number | "indeterminate";
  label?: string;
  shape?: MeterShape;
  size?: MeterSize;
  thresholds?: MeterThresholds;
  intent?: MeterIntent;
  referenceLines?: boolean;
  showValue?: boolean;
  datatip?: string;
  ref?: Ref<HTMLDivElement>;
}
