import type { ComponentPropsWithoutRef, Ref } from "react";

export type SliderOrientation = "horizontal" | "vertical";

/**
 * A range slider has two thumbs, so there is no single native control: `ref`, `className` and other
 * attributes all land on the root `<div>`. The thumbs (`role="slider"`) stay kit-owned.
 */
export interface SliderProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  value: number | number[];
  min?: number;
  max?: number;
  step?: number;
  orientation?: SliderOrientation;
  disabled?: boolean;
  onValueChange?: (value: number | number[]) => void;
  /** Id(s) of the visible label for each thumb's aria-labelledby. Field passes its label id. */
  labelledBy?: string;
  /** Id(s) for each thumb's aria-describedby. Field passes its hint or error id. */
  describedBy?: string;
  /** Marks each thumb aria-invalid. Field sets it when it has an error. */
  error?: boolean;
  ref?: Ref<HTMLDivElement>;
}
