import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** stack: legend and description above the fields. side: legend in a left column, stacking under 40rem of FieldSet width. */
export type FieldSetLayout = "stack" | "side";

/** `ref`, `className` and other attributes (e.g. `disabled`, `form`) all land on the root `<fieldset>`. */
export interface FieldSetProps extends Omit<ComponentPropsWithoutRef<"fieldset">, "children"> {
  legend: string;
  description?: string;
  /** Default "stack". "side" puts the legend and description in a fixed left column on a wide settings form. */
  layout?: FieldSetLayout;
  children: ReactNode;
  ref?: Ref<HTMLFieldSetElement>;
}
