"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "../Button";
import { DatePicker } from "../DatePicker";
import { HeaderCell } from "../HeaderCell";
import { Input } from "../Input";
import { Select } from "../Select";
import { Tooltip } from "../Tooltip";
import type { DataGridColumn, DataGridProps, DataGridRow } from "./DataGrid.types";
import styles from "./DataGrid.module.css";

export type {
  DataGridProps,
  DataGridColumn,
  DataGridRow,
  DataGridColumnType,
  DataGridSize,
} from "./DataGrid.types";

type Spot = { row: string; key: string };

const DEFAULT_LABEL = "Data grid";
const DEFAULT_EMPTY = "No rows yet.";
const EMPTY_ROWS: DataGridRow[] = [];

function classNames(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function columnType(column: DataGridColumn): NonNullable<DataGridColumn["type"]> {
  return column.type ?? "text";
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

function displayValue(column: DataGridColumn, value: string): string {
  if (!value) return "";
  const type = columnType(column);
  if (type === "select") {
    return column.options?.find((option) => option.value === value)?.label ?? value;
  }
  if (type === "date") return formatDate(value);
  return value;
}

function overlayOpen(): boolean {
  return Boolean(
    document.querySelector('[role="menu"]') || document.querySelector('[aria-label="Choose date"]'),
  );
}

function neighbor(
  rows: DataGridRow[],
  columns: DataGridColumn[],
  rowId: string,
  key: string,
  direction: 1 | -1,
): Spot | null {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const columnIndex = columns.findIndex((column) => column.key === key);
  if (rowIndex < 0 || columnIndex < 0 || columns.length === 0) return null;
  let nextRow = rowIndex;
  let nextColumn = columnIndex + direction;
  if (nextColumn >= columns.length) {
    nextRow += 1;
    nextColumn = 0;
  } else if (nextColumn < 0) {
    nextRow -= 1;
    nextColumn = columns.length - 1;
  }
  const row = rows[nextRow];
  const column = columns[nextColumn];
  if (!row || !column) return null;
  return { row: row.id, key: column.key };
}

function cellSelector(spot: Spot): string {
  return `[data-row="${CSS.escape(spot.row)}"][data-key="${CSS.escape(spot.key)}"]`;
}

export function DataGrid({
  columns,
  rows: rowsProp,
  defaultRows,
  onRowsChange,
  label = DEFAULT_LABEL,
  size = "md",
  canAddRows = false,
  canRemoveRows = false,
  emptyLabel = DEFAULT_EMPTY,
  rowNumbers = false,
  stickyFirstColumn = false,
}: DataGridProps) {
  const uid = useId();
  const added = useRef(0);
  const tableRef = useRef<HTMLTableElement>(null);
  const indexRef = useRef<HTMLTableCellElement>(null);
  const addRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Spot | null>(null);
  const [innerRows, setInnerRows] = useState<DataGridRow[]>(defaultRows ?? EMPTY_ROWS);
  const [editing, setEditing] = useState<Spot | null>(null);
  const [draft, setDraft] = useState("");
  const [indexWidth, setIndexWidth] = useState(0);
  const rows = rowsProp ?? innerRows;
  const firstKey = columns[0]?.key;
  const colSpan = columns.length + (rowNumbers ? 1 : 0) + (canRemoveRows ? 1 : 0);
  const empty = rows.length === 0;

  function commit(next: DataGridRow[]) {
    if (rowsProp === undefined) setInnerRows(next);
    onRowsChange?.(next);
  }

  function setCell(rowId: string, key: string, value: string) {
    const current = rows.find((row) => row.id === rowId)?.[key] ?? "";
    if (current === value) return;
    commit(rows.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  }

  function save(spot: Spot, value = draft) {
    setCell(spot.row, spot.key, value);
  }

  function open(spot: Spot) {
    if (editing && (editing.row !== spot.row || editing.key !== spot.key)) {
      save(editing);
    }
    const row = rows.find((item) => item.id === spot.row);
    setDraft(row?.[spot.key] ?? "");
    setEditing(spot);
  }

  function close(keep: boolean, refocus: boolean) {
    if (!editing) return;
    if (keep) save(editing);
    if (refocus) returnTo.current = editing;
    setEditing(null);
  }

  function moveTo(next: Spot | null, keep: boolean) {
    if (keep && editing) save(editing);
    if (!next) {
      setEditing(null);
      return;
    }
    const row = rows.find((item) => item.id === next.row);
    setDraft(row?.[next.key] ?? "");
    setEditing(next);
  }

  function addRow() {
    if (editing) save(editing);
    added.current += 1;
    const row = {
      id: `${uid}-new-${added.current}`,
      ...Object.fromEntries(columns.map((column) => [column.key, ""])),
    } as DataGridRow;
    commit([...rows, row]);
    const first = columns[0];
    if (first) {
      setDraft("");
      setEditing({ row: row.id, key: first.key });
    }
  }

  function removeRow(id: string) {
    if (editing?.row === id) setEditing(null);
    commit(rows.filter((row) => row.id !== id));
  }

  useLayoutEffect(() => {
    if (!stickyFirstColumn || !rowNumbers) {
      setIndexWidth(0);
      return;
    }
    const measure = () => {
      setIndexWidth(indexRef.current?.getBoundingClientRect().width ?? 0);
    };
    measure();
    if (typeof ResizeObserver === "undefined" || !indexRef.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(indexRef.current);
    return () => observer.disconnect();
  }, [stickyFirstColumn, rowNumbers, rows.length, size]);

  useEffect(() => {
    if (!editing) return;
    const column = columns.find((item) => item.key === editing.key);
    if (!column || columnType(column) === "text") return;
    const spot = editing;
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cell = tableRef.current?.querySelector(cellSelector(spot));
      if (cell?.contains(target)) return;
      if (target.closest('[role="menu"]') || target.closest('[aria-label="Choose date"]')) return;
      setEditing(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [editing, columns]);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    if (editing) {
      const cell = table.querySelector(cellSelector(editing));
      const input = cell?.querySelector<HTMLInputElement>("input:not([type='hidden'])");
      if (input) {
        input.focus();
        input.select();
        return;
      }
      cell?.querySelector<HTMLButtonElement>("button")?.focus();
      return;
    }
    if (returnTo.current) {
      const spot = returnTo.current;
      returnTo.current = null;
      table.querySelector(cellSelector(spot))?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }, [editing]);

  function onEditorKey(column: DataGridColumn) {
    return (event: KeyboardEvent<HTMLTableCellElement>) => {
      if (overlayOpen() && event.key !== "Enter") return;
      if (event.key === "Escape") {
        if (event.defaultPrevented) return;
        event.preventDefault();
        close(false, true);
        return;
      }
      if (event.key === "Enter" && columnType(column) === "text") {
        event.preventDefault();
        close(true, true);
        return;
      }
      if (event.key !== "Tab" || !editing) return;
      const next = neighbor(rows, columns, editing.row, editing.key, event.shiftKey ? -1 : 1);
      if (!next) {
        event.preventDefault();
        close(true, false);
        if (!event.shiftKey) {
          addRef.current?.querySelector("button")?.focus();
        }
        return;
      }
      event.preventDefault();
      moveTo(next, true);
    };
  }

  function onEditorBlur(column: DataGridColumn) {
    return (event: FocusEvent<HTMLTableCellElement>) => {
      if (columnType(column) !== "text") return;
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      close(true, false);
    };
  }

  const stickyStyle = {
    "--datagrid-index-width": `${indexWidth}px`,
  } as CSSProperties;

  return (
    <div className={styles.root} data-size={size}>
      <div className={styles.scroller} tabIndex={0} role="region" aria-label={label}>
        <table ref={tableRef} className={styles.table} aria-label={label} style={stickyStyle}>
          <thead>
            <tr>
              {rowNumbers ? (
                <th
                  ref={indexRef}
                  scope="col"
                  className={classNames(styles.th, styles.hug, stickyFirstColumn && styles.stickyIndex)}
                >
                  <HeaderCell label="#" size={size} align="center" />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={classNames(
                    styles.th,
                    stickyFirstColumn && column.key === firstKey && styles.stickyFirst,
                  )}
                  style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                >
                  <HeaderCell label={column.header} size={size} />
                </th>
              ))}
              {canRemoveRows ? (
                <th scope="col" className={classNames(styles.th, styles.hug)}>
                  <span className={styles.srOnly}>Remove</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {empty ? (
              <tr>
                <td className={classNames(styles.td, styles.empty)} colSpan={Math.max(colSpan, 1)}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const n = index + 1;
                return (
                  <tr key={row.id} className={styles.tr}>
                    {rowNumbers ? (
                      <td
                        className={classNames(
                          styles.td,
                          styles.index,
                          stickyFirstColumn && styles.stickyIndex,
                        )}
                      >
                        {n}
                      </td>
                    ) : null}
                    {columns.map((column) => {
                      const type = columnType(column);
                      const value = row[column.key] ?? "";
                      const name = `${column.header}, row ${n}`;
                      const shown = displayValue(column, value);
                      const isEditing = editing?.row === row.id && editing.key === column.key;
                      const editorId = `${uid}-${row.id}-${column.key}`;
                      return (
                        <td
                          key={column.key}
                          data-row={row.id}
                          data-key={column.key}
                          className={classNames(
                            styles.td,
                            isEditing && styles.editing,
                            stickyFirstColumn && column.key === firstKey && styles.stickyFirst,
                          )}
                          style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                          onKeyDown={isEditing ? onEditorKey(column) : undefined}
                          onBlur={isEditing ? onEditorBlur(column) : undefined}
                        >
                          {isEditing && type === "text" ? (
                            <span className={styles.editor}>
                              <Input
                                id={editorId}
                                size="sm"
                                placeholder={column.placeholder}
                                value={draft}
                                onChange={setDraft}
                                ariaLabel={name}
                              />
                            </span>
                          ) : isEditing && type === "select" ? (
                            <span className={styles.editor}>
                              <Select
                                id={editorId}
                                size="sm"
                                options={column.options ?? []}
                                placeholder={column.placeholder}
                                value={value}
                                onChange={(next) => {
                                  const picked = Array.isArray(next) ? (next[0] ?? "") : next;
                                  setCell(row.id, column.key, picked);
                                  returnTo.current = { row: row.id, key: column.key };
                                  setEditing(null);
                                }}
                                ariaLabel={name}
                              />
                            </span>
                          ) : isEditing && type === "date" ? (
                            <span className={styles.editor}>
                              <label className={styles.srOnly} htmlFor={editorId}>
                                {name}
                              </label>
                              <DatePicker
                                id={editorId}
                                size="sm"
                                placeholder={column.placeholder}
                                value={value}
                                onValueChange={(next) => {
                                  setCell(row.id, column.key, next);
                                  returnTo.current = { row: row.id, key: column.key };
                                  setEditing(null);
                                }}
                              />
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={styles.cellButton}
                              aria-label={`${name}: ${shown || "empty"}`}
                              onClick={() => open({ row: row.id, key: column.key })}
                            >
                              <span className={shown ? styles.value : styles.placeholder}>
                                {shown || column.placeholder || ""}
                              </span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                    {canRemoveRows ? (
                      <td className={classNames(styles.td, styles.remove)}>
                        <Tooltip
                          className={styles.removeTrigger}
                          content={`Remove row ${n}`}
                          placement="left"
                        >
                          <Button
                            variant="tertiary"
                            size="sm"
                            iconStart="Trash2"
                            ariaLabel={`Remove row ${n}`}
                            onClick={() => removeRow(row.id)}
                          />
                        </Tooltip>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {canAddRows ? (
        <div ref={addRef} className={styles.add}>
          <Button variant="tertiary" size="sm" iconStart="Plus" onClick={addRow}>
            Add row
          </Button>
        </div>
      ) : null}
    </div>
  );
}
