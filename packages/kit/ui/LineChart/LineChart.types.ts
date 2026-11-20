import type { ComponentPropsWithoutRef, Ref, ReactNode } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";
import type { AxisLabelFormatter, ChartDatum, ChartSeries } from "../shared/chartMath";

export type LineChartVariant = "line" | "area";
export type LineChartCurve = "smooth" | "linear";
export type LineChartStack = "none" | "stacked" | "percent";

/** A series; `dashed` draws it as a dashed line with no area fill, for a comparison such as the previous period. */
export interface LineChartSeries extends ChartSeries {
  dashed?: boolean;
}

/** Which points past the reference line get the accent dot. */
export type LineChartReferenceHighlight = "above" | "below";

/** One horizontal reference, like a target or last period's average. */
export interface LineChartReference {
  value: number;
  /** Shown at the line's end and read in the table and point names, e.g. "Target". */
  label: string;
  /** Mark points of solid series above (or below) the line with an accent dot. Not with stack. */
  highlight?: LineChartReferenceHighlight;
}

/** `ref`, `className` and other attributes land on the root `<figure>` (not the SVG). `title` is the chart heading. */
export interface LineChartProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  /** Kit Buttons in the chart header, before the Table toggle, like an icon-only Ask. */
  actions?: ReactNode;
  data?: ChartDatum[];
  labels?: string[];
  series?: LineChartSeries[];
  /** A dashed horizontal line at `value` with its label; the value axis widens to include it. */
  referenceLine?: LineChartReference;
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
