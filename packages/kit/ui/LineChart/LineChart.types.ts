import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";
import type { AxisLabelFormatter, ChartDatum, ChartSeries } from "../shared/chartMath";

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
  /** Draw every Nth axis label (1 = all). With neither this nor `formatLabel`, labels thin out automatically only when they would overlap. */
  tickInterval?: number;
  /** Text drawn for each axis label; return "" to hide one (turns off automatic thinning). The data table and accessible names keep the raw label. */
  formatLabel?: AxisLabelFormatter;
  /** Lines draw in and area fills fade in after when the chart first appears. Off under reduced motion. Default false. */
  animate?: boolean;
  className?: string;
  ref?: Ref<HTMLElement>;
}
