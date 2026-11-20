import type { ComponentPropsWithoutRef, Ref, ReactNode } from "react";
import type { ChartFrameOwnedKeys } from "../shared/ChartFrame";

export interface HeatmapDatum {
  /** One of `rows`. */
  row: string;
  /** One of `columns`. */
  column: string;
  /** Zero or more. Shaded against the largest value in `data`. */
  value: number;
}

/** `ref`, `className` and other attributes land on the root `<figure>`. */
export interface HeatmapProps extends Omit<ComponentPropsWithoutRef<"figure">, ChartFrameOwnedKeys> {
  /** Kit Buttons in the chart header, before the Table toggle, like an icon-only Ask. */
  actions?: ReactNode;
  /** Row labels, top to bottom, like Mon to Sun. */
  rows: string[];
  /** Column labels, start to end, like 00 to 23. */
  columns: string[];
  /** One entry per cell with a value. Cells without an entry show as empty. */
  data: HeatmapDatum[];
  /** Tooltip, legend and table text. Defaults to the chart format (1,240 · 12.4k · 1.2M). */
  valueFormatter?: (value: number) => string;
  title?: string;
  description?: string;
  ref?: Ref<HTMLElement>;
}
