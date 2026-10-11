import type { ComponentPropsWithoutRef, Ref } from "react";

export type CheckboxSize = "sm" | "md" | "lg";

/** Native input attributes the kit sets itself (or replaces with its own prop). */
type CheckboxOwnedKeys =
  | "children"
  | "type"
  | "size"
  | "onChange"
  | "aria-label"
  | "aria-invalid"
  | "aria-describedby"
  | "aria-checked";

/** `ref` and other native attributes go to the `<input type="checkbox">`; `className` goes to the `<label>` root. */
export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, CheckboxOwnedKeys> {
  id: string;
  label?: string;
  ariaLabel?: string;
  size?: CheckboxSize;
  disabled?: boolean;
  error?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  describedBy?: string;
  ref?: Ref<HTMLInputElement>;
}
