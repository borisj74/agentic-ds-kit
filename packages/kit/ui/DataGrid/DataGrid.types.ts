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

export interface DataGridProps {
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
}
