import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type FieldLabelPosition = "top" | "start";

/** Native div attributes the kit sets itself. */
type FieldOwnedKeys = "children" | "role";

/** Field wraps a control rather than being one: `ref`, `className` and other attributes all land on the root `<div>`. */
export interface FieldProps extends Omit<ComponentPropsWithoutRef<"div">, FieldOwnedKeys> {
  label: string;
  htmlFor: string;
  hint?: string;
  help?: string;
  /** Name of the help button shown with `help`. Default "Help"; set it to translate. */
  helpLabel?: string;
  /** Error text under the hint, with a CircleX icon. Wins over `success`. */
  error?: string;
  /** Confirmation text under the hint, with a CircleCheck icon. Hidden while `error` is set. */
  success?: string;
  /** Adds the muted word "Optional" (KitLabels `optional`) after the label. Use it on the rarer kind of field. */
  optional?: boolean;
  /** Sets aria-required on controls that take it. No asterisk. */
  required?: boolean;
  labelPosition?: FieldLabelPosition;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}
