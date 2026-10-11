import type { ComponentPropsWithoutRef, Ref } from "react";
import type { SelectOption } from "../Select/Select.types";

export type DataGridColumnType = "text" | "select" | "date";
export type DataGridSize = "sm" | "md";

export interface DataGridColumn {
  key: string;
  header: string;
  type?: DataGridColumnType;
  options?: SelectOption[];
  placeholder?: string;
  width?: string;
}

export type DataGridRow = { id: string } & Record<string, string>;

/** Root attributes the kit sets itself. */
type DataGridOwnedKeys = "children" | "data-size";

/** `ref`, `className` and other attributes land on the root `<div>`. The scroll region and grid inside stay kit-owned. */
export interface DataGridProps extends Omit<ComponentPropsWithoutRef<"div">, DataGridOwnedKeys> {
  columns: DataGridColumn[];
  rows?: DataGridRow[];
  defaultRows?: DataGridRow[];
  onRowsChange?: (rows: DataGridRow[]) => void;
  label?: string;
  size?: DataGridSize;
  canAddRows?: boolean;
  canRemoveRows?: boolean;
  emptyLabel?: string;
  rowNumbers?: boolean;
  stickyFirstColumn?: boolean;
  ref?: Ref<HTMLDivElement>;
}
