import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";
import type { AxisLabelFormatter, ChartDatum, ChartSeries } from "../shared/chartMath";

export type LineChartVariant = "line" | "area";
export type LineChartCurve = "smooth" | "linear";
export type LineChartStack = "none" | "stacked" | "percent";

/** `ref`, `className` and other attributes land on the root `<figure>` (not the SVG). `title` is the chart heading. */
export interface LineChartProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  data?: ChartDatum[];
  labels?: string[];
  series?: ChartSeries[];
  title?: string;
  description?: string;
  variant?: LineChartVariant;
  /**
   * Only with `variant="area"`. `stacked` piles the series as bands so the top edge is the total;
   * `percent` scales each column to 100% to show each series' share. Missing or negative values count
   * as 0. Ignored (with a development warning) for `variant="line"`. Default "none".
   */
  stack?: LineChartStack;
  /** "smooth" (default) rounds the line through every point without overshooting it (monotone); "linear" draws straight segments. */
  curve?: LineChartCurve;
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
