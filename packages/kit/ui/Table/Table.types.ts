import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { CellAction } from "../Cell/Cell.types";
import type { SortValue } from "../shared/sort";

export type TableSize = "sm" | "md" | "lg";
export type TableAlign = "start" | "end";
export type TableState = "loading" | "empty" | "error";
export type TableSortValue = SortValue;
export type TableRow = Record<string, string | number | ReactNode>;
export type TableRowAction = CellAction;

export interface TableColumn {
  key: string;
  header: string;
  align?: TableAlign;
  numeric?: boolean;
  emphasis?: boolean;
  /** The header becomes a sort button: ascending, descending, then off. Local state only. */
  sortable?: boolean;
  /** Value to sort this column by, e.g. the number behind "$1,200.00" or the Date behind "Nov 12". */
  sortValue?: (row: TableRow) => TableSortValue;
}

export interface TableFooter {
  label: string;
  value: string | number;
}

/** Root attributes the kit sets itself. `aria-label` is honoured when there is no `caption`. */
type TableOwnedKeys = "children" | "role" | "tabIndex" | "aria-labelledby" | "aria-busy";

/** `ref`, `className` and other attributes land on the scrollable region `<div>` that wraps the `<table>`. */
export interface TableProps extends Omit<ComponentPropsWithoutRef<"div">, TableOwnedKeys> {
  columns: TableColumn[];
  rows: TableRow[];
  caption?: string;
  size?: TableSize;
  emptyLabel?: string;
  footer?: TableFooter;
  /** The header row stays in view while the body scrolls. Give the Table a height so it scrolls. */
  stickyHeader?: boolean;
  /** One row menu in a last 56px column, named "Actions for <first cell>". */
  rowActions?: (row: TableRow, index: number) => TableRowAction[];
  /** How rowActions render: menu (one ellipsis menu, default) or icons (icon-only ghost Buttons, each named by its ariaLabel; up to 3). */
  rowActionsAs?: "menu" | "icons";
  /** loading: header plus skeleton rows. empty: Empty with emptyLabel. error: LoadError with errorMessage. */
  state?: TableState;
  /** state="error": what failed, e.g. "Couldn’t load invoices." */
  errorMessage?: string;
  /** state="error": shows the Try again Button. */
  onRetry?: () => void;
  /** Opt-in: below 480px each row stacks into two lines. First column and last number on top, the rest below. */
  stack?: boolean;
  /** Each row links here from its first cell. With stack, the whole stacked row is the link target. */
  rowHref?: (row: TableRow, index: number) => string;
  ref?: Ref<HTMLDivElement>;
}
