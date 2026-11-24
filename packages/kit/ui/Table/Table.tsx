"use client";

import { isValidElement, useId, useMemo, useState, type ReactNode } from "react";
import type { TableColumn, TableProps, TableRow } from "./Table.types";
import { Cell } from "../Cell";
import { Empty } from "../Empty";
import { LoadError } from "../LoadError";
import { Skeleton } from "../Skeleton";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { compareSortValues, nextSort } from "../shared/sort";
import styles from "./Table.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  TableProps,
  TableColumn,
  TableSize,
  TableAlign,
  TableFooter,
  TableState,
  TableRow,
  TableRowAction,
  TableSortValue,
} from "./Table.types";

const DEFAULT_EMPTY = "No results.";
const DEFAULT_ERROR = "Couldn’t load this table.";
const LOADING_ROWS = 5;

function isNumeric(column: TableColumn): boolean {
  return column.numeric === true || column.align === "end";
}

function isEmphasis(column: TableColumn, index: number): boolean {
  return column.emphasis === true || index === 0;
}

function classNames(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function cellValue(value: ReactNode | undefined): ReactNode {
  if (value === undefined || value === null) return "";
  return value;
}

/** Plain text of a cell for sorting and row names: strings and numbers, or a Cell's label. */
function cellText(value: ReactNode | undefined): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (isValidElement(value)) {
    const props = value.props as { label?: unknown; name?: unknown; value?: unknown };
    for (const key of [props.label, props.name, props.value]) {
      if (typeof key === "string" || typeof key === "number") return String(key);
    }
  }
  return "";
}

/** The column that sits beside the first one when a row stacks: the last number column. */
function stackValueKey(columns: TableColumn[]): string | undefined {
  for (let index = columns.length - 1; index > 0; index -= 1) {
    if (isNumeric(columns[index])) return columns[index].key;
  }
  return undefined;
}

export function Table({
  columns,
  rows,
  caption,
  size = "md",
  emptyLabel = DEFAULT_EMPTY,
  footer,
  stickyHeader = false,
  rowActions,
  state,
  errorMessage = DEFAULT_ERROR,
  onRetry,
  stack = false,
  rowHref,
  className,
  ref,
  "aria-label": ariaLabel,
  ...rest
}: TableProps) {
  const [sort, setSort] = useState<{ key: string | null; dir: "asc" | "desc" }>({ key: null, dir: "asc" });
  const uid = useId();
  const captionId = caption ? `${uid}-caption` : undefined;
  const hasActions = typeof rowActions === "function";
  const colCount = Math.max(columns.length + (hasActions ? 1 : 0), 1);
  const footerLabelSpan = columns.length > 1 ? columns.length - 1 : 1;
  const firstKey = columns[0]?.key;
  const valueKey = stack ? stackValueKey(columns) : undefined;

  const sortedRows = useMemo(() => {
    const indexed = rows.map((row, index) => ({ row, index }));
    if (!sort.key) return indexed;
    const column = columns.find((item) => item.key === sort.key);
    if (!column) return indexed;
    const dir = sort.dir === "asc" ? 1 : -1;
    const read = (row: TableRow) => {
      if (column.sortValue) return column.sortValue(row);
      const text = cellText(row[column.key]);
      if (isNumeric(column)) {
        const number = Number(text.replace(/[^0-9.-]/g, ""));
        if (text !== "" && Number.isFinite(number)) return number;
      }
      return text;
    };
    return [...indexed].sort((a, b) => compareSortValues(read(a.row), read(b.row)) * dir);
  }, [rows, columns, sort]);

  const loading = state === "loading";
  const failed = !loading && state === "error";
  const empty = !loading && !failed && (state === "empty" || rows.length === 0);

  function rowName(row: TableRow, index: number): string {
    return (firstKey ? cellText(row[firstKey]) : "") || `row ${index + 1}`;
  }

  function header(column: TableColumn) {
    if (!column.sortable) return column.header;
    const active = sort.key === column.key;
    const icon = active ? (sort.dir === "asc" ? "ChevronUp" : "ChevronDown") : "ChevronsUpDown";
    return (
      <button
        type="button"
        className={styles.sort}
        onClick={() => setSort((current) => nextSort(current, column.key))}
      >
        <span>{column.header}</span>
        <LucideByName
          name={icon}
          size={14}
          className={active ? styles.sortIconActive : styles.sortIcon}
        />
      </button>
    );
  }

  function body() {
    if (loading) {
      return Array.from({ length: LOADING_ROWS }, (_, rowIndex) => (
        <tr key={rowIndex} className={styles.tr}>
          {columns.map((column, columnIndex) => (
            <td
              key={column.key}
              className={classNames(styles.td, isNumeric(column) && styles.numeric)}
            >
              <Skeleton
                className={styles.bone}
                width={columnIndex === 0 ? "8rem" : "4rem"}
                label={rowIndex === 0 && columnIndex === 0 ? "Loading" : ""}
              />
            </td>
          ))}
          {hasActions ? <td className={classNames(styles.td, styles.actions)} /> : null}
        </tr>
      ));
    }
    if (failed || empty) {
      return (
        <tr className={styles.tr}>
          <td className={classNames(styles.td, styles.state)} colSpan={colCount}>
            {failed ? (
              <LoadError message={errorMessage} onRetry={onRetry} size="sm" />
            ) : (
              <Empty kind="no-data" size="sm" title={emptyLabel} />
            )}
          </td>
        </tr>
      );
    }
    return sortedRows.map(({ row, index }) => {
      const href = rowHref?.(row, index);
      const actions = hasActions ? rowActions(row, index) : [];
      return (
        <tr key={index} className={classNames(styles.tr, href !== undefined && styles.linked)}>
          {columns.map((column, columnIndex) => {
            const content = cellValue(row[column.key]);
            return (
              <td
                key={column.key}
                className={classNames(
                  styles.td,
                  isNumeric(column) && styles.numeric,
                  isEmphasis(column, columnIndex) && styles.emphasis,
                  stack && columnIndex === 0 && styles.stackTitle,
                  stack && column.key === valueKey && styles.stackValue,
                  stack && columnIndex > 0 && column.key !== valueKey && styles.stackMeta,
                )}
              >
                {columnIndex === 0 && href !== undefined ? (
                  <a href={href} className={styles.rowLink}>
                    {content}
                  </a>
                ) : (
                  content
                )}
              </td>
            );
          })}
          {hasActions ? (
            <td className={classNames(styles.td, styles.actions)}>
              {actions.length > 0 ? (
                <Cell type="actionMenu" size="sm" label={`Actions for ${rowName(row, index)}`} actions={actions} />
              ) : null}
            </td>
          ) : null}
        </tr>
      );
    });
  }

  return (
    <div
      {...rest} {...nisthaAttr("table", rest)}
      ref={ref}
      data-kit-frame=""
      className={cx(
        styles.wrapper,
        styles[size],
        stickyHeader && styles.sticky,
        stack && styles.stack,
        className,
      )}
      tabIndex={0}
      role="region"
      aria-labelledby={captionId}
      aria-label={captionId ? undefined : (ariaLabel ?? "Table")}
      aria-busy={loading || undefined}
    >
      <table className={styles.table}>
        {caption ? (
          <caption id={captionId} className={styles.caption}>
            {caption}
          </caption>
        ) : null}
        <thead className={styles.thead}>
          <tr className={styles.tr}>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={classNames(styles.th, isNumeric(column) && styles.numeric)}
                aria-sort={
                  column.sortable
                    ? sort.key === column.key
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
              >
                {header(column)}
              </th>
            ))}
            {hasActions ? (
              <th scope="col" className={classNames(styles.th, styles.actions)}>
                <span className={styles.srOnly}>Actions</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className={styles.tbody}>{body()}</tbody>
        {footer && !loading && !failed && !empty ? (
          <tfoot className={styles.tfoot}>
            <tr className={styles.tr}>
              {columns.length > 1 ? (
                <>
                  <td className={styles.td} colSpan={footerLabelSpan}>
                    {footer.label}
                  </td>
                  <td className={classNames(styles.td, styles.numeric)}>{footer.value}</td>
                </>
              ) : (
                <td className={classNames(styles.td, styles.numeric)}>
                  {footer.label} {footer.value}
                </td>
              )}
              {hasActions ? <td className={classNames(styles.td, styles.actions)} /> : null}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
