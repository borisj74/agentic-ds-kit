import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";
import type { ChartDatum, ChartSeries } from "../shared/chartMath";

export type LineChartVariant = "line" | "area";

/** `ref`, `className` and other attributes land on the root `<figure>` (not the SVG). `title` is the chart heading. */
export interface LineChartProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  data?: ChartDatum[];
  labels?: string[];
  series?: ChartSeries[];
  title?: string;
  description?: string;
  variant?: LineChartVariant;
  height?: number;
  showGrid?: boolean;
  showTable?: boolean;
  includeZero?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  className?: string;
  ref?: Ref<HTMLElement>;
}
