import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, Ref } from "react";

export type InputSize = "sm" | "md" | "lg";
export type InputType = "text" | "email" | "password" | "search";

/** Native input attributes the kit sets itself (or replaces with its own prop). */
type InputOwnedKeys =
  | "children"
  | "size"
  | "type"
  | "onChange"
  | "aria-invalid"
  | "aria-label"
  | "aria-describedby";

/** `ref` and other native attributes go to the `<input>`; `className` goes to the field shell. */
export interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, InputOwnedKeys> {
  id: string;
  type?: InputType;
  size?: InputSize;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  start?: string;
  end?: string;
  iconStart?: KitIcon;
  iconEnd?: KitIcon;
  demo?: "hover" | "focus";
  describedBy?: string;
  ariaLabel?: string;
  ref?: Ref<HTMLInputElement>;
}
