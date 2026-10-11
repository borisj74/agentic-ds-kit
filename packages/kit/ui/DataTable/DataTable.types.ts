import type { ComponentPropsWithoutRef, Ref } from "react";
import type { CellSize, CellValue } from "../Cell/Cell.types";

export type DataTableColumnType = "text" | "number";

export type DataTableSort = "asc" | "desc";

export interface DataTableColumn {
  key: string;
  header: string;
  type?: DataTableColumnType;
  sortable?: boolean;
}

export interface DataTableFilter {
  key: string;
  label: string;
}

export type DataTableBulkActionVariant = "secondary" | "tertiary" | "danger";

export interface DataTableBulkAction {
  id: string;
  label: string;
  variant?: DataTableBulkActionVariant;
  iconStart?: string;
  onClick: (ids: string[]) => void;
}

export type DataTableCell = string | number | CellValue;

export type DataTableRow = Record<string, DataTableCell>;

/** Root attributes the kit sets itself. */
type DataTableOwnedKeys = "children" | "data-size";

/** `ref`, `className` and other attributes land on the root `<div>` (toolbar + table). */
export interface DataTableProps extends Omit<ComponentPropsWithoutRef<"div">, DataTableOwnedKeys> {
  caption?: string;
  selectable?: boolean;
  toolbar?: boolean;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  columnSettings?: boolean;
  cellSize?: CellSize;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  emptyMessage?: string;
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: DataTableBulkAction[];
  ref?: Ref<HTMLDivElement>;
}
