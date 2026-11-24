import type { ComponentPropsWithoutRef, Ref } from "react";
import type { SelectOption } from "../Select/Select.types";

/**
 * `text` (default), `select`, `date`, `number` (end-aligned, tabular, numeric keypad) or `money`
 * (end-aligned, tabular, shown in `currency`). Number and money values are plain decimal strings
 * such as "18" or "39.00".
 */
export type DataGridColumnType = "text" | "select" | "date" | "number" | "money";
export type DataGridSize = "sm" | "md";

export type DataGridRow = { id: string } & Record<string, string>;

export interface DataGridColumn {
  key: string;
  header: string;
  type?: DataGridColumnType;
  options?: SelectOption[];
  placeholder?: string;
  width?: string;
  /** `money` only: ISO 4217 code for the display. Default "USD". */
  currency?: string;
  /**
   * A derived, read-only column: its value comes from the row, e.g. Amount = Qty × Unit price.
   * Return a plain string (a decimal string for number and money) or "" when it can't be worked
   * out. Rows with an invalid cell show an em dash here. This is not a formula editor.
   */
  compute?: (row: DataGridRow) => string;
  /**
   * Check a cell. Return a short fix, e.g. "enter 1 or more", or undefined when the value is fine.
   * The grid rings that cell, ties the message to it and leaves the row out of the totals.
   */
  validate?: (value: string, row: DataGridRow) => string | undefined;
}

/** One line of the totals footer. */
export interface DataGridTotal {
  label: string;
  /** Pre-formatted, e.g. "$1,088.40". */
  value: string;
  /** The grand total: bold, ruled above, and the only line shown when the grid stacks. */
  emphasis?: boolean;
  /** Label when the grid stacks, e.g. "Total incl. VAT". Default `label`. */
  narrowLabel?: string;
}

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
  /**
   * Footer lines worked out from the valid rows only (rows with an invalid cell are left out),
   * e.g. Subtotal, VAT 20%, Total.
   */
  totals?: (validRows: DataGridRow[]) => DataGridTotal[];
  /** A line above the grid that counts rows needing a fix: "1 line needs a fix". */
  errorSummary?: boolean;
  ref?: Ref<HTMLDivElement>;
}
