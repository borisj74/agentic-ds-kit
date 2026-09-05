import { useId, type ReactNode } from "react";
import type { TableColumn, TableProps } from "./Table.types";
import styles from "./Table.module.css";

export type {
  TableProps,
  TableColumn,
  TableSize,
  TableAlign,
  TableFooter,
} from "./Table.types";

const DEFAULT_EMPTY = "No results.";

function isNumeric(column: TableColumn): boolean {
  return column.numeric === true || column.align === "end";
}

function isEmphasis(column: TableColumn, index: number): boolean {
  return column.emphasis === true || index === 0;
}

function classNames(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function cellValue(value: string | number | ReactNode | undefined): ReactNode {
  if (value === undefined || value === null) return "";
  return value;
}

export function Table({
  columns,
  rows,
  caption,
  size = "md",
  emptyLabel = DEFAULT_EMPTY,
  footer,
}: TableProps) {
  const empty = rows.length === 0;
  const colCount = Math.max(columns.length, 1);
  const footerLabelSpan = columns.length > 1 ? columns.length - 1 : 1;
  const uid = useId();
  const captionId = caption ? `${uid}-caption` : undefined;

  return (
    <div
      className={classNames(styles.wrapper, styles[size])}
      tabIndex={0}
      role="region"
      aria-labelledby={captionId}
      aria-label={captionId ? undefined : "Table"}
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
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {empty ? (
            <tr className={styles.tr}>
              <td className={classNames(styles.td, styles.empty)} colSpan={colCount}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index} className={styles.tr}>
                {columns.map((column, columnIndex) => (
                  <td
                    key={column.key}
                    className={classNames(
                      styles.td,
                      isNumeric(column) && styles.numeric,
                      isEmphasis(column, columnIndex) && styles.emphasis,
                    )}
                  >
                    {cellValue(row[column.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {footer ? (
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
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
