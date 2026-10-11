import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";
import type { ChartDatum, ChartSeries } from "../shared/chartMath";

export type BarChartOrientation = "vertical" | "horizontal";

/** `ref`, `className` and other attributes land on the root `<figure>` (not the SVG). `title` is the chart heading. */
export interface BarChartProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  data?: ChartDatum[];
  categories?: string[];
  series?: ChartSeries[];
  title?: string;
  description?: string;
  orientation?: BarChartOrientation;
  height?: number;
  showGrid?: boolean;
  showTable?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  className?: string;
  ref?: Ref<HTMLElement>;
}
