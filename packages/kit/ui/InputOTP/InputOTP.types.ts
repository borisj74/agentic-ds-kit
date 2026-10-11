import type { ComponentPropsWithoutRef, Ref } from "react";

export type InputOTPSize = "sm" | "md" | "lg";
export type InputOTPPattern = "digits" | "alphanumeric";

/** Native input attributes the kit sets itself (or replaces with its own prop). */
type InputOTPOwnedKeys =
  | "children"
  | "size"
  | "pattern"
  | "value"
  | "defaultValue"
  | "onChange"
  | "onPaste"
  | "maxLength"
  | "inputMode"
  | "autoCapitalize"
  | "spellCheck"
  | "aria-invalid"
  | "aria-label";

/** `ref` and other native attributes go to the single hidden `<input>`; `className` goes to the slot row root. */
export interface InputOTPProps extends Omit<ComponentPropsWithoutRef<"input">, InputOTPOwnedKeys> {
  id: string;
  length?: number;
  groups?: number[];
  size?: InputOTPSize;
  disabled?: boolean;
  error?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  pattern?: InputOTPPattern;
  name?: string;
  autoComplete?: string;
  ariaLabel?: string;
  ref?: Ref<HTMLInputElement>;
}
