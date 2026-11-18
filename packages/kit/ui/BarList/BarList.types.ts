import type { ComponentPropsWithoutRef, Ref } from "react";

export type BarListSort = "descending" | "ascending" | "none";

export interface BarListDatum {
  /** What the row is. Labels are the row keys, so keep them unique. */
  label: string;
  /** Zero or more. The bar is sized against the largest value in `data`. */
  value: number;
  /** Makes the label a link to the item it names. */
  href?: string;
}

/** Native div attributes the kit sets itself. */
type BarListOwnedKeys = "children";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface BarListProps extends Omit<ComponentPropsWithoutRef<"div">, BarListOwnedKeys> {
  data: BarListDatum[];
  /** Order shown. `descending` puts the largest first; `none` keeps the order of `data`. */
  sort?: BarListSort;
  /** Rows shown before Show all. Without it every row shows. */
  maxRows?: number;
  /** Value text, like a currency or a percent. Defaults to the chart format (1,240 · 12.4k · 1.2M). */
  valueFormatter?: (value: number) => string;
  /** Names the list for screen readers, like Top pages by views. */
  label?: string;
  ref?: Ref<HTMLDivElement>;
}
