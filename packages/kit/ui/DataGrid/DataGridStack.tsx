"use client";

import { useState } from "react";
import { ChevronDown, CircleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { DatePicker } from "../DatePicker";
import { Input } from "../Input";
import { Select } from "../Select";
import type { DataGridColumn, DataGridRow, DataGridTotal } from "./DataGrid.types";
import {
  cellMessage,
  cellText,
  columnType,
  displayValue,
  isComputed,
  isNumeric,
  stackedFigureColumn,
  stackedSummary,
} from "./dataGrid.logic";
import { cx } from "../shared/cx";
import styles from "./DataGrid.module.css";

interface DataGridStackProps {
  uid: string;
  label: string;
  columns: DataGridColumn[];
  rows: DataGridRow[];
  errorsByRow: Map<string, Record<string, string>>;
  withTotals: boolean;
  emptyLabel: string;
  canRemoveRows: boolean;
  /** A row just added: it opens so its fields can be filled. */
  openRow?: string;
  onCellChange: (rowId: string, key: string, value: string) => void;
  onRemoveRow: (rowId: string) => void;
}

/**
 * DataGrid below 30rem: one row per line. Each shows its first column, the other values and the
 * computed figure, and opens to labelled fields. Rows with an invalid cell start open.
 */
export function DataGridStack({
  uid,
  label,
  columns,
  rows,
  errorsByRow,
  withTotals,
  emptyLabel,
  canRemoveRows,
  openRow,
  onCellChange,
  onRemoveRow,
}: DataGridStackProps) {
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const titleColumn = columns.find((column) => !isComputed(column));
  const figureColumn = stackedFigureColumn(columns);
  const fields = columns.filter((column) => !isComputed(column));

  if (rows.length === 0) {
    return <p className={styles.stackEmpty}>{emptyLabel}</p>;
  }

  return (
    <ul className={styles.stack} aria-label={label}>
      {rows.map((row, index) => {
        const n = index + 1;
        const errors = errorsByRow.get(row.id) ?? {};
        const rowValid = Object.keys(errors).length === 0;
        const isOpen = toggled[row.id] ?? (!rowValid || row.id === openRow);
        const panelId = `${uid}-${row.id}-panel`;
        const title = titleColumn ? displayValue(titleColumn, row[titleColumn.key] ?? "") : "";
        const meta = stackedSummary(columns, row);
        const figure = figureColumn ? cellText(figureColumn, row, rowValid) : "";
        return (
          <li key={row.id} className={cx(styles.stackRow, isOpen && styles.stackRowOpen)}>
            <button
              type="button"
              className={styles.stackToggle}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setToggled((prev) => ({ ...prev, [row.id]: !isOpen }))}
            >
              <span className={styles.stackText}>
                <span className={styles.stackTitle}>
                  {title || `Row ${n}`}
                  {!rowValid ? <span className={styles.srOnly}>, needs a fix</span> : null}
                </span>
                {meta && !isOpen ? <span className={styles.stackMeta}>{meta}</span> : null}
              </span>
              {figure && !isOpen ? <span className={styles.stackFigure}>{figure}</span> : null}
              <ChevronDown size={16} strokeWidth={ICON_STROKE} aria-hidden className={styles.stackChevron} />
            </button>
            {isOpen ? (
              <div id={panelId} className={styles.stackPanel}>
                <div className={styles.stackFields}>
                  {fields.map((column) => {
                    const type = columnType(column);
                    const fieldId = `${uid}-${row.id}-${column.key}-field`;
                    const error = errors[column.key];
                    const errorId = error ? `${fieldId}-error` : undefined;
                    const value = row[column.key] ?? "";
                    const wide = column === titleColumn;
                    return (
                      <div key={column.key} className={cx(styles.stackField, wide && styles.stackFieldWide)}>
                        <label className={styles.stackLabel} htmlFor={fieldId}>
                          {column.header}
                        </label>
                        {type === "select" ? (
                          <Select
                            id={fieldId}
                            size="sm"
                            options={column.options ?? []}
                            placeholder={column.placeholder}
                            value={value}
                            error={Boolean(error)}
                            describedBy={errorId}
                            ariaLabel={`${column.header}, row ${n}`}
                            onChange={(next) => {
                              const picked = Array.isArray(next) ? (next[0] ?? "") : next;
                              onCellChange(row.id, column.key, picked);
                            }}
                          />
                        ) : type === "date" ? (
                          <DatePicker
                            id={fieldId}
                            size="sm"
                            placeholder={column.placeholder}
                            value={value}
                            error={Boolean(error)}
                            describedBy={errorId}
                            onValueChange={(next) => onCellChange(row.id, column.key, next)}
                          />
                        ) : (
                          <span className={cx(styles.stackInput, isNumeric(column) && styles.editorEnd)}>
                            <Input
                              id={fieldId}
                              size="sm"
                              placeholder={column.placeholder}
                              value={value}
                              error={Boolean(error)}
                              describedBy={errorId}
                              inputMode={isNumeric(column) ? "decimal" : undefined}
                              onChange={(next) => onCellChange(row.id, column.key, next)}
                            />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {fields.map((column) => {
                  const error = errors[column.key];
                  if (!error) return null;
                  return (
                    <p key={column.key} id={`${uid}-${row.id}-${column.key}-field-error`} className={styles.stackError}>
                      <CircleAlert size={16} strokeWidth={ICON_STROKE} aria-hidden className={styles.errorIcon} />
                      {cellMessage(column.header, error, withTotals)}
                    </p>
                  );
                })}
                {figureColumn || canRemoveRows ? (
                  <div className={styles.stackPanelFoot}>
                    {figureColumn ? (
                      <span className={styles.stackPanelFigure}>
                        {figureColumn.header} <span className={styles.stackFigure}>{figure}</span>
                      </span>
                    ) : (
                      <span />
                    )}
                    {canRemoveRows ? (
                      <Button
                        appearance="ghost"
                        mode="neutral"
                        size="sm"
                        iconStart="Trash2"
                        ariaLabel={`Remove row ${n}`}
                        onClick={() => onRemoveRow(row.id)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** The stacked footer: only the emphasised lines (the grand total), with their narrow label. */
export function DataGridStackTotals({ totals }: { totals: DataGridTotal[] }) {
  const shown = totals.some((total) => total.emphasis) ? totals.filter((total) => total.emphasis) : totals;
  return (
    <dl className={styles.stackTotals}>
      {shown.map((total) => (
        <div key={total.label} className={cx(styles.stackTotal, total.emphasis && styles.stackTotalEmphasis)}>
          <dt>{total.narrowLabel ?? total.label}</dt>
          <dd>{total.value}</dd>
        </div>
      ))}
    </dl>
  );
}
