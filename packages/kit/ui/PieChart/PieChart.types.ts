import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";
import type { ChartDatum } from "../shared/chartMath";

export type PieChartVariant = "donut" | "pie";
export type PieChartLayout = "split" | "stack";

/** `ref`, `className` and other attributes land on the root `<figure>` (not the SVG). `title` is the chart heading. */
export interface PieChartProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  data?: ChartDatum[];
  title?: string;
  description?: string;
  variant?: PieChartVariant;
  layout?: PieChartLayout;
  size?: number;
  maxSegments?: number;
  sort?: boolean;
  otherLabel?: string;
  centerLabel?: string;
  showCenterTotal?: boolean;
  showTable?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  /** Slices sweep in clockwise from 12 o'clock when the chart first appears. Off under reduced motion. Default false. */
  animate?: boolean;
  className?: string;
  ref?: Ref<HTMLElement>;
}
