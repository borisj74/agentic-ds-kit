import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type BarListSort = "descending" | "ascending" | "none";

/** What a bar is measured against: the largest value, or the sum of every value (a share of the whole). */
export type BarListScale = "max" | "total";

export interface BarListDatum {
  /** What the row is. Labels are the row keys, so keep them unique. */
  label: string;
  /** Zero or more. The bar is sized against the largest value in `data`, or their sum with `scale="total"`. */
  value: number;
  /** Makes the label a link to the item it names. */
  href?: string;
  /** The value last period. Adds a change Badge under the value: Up 12.2%, Down 3.8% or No change. */
  previous?: number;
  /** A small icon or avatar before the label, in a 24px tile. Decoration: the label names the row. */
  media?: ReactNode;
  /** A second, muted line under the label, like 1,012 accounts. */
  meta?: string;
}

/** Native div attributes the kit sets itself. */
type BarListOwnedKeys = "children";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface BarListProps extends Omit<ComponentPropsWithoutRef<"div">, BarListOwnedKeys> {
  data: BarListDatum[];
  /** Order shown. `descending` puts the largest first; `none` keeps the order of `data`. */
  sort?: BarListSort;
  /** `max` sizes bars against the largest value. `total` sizes them as a share of the sum and writes the share in the meta line. */
  scale?: BarListScale;
  /** Rows shown before Show all. Without it every row shows. */
  maxRows?: number;
  /** Value text, like a currency or a percent. Defaults to the chart format (1,240 · 12.4k · 1.2M). */
  valueFormatter?: (value: number) => string;
  /** Names the list for screen readers, like Top pages by views. */
  label?: string;
  ref?: Ref<HTMLDivElement>;
}
