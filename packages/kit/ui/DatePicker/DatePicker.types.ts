import type { ComponentPropsWithoutRef, Ref } from "react";

export type DatePickerSize = "sm" | "md";
export type DatePickerMode = "single" | "range";

export interface DatePickerRange {
  start: string;
  end?: string;
}

/** Native button attributes the kit sets itself (or replaces with its own prop). */
type DatePickerOwnedKeys =
  | "children"
  | "type"
  | "value"
  | "defaultValue"
  | "onClick"
  | "aria-haspopup"
  | "aria-expanded"
  | "aria-controls"
  | "aria-invalid"
  | "aria-describedby";

/** `ref` and other native attributes go to the trigger `<button>`; `className` goes to the root wrapper. */
interface DatePickerShared extends Omit<ComponentPropsWithoutRef<"button">, DatePickerOwnedKeys> {
  id: string;
  size?: DatePickerSize;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  minDate?: string;
  maxDate?: string;
  name?: string;
  describedBy?: string;
  ref?: Ref<HTMLButtonElement>;
}

export interface DatePickerSingleProps extends DatePickerShared {
  mode?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
}

export interface DatePickerRangeProps extends DatePickerShared {
  mode: "range";
  value?: DatePickerRange;
  defaultValue?: DatePickerRange;
  onValueChange?: (range: DatePickerRange) => void;
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;
