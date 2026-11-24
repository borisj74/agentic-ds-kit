import type { DataGridColumn, DataGridRow } from "./DataGrid.types";

/** Shown in a computed cell that has no value, or whose row has an invalid cell. */
export const EM_DASH = "—";

export function columnType(column: DataGridColumn): NonNullable<DataGridColumn["type"]> {
  return column.type ?? "text";
}

/** Number and money columns: end-aligned, tabular figures. */
export function isNumeric(column: DataGridColumn): boolean {
  const type = columnType(column);
  return type === "number" || type === "money";
}

/** Text-like columns open an Input; select and date always show their control. */
export function isTextLike(column: DataGridColumn): boolean {
  const type = columnType(column);
  return type === "text" || type === "number" || type === "money";
}

export function isComputed(column: DataGridColumn): boolean {
  return typeof column.compute === "function";
}

function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

function formatDate(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** A decimal string in a currency, e.g. "39" → "$39.00". Values that aren't numbers stay as typed. */
export function formatMoney(value: string, currency = "USD"): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return value;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return value;
  }
}

export function displayValue(column: DataGridColumn, value: string): string {
  if (!value) return "";
  const type = columnType(column);
  if (type === "select") {
    return column.options?.find((option) => option.value === value)?.label ?? value;
  }
  if (type === "date") return formatDate(value);
  if (type === "money") return formatMoney(value, column.currency);
  return value;
}

/** Each invalid cell's fix by column key. Computed columns are not checked. */
export function cellErrors(columns: DataGridColumn[], row: DataGridRow): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const column of columns) {
    if (!column.validate || isComputed(column)) continue;
    const message = column.validate(row[column.key] ?? "", row);
    if (message) errors[column.key] = message;
  }
  return errors;
}

/** "1 line needs a fix" / "3 lines need a fix", or "" when every row is valid. */
export function errorSummaryText(invalidCount: number): string {
  if (invalidCount <= 0) return "";
  return invalidCount === 1 ? "1 line needs a fix" : `${invalidCount} lines need a fix`;
}

/** The shown value of a cell: computed columns work it out (an em dash on an invalid row). */
export function cellText(column: DataGridColumn, row: DataGridRow, rowValid: boolean): string {
  if (column.compute) {
    if (!rowValid) return EM_DASH;
    const computed = column.compute(row);
    return computed ? displayValue(column, computed) : EM_DASH;
  }
  return displayValue(column, row[column.key] ?? "");
}

/** Error text tied to a cell: "Qty, row 3: enter 1 or more · left out of the total". */
export function cellMessage(name: string, message: string, withTotals: boolean): string {
  return `${name}: ${message}${withTotals ? " · left out of the total" : ""}`;
}

/** The figure at the end of a stacked row: the first computed column, else none. */
export function stackedFigureColumn(columns: DataGridColumn[]): DataGridColumn | undefined {
  return columns.find(isComputed);
}

/** The line under a stacked row's title: the other editable values, e.g. "18 · $39.00 · VAT 20%". */
export function stackedSummary(columns: DataGridColumn[], row: DataGridRow): string {
  return columns
    .slice(1)
    .filter((column) => !isComputed(column))
    .map((column) => displayValue(column, row[column.key] ?? ""))
    .filter(Boolean)
    .join(" · ");
}
