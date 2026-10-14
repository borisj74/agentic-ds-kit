import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, Ref } from "react";
import type { CellSize, CellValue } from "../Cell/Cell.types";

export type DataTableColumnType = "text" | "number";

export type DataTableSort = "asc" | "desc";

export type DataTableSortValue = string | number | Date;

export interface DataTableColumn {
  key: string;
  header: string;
  type?: DataTableColumnType;
  sortable?: boolean;
  /** Value to sort this column by, e.g. the number behind "$1,200.00" or the Date behind "Mar 4". */
  sortValue?: (row: DataTableRow) => DataTableSortValue;
  /** CSS width for the column, e.g. "8rem" or "20%". Drops the default text-column minimum; the column never gets narrower than its content. */
  width?: string;
  /** CSS min-width; replaces the default text-column minimum. */
  minWidth?: string;
  /** Let cell text and the header label wrap so the table fits its container instead of scrolling. */
  wrap?: boolean;
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
  iconStart?: KitIcon;
  onClick: (ids: string[]) => void;
}

export type DataTableCell = string | number | CellValue;

export type DataTableRow = Record<string, DataTableCell>;

/** Root attributes the kit sets itself. */
type DataTableOwnedKeys = "children" | "data-size";

/** `ref`, `className` and other attributes land on the root `<div>` (toolbar + table). */
export interface DataTableProps extends Omit<ComponentPropsWithoutRef<"div">, DataTableOwnedKeys> {
  caption?: string;
  /** Names the table when there is no caption, e.g. the title of the Card around it. */
  ariaLabel?: string;
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
