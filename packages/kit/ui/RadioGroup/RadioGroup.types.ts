import type { ComponentPropsWithoutRef, Ref } from "react";
import type { BadgeTone } from "../Badge/Badge.types";

export type RadioGroupSize = "sm" | "md" | "lg";
export type RadioGroupOrientation = "vertical" | "horizontal";
export type RadioGroupLayout = "list" | "card";

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  disabled?: boolean;
}

/** Native fieldset attributes the kit sets itself (or replaces with its own prop). */
type RadioGroupOwnedKeys = "children" | "onChange" | "aria-invalid" | "aria-describedby";

/**
 * The group has no single native control, so `ref`, `className` and other attributes all land on the
 * root `<fieldset>`. Each radio's `name` comes from the `name` prop.
 */
export interface RadioGroupProps extends Omit<ComponentPropsWithoutRef<"fieldset">, RadioGroupOwnedKeys> {
  name: string;
  legend: string;
  hideLegend?: boolean;
  size?: RadioGroupSize;
  orientation?: RadioGroupOrientation;
  layout?: RadioGroupLayout;
  options: RadioGroupOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
  ref?: Ref<HTMLFieldSetElement>;
}
