import type { TableProps } from "./Table.types";
import styles from "./Table.module.css";

export type { TableProps, TableColumn } from "./Table.types";

export function Table({ columns, rows, caption }: TableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={styles.th}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={styles.tr}>
              {columns.map((column) => (
                <td key={column.key} className={styles.td}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
