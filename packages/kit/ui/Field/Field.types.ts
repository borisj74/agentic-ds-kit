import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type FieldLabelPosition = "top" | "start";

/** Native div attributes the kit sets itself. */
type FieldOwnedKeys = "children" | "role";

/** Field wraps a control rather than being one: `ref`, `className` and other attributes all land on the root `<div role="group">`. */
export interface FieldProps extends Omit<ComponentPropsWithoutRef<"div">, FieldOwnedKeys> {
  label: string;
  htmlFor: string;
  hint?: string;
  help?: string;
  error?: string;
  labelPosition?: FieldLabelPosition;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}
