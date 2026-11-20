import type { ComponentPropsWithoutRef, Ref, ReactNode } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";

export type ScatterChartSize = "fixed" | "value";

export interface ScatterChartDatum {
  id: string;
  /** What the dot is, like an account name. */
  label: string;
  x: number;
  y: number;
  /** Colours the dot by group; two or more groups add a legend. */
  group?: string;
  /** The third value, read when `size="value"`. */
  size?: number;
}

export interface ScatterChartFormatters {
  x?: (value: number) => string;
  y?: (value: number) => string;
  size?: (value: number) => string;
}

/** `ref`, `className` and other attributes land on the root `<figure>`. */
export interface ScatterChartProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  /** Kit Buttons in the chart header, before the Table toggle, like an icon-only Ask. */
  actions?: ReactNode;
  data: ScatterChartDatum[];
  /** Names the horizontal measure, like Monthly revenue. */
  xLabel: string;
  /** Names the vertical measure, like Support tickets. */
  yLabel: string;
  /** `fixed` (default): every dot the same size. `value`: sized by each row's `size`, by area. */
  size?: ScatterChartSize;
  /** Names the size value in the tooltip and table. Default "Size". */
  sizeLabel?: string;
  valueFormatter?: ScatterChartFormatters;
  title?: string;
  description?: string;
  height?: number;
  ref?: Ref<HTMLElement>;
}
