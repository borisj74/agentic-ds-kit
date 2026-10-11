import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** `ref`, `className` and other attributes (e.g. `disabled`, `form`) all land on the root `<fieldset>`. */
export interface FieldSetProps extends Omit<ComponentPropsWithoutRef<"fieldset">, "children"> {
  legend: string;
  description?: string;
  children: ReactNode;
  ref?: Ref<HTMLFieldSetElement>;
}
