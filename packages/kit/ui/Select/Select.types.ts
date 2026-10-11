import type { ComponentPropsWithoutRef, Ref } from "react";

export type SelectSize = "sm" | "md";
export type SelectItemCheck = "check" | "checkbox";
export type SelectValueDisplay = "text" | "tags";

export interface SelectOption {
  value: string;
  label: string;
}

/** Native button attributes the kit sets itself (or replaces with its own prop). */
type SelectOwnedKeys =
  | "children"
  | "type"
  | "value"
  | "defaultValue"
  | "onChange"
  | "onClick"
  | "aria-label"
  | "aria-invalid"
  | "aria-describedby"
  | "aria-haspopup"
  | "aria-expanded"
  | "aria-controls";

/**
 * `ref` and other native attributes go to the trigger `<button>`; `className` goes to the root wrapper.
 * `name` stays on the hidden form input.
 */
export interface SelectProps extends Omit<ComponentPropsWithoutRef<"button">, SelectOwnedKeys> {
  id: string;
  size?: SelectSize;
  options: SelectOption[];
  disabled?: boolean;
  error?: boolean;
  multiple?: boolean;
  itemCheck?: SelectItemCheck;
  maxVisible?: number;
  valueDisplay?: SelectValueDisplay;
  searchable?: boolean;
  placeholder?: string;
  defaultValue?: string | string[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  name?: string;
  ariaLabel?: string;
  describedBy?: string;
  ref?: Ref<HTMLButtonElement>;
}
