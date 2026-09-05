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

export interface DataTableProps {
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
}
