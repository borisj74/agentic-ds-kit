import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";

export type ComboChartAxis = "shared" | "dual";

/** One category: its label plus one number per series key. */
export interface ComboChartDatum {
  label: string;
  [key: string]: string | number | undefined;
}

export interface ComboChartSeries {
  /** The data field this series reads. */
  key: string;
  /** Shown in the legend, the tooltip and the table. */
  label: string;
}

export interface ComboChartFormatters {
  /** Bar values and the left axis. */
  bars?: (value: number) => string;
  /** Line values and, with `axis="dual"`, the right axis. */
  line?: (value: number) => string;
}

/** `ref`, `className` and other attributes land on the root `<figure>`. */
export interface ComboChartProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  data: ComboChartDatum[];
  /** One to three bar series. */
  bars: ComboChartSeries[];
  /** One line series. */
  line: ComboChartSeries;
  /** `shared`: one left axis. `dual`: the line gets its own axis on the right. */
  axis?: ComboChartAxis;
  valueFormatter?: ComboChartFormatters;
  title?: string;
  description?: string;
  height?: number;
  ref?: Ref<HTMLElement>;
}
