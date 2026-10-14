import type { ComponentPropsWithoutRef, Ref } from "react";

export type HeaderCellSize = "sm" | "md";
export type HeaderCellAlign = "start" | "end" | "center";
export type HeaderCellSort = "asc" | "desc";

/** Root attributes the kit sets itself. `id` is the kit's prop for the select-all checkbox. */
type HeaderCellOwnedKeys = "children" | "id";

/** `ref`, `className` and other attributes land on the root `<span>`; `id` goes to the checkbox. */
export interface HeaderCellProps extends Omit<ComponentPropsWithoutRef<"span">, HeaderCellOwnedKeys> {
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
  /** Let the label wrap onto more lines (DataTable sets it for `wrap` columns). The sort icon stays with the last word. */
  wrap?: boolean;
  id?: string;
  ref?: Ref<HTMLSpanElement>;
}
