export type HeaderCellSize = "sm" | "md";
export type HeaderCellAlign = "start" | "end";
export type HeaderCellSort = "asc" | "desc";

export interface HeaderCellProps {
  label?: string;
  size?: HeaderCellSize;
  checkbox?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  align?: HeaderCellAlign;
  sortable?: boolean;
  sort?: HeaderCellSort;
  onSort?: () => void;
  id?: string;
}
