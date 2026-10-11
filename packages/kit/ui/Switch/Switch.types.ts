import type { ComponentPropsWithoutRef, Ref } from "react";

export type SwitchSize = "sm" | "md" | "lg";

/** Native button attributes the kit sets itself (or replaces with its own prop). */
type SwitchOwnedKeys =
  | "children"
  | "type"
  | "role"
  | "onChange"
  | "onClick"
  | "onAnimationEnd"
  | "aria-checked"
  | "aria-label"
  | "aria-describedby";

/** `ref` and other native attributes go to the `<button role="switch">`; `className` goes to the wrapper root. */
export interface SwitchProps extends Omit<ComponentPropsWithoutRef<"button">, SwitchOwnedKeys> {
  id?: string;
  label?: string;
  ariaLabel?: string;
  size?: SwitchSize;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  describedBy?: string;
  ref?: Ref<HTMLButtonElement>;
}
