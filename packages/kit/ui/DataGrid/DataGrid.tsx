"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
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
import { CircleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { DataGridColumn, DataGridProps, DataGridRow } from "./DataGrid.types";
import {
  cellErrors,
  cellMessage,
  cellText,
  columnType,
  errorSummaryText,
  isComputed,
  isNumeric,
  isTextLike,
} from "./dataGrid.logic";
import { DataGridStack, DataGridStackTotals } from "./DataGridStack";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useNarrow } from "../shared/useNarrow";
import styles from "./DataGrid.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  DataGridProps,
  DataGridColumn,
  DataGridRow,
  DataGridColumnType,
  DataGridSize,
  DataGridTotal,
} from "./DataGrid.types";

/** Below this width (rem) the grid stacks: one row per line that opens to edit. */
const STACK_BELOW_REM = 30;

type Spot = { row: string; key: string };

const DEFAULT_LABEL = "Data grid";
const DEFAULT_EMPTY = "No rows yet.";
const EMPTY_ROWS: DataGridRow[] = [];

function classNames(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function overlayOpen(): boolean {
  return Boolean(
    document.querySelector('[role="menu"]') || document.querySelector('[data-kit-date-panel]'),
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
  totals,
  errorSummary = false,
  className,
  ref,
  ...rest
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
  const [lastAdded, setLastAdded] = useState<string | undefined>(undefined);
  const [measuredIndexWidth, setIndexWidth] = useState(0);
  const indexWidth = stickyFirstColumn && rowNumbers ? measuredIndexWidth : 0;
  const rows = rowsProp ?? innerRows;
  const firstKey = columns[0]?.key;
  const editable = useMemo(() => columns.filter((column) => !isComputed(column)), [columns]);
  const colSpan = columns.length + (rowNumbers ? 1 : 0) + (canRemoveRows ? 1 : 0);
  const empty = rows.length === 0;
  const errorsByRow = useMemo(
    () => new Map(rows.map((row) => [row.id, cellErrors(columns, row)])),
    [rows, columns],
  );
  const valid = rows.filter((row) => Object.keys(errorsByRow.get(row.id) ?? {}).length === 0);
  const invalidCount = rows.length - valid.length;
  const totalLines = totals ? totals(valid) : [];
  const withTotals = Boolean(totals);
  const summaryId = `${uid}-summary`;
  const { ref: measureRef, narrow } = useNarrow<HTMLDivElement>(STACK_BELOW_REM);
  const rootRef = useMemo(() => mergeRefs<HTMLDivElement>(measureRef, ref), [measureRef, ref]);

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
      ...Object.fromEntries(editable.map((column) => [column.key, ""])),
    } as DataGridRow;
    commit([...rows, row]);
    setLastAdded(row.id);
    const first = editable[0];
    if (first && !narrow) {
      setDraft("");
      setEditing({ row: row.id, key: first.key });
    }
  }

  function removeRow(id: string) {
    if (editing?.row === id) setEditing(null);
    commit(rows.filter((row) => row.id !== id));
  }

  useLayoutEffect(() => {
    if (!stickyFirstColumn || !rowNumbers) return;
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
    if (!column || isTextLike(column)) return;
    const spot = editing;
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cell = tableRef.current?.querySelector(cellSelector(spot));
      if (cell?.contains(target)) return;
      if (target.closest('[role="menu"]') || target.closest('[data-kit-date-panel]')) return;
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
      if (event.key === "Enter" && isTextLike(column)) {
        event.preventDefault();
        close(true, true);
        return;
      }
      if (event.key !== "Tab" || !editing) return;
      const next = neighbor(rows, editable, editing.row, editing.key, event.shiftKey ? -1 : 1);
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
      if (!isTextLike(column)) return;
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      close(true, false);
    };
  }

  const stickyStyle = {
    "--datagrid-index-width": `${indexWidth}px`,
  } as CSSProperties;

  const summary = errorSummary ? (
    <p id={summaryId} role="status" className={styles.summary}>
      {invalidCount > 0 ? (
        <>
          <CircleAlert size={16} strokeWidth={ICON_STROKE} aria-hidden className={styles.summaryIcon} />
          {errorSummaryText(invalidCount)}
        </>
      ) : null}
    </p>
  ) : null;

  const addRowBar = canAddRows ? (
    <div ref={addRef} className={styles.add}>
      <Button appearance="ghost" mode="neutral" size="sm" iconStart="Plus" onClick={addRow}>
        Add row
      </Button>
    </div>
  ) : null;

  if (narrow) {
    return (
      <div
        {...rest}
        {...nisthaAttr("datagrid", rest)}
        ref={rootRef}
        className={cx(styles.root, styles.stacked, className)}
        data-size={size}
      >
        {summary}
        <DataGridStack
          uid={uid}
          label={label}
          columns={columns}
          rows={rows}
          errorsByRow={errorsByRow}
          withTotals={withTotals}
          emptyLabel={emptyLabel}
          canRemoveRows={canRemoveRows}
          openRow={lastAdded}
          onCellChange={setCell}
          onRemoveRow={removeRow}
        />
        {addRowBar}
        {totalLines.length ? <DataGridStackTotals totals={totalLines} /> : null}
      </div>
    );
  }

  // Totals sit under the last number or money column (Amount), labels end-aligned before it.
  const lastNumeric = columns.reduce((found, column, index) => (isNumeric(column) ? index : found), -1);
  const valueIndex = (lastNumeric >= 0 ? lastNumeric : columns.length - 1) + (rowNumbers ? 1 : 0);
  const trailing = colSpan - valueIndex - 1;

  return (
    <div {...rest} {...nisthaAttr("datagrid", rest)} ref={rootRef} className={cx(styles.root, className)} data-size={size}>
      {summary}
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
                  <HeaderCell label={column.header} size={size} align={isNumeric(column) ? "end" : "start"} />
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
              rows.flatMap((row, index) => {
                const n = index + 1;
                const errors = errorsByRow.get(row.id) ?? {};
                const errorKeys = Object.keys(errors);
                const rowValid = errorKeys.length === 0;
                const messageId = (key: string) => `${uid}-${row.id}-${key}-error`;
                const line = (
                  <tr key={row.id} className={classNames(styles.tr, !rowValid && styles.trInvalid)}>
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
                      const numeric = isNumeric(column);
                      const sticky = stickyFirstColumn && column.key === firstKey && styles.stickyFirst;
                      const width = column.width ? { width: column.width, minWidth: column.width } : undefined;
                      if (isComputed(column)) {
                        return (
                          <td
                            key={column.key}
                            className={classNames(styles.td, styles.end, styles.computed, sticky)}
                            style={width}
                          >
                            <span className={styles.value}>{cellText(column, row, rowValid)}</span>
                          </td>
                        );
                      }
                      const value = row[column.key] ?? "";
                      const name = `${column.header}, row ${n}`;
                      const shown = cellText(column, row, rowValid);
                      const error = errors[column.key];
                      const describedBy = error ? messageId(column.key) : undefined;
                      const isEditing = editing?.row === row.id && editing.key === column.key;
                      const editorId = `${uid}-${row.id}-${column.key}`;
                      return (
                        <td
                          key={column.key}
                          data-row={row.id}
                          data-key={column.key}
                          className={classNames(
                            styles.td,
                            numeric && styles.end,
                            isEditing && styles.editing,
                            type === "date" && styles.date,
                            error && styles.invalid,
                            sticky,
                          )}
                          style={width}
                          onKeyDown={isEditing ? onEditorKey(column) : undefined}
                          onBlur={isEditing ? onEditorBlur(column) : undefined}
                        >
                          {type === "select" ? (
                            <span className={styles.editor}>
                              <Select
                                id={editorId}
                                size="sm"
                                options={column.options ?? []}
                                placeholder={column.placeholder}
                                value={value}
                                error={Boolean(error)}
                                describedBy={describedBy}
                                onChange={(next) => {
                                  const picked = Array.isArray(next) ? (next[0] ?? "") : next;
                                  setCell(row.id, column.key, picked);
                                }}
                                ariaLabel={name}
                              />
                            </span>
                          ) : type === "date" ? (
                            <span className={styles.editor}>
                              <label className={styles.srOnly} htmlFor={editorId}>
                                {name}
                              </label>
                              <DatePicker
                                id={editorId}
                                size="sm"
                                placeholder={column.placeholder}
                                value={value}
                                error={Boolean(error)}
                                describedBy={describedBy}
                                onValueChange={(next) => setCell(row.id, column.key, next)}
                              />
                            </span>
                          ) : isEditing ? (
                            <span className={classNames(styles.editor, numeric && styles.editorEnd)}>
                              <Input
                                id={editorId}
                                size="sm"
                                placeholder={column.placeholder}
                                value={draft}
                                onChange={setDraft}
                                ariaLabel={name}
                                error={Boolean(error)}
                                describedBy={describedBy}
                                inputMode={numeric ? "decimal" : undefined}
                              />
                            </span>
                          ) : (
                            // aria-invalid on the idle cell button so the error is announced
                            // before it opens; the editor Input carries it too.
                            // eslint-disable-next-line jsx-a11y/role-supports-aria-props
                            <button
                              type="button"
                              className={styles.cellButton}
                              aria-label={`${name}: ${shown || "empty"}`}
                              aria-invalid={error ? true : undefined}
                              aria-describedby={describedBy}
                              onClick={() => open({ row: row.id, key: column.key })}
                            >
                              {error ? (
                                <CircleAlert size={16} strokeWidth={ICON_STROKE} aria-hidden className={styles.errorIcon} />
                              ) : null}
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
                            appearance="ghost" mode="neutral"
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
                if (rowValid) return [line];
                return [
                  line,
                  <tr key={`${row.id}-errors`} className={styles.messageRow}>
                    <td className={classNames(styles.td, styles.message)} colSpan={Math.max(colSpan, 1)}>
                      {errorKeys.map((key) => {
                        const column = columns.find((item) => item.key === key);
                        return (
                          <span key={key} id={messageId(key)} className={styles.messageLine}>
                            {cellMessage(`${column?.header ?? key}, row ${n}`, errors[key] ?? "", withTotals)}
                          </span>
                        );
                      })}
                    </td>
                  </tr>,
                ];
              })
            )}
          </tbody>
          {totalLines.length ? (
            <tfoot className={styles.foot}>
              {totalLines.map((total) => (
                <tr key={total.label} className={classNames(total.emphasis && styles.footEmphasis)}>
                  <th scope="row" colSpan={Math.max(valueIndex, 1)} className={classNames(styles.footLabel)}>
                    {total.label}
                  </th>
                  <td className={classNames(styles.footValue, styles.end)}>{total.value}</td>
                  {trailing > 0 ? <td colSpan={trailing} className={styles.footRest} /> : null}
                </tr>
              ))}
            </tfoot>
          ) : null}
        </table>
      </div>
      {addRowBar}
    </div>
  );
}
