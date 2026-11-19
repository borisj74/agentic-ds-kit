"use client";

import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ChartFrame } from "../shared/ChartFrame";
import frameStyles from "../shared/ChartFrame.module.css";
import { formatValue } from "../shared/chartMath";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { cellKey, cellMap, LEVELS, levelOf, maxValue, moveFocus } from "./heatmap.logic";
import type { HeatmapProps } from "./Heatmap.types";
import styles from "./Heatmap.module.css";

export type { HeatmapDatum, HeatmapProps } from "./Heatmap.types";

type Tip = { row: number; column: number; x: number; y: number; flip: boolean };

const LEVEL_CLASS = [styles.level0, styles.level1, styles.level2, styles.level3, styles.level4];

function HeatmapTable({
  rows,
  columns,
  cells,
  format,
}: {
  rows: string[];
  columns: string[];
  cells: Map<string, number>;
  format: (value: number) => string;
}) {
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        <thead>
          <tr>
            <th scope="col">
              <span className={styles.srOnly}>Row</span>
            </th>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              {columns.map((column) => {
                const value = cells.get(cellKey(row, column));
                return <td key={column}>{value === undefined ? "—" : format(value)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Heatmap({
  rows,
  columns,
  data,
  valueFormatter = formatValue,
  title,
  description,
  className,
  ref,
  ...rest
}: HeatmapProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusAt, setFocusAt] = useState({ row: 0, column: 0 });
  const [tip, setTip] = useState<Tip | null>(null);

  const cells = useMemo(() => cellMap(rows, columns, data), [rows, columns, data]);
  const max = useMemo(() => maxValue(cells), [cells]);
  const isEmpty = rows.length === 0 || columns.length === 0 || cells.size === 0;
  const gridLabel = title ?? "Heatmap";

  const textFor = (row: string, column: string) => {
    const value = cells.get(cellKey(row, column));
    return value === undefined ? "No data" : valueFormatter(value);
  };

  const showTip = (row: number, column: number, target: HTMLElement) => {
    const plot = plotRef.current;
    if (!plot) return;
    const box = plot.getBoundingClientRect();
    const cell = target.getBoundingClientRect();
    const flip = cell.left + cell.width / 2 - box.left > box.width * 0.6;
    setTip({
      row,
      column,
      x: (flip ? cell.left : cell.right) - box.left,
      y: cell.top + cell.height / 2 - box.top,
      flip,
    });
  };

  const focusCell = (row: number, column: number) => {
    setFocusAt({ row, column });
    gridRef.current?.querySelector<HTMLElement>(`[data-cell="${row}-${column}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = moveFocus(focusAt, event.key, { rows: rows.length, columns: columns.length }, event.ctrlKey || event.metaKey);
    if (!next) return;
    event.preventDefault();
    focusCell(next.row, next.column);
  };

  // Scrolling moves the cells under a fixed tooltip: follow a focused cell, drop a hover tooltip.
  const onScroll = () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && gridRef.current?.contains(active) && active.dataset.cell) {
      const [row, column] = active.dataset.cell.split("-").map(Number);
      showTip(row, column, active);
      return;
    }
    setTip(null);
  };

  const legend = (
    <div className={styles.legend}>
      <span className={styles.legendValue}>{valueFormatter(0)}</span>
      <span className={styles.legendScale} aria-hidden>
        {Array.from({ length: LEVELS + 1 }, (_, level) => (
          <span key={level} className={cx(styles.swatch, LEVEL_CLASS[level])} />
        ))}
      </span>
      <span className={styles.legendValue}>{valueFormatter(max)}</span>
      <span className={styles.srOnly}>Lighter cells are lower, darker cells are higher.</span>
    </div>
  );

  return (
    <ChartFrame
      {...rest}
      {...nisthaAttr("heatmap", rest)}
      ref={ref}
      title={title}
      description={description}
      table={<HeatmapTable rows={rows} columns={columns} cells={cells} format={valueFormatter} />}
      isEmpty={isEmpty}
      className={className}
    >
      <div ref={plotRef} className={styles.plot}>
        <div className={styles.scroller} onScroll={onScroll}>
          <div
            ref={gridRef}
            role="grid"
            aria-label={gridLabel}
            className={styles.grid}
            style={{ "--heatmap-columns": columns.length } as CSSProperties}
            onKeyDown={onKeyDown}
          >
            <div role="row" className={styles.row}>
              <span role="columnheader" className={styles.corner}>
                <span className={styles.srOnly}>Row</span>
              </span>
              {columns.map((column) => (
                <span key={column} role="columnheader" className={styles.columnLabel}>
                  {column}
                </span>
              ))}
            </div>
            {rows.map((row, rowIndex) => (
              <div key={row} role="row" className={styles.row}>
                <span role="rowheader" className={styles.rowLabel}>
                  {row}
                </span>
                {columns.map((column, columnIndex) => {
                  const value = cells.get(cellKey(row, column));
                  const level = levelOf(value, max);
                  const isFocusStop = focusAt.row === rowIndex && focusAt.column === columnIndex;
                  return (
                    <span
                      key={column}
                      role="gridcell"
                      data-cell={`${rowIndex}-${columnIndex}`}
                      tabIndex={isFocusStop ? 0 : -1}
                      aria-label={`${row}, ${column}: ${textFor(row, column)}`}
                      className={cx(styles.cell, LEVEL_CLASS[level], value === undefined && styles.missing)}
                      onMouseEnter={(event) => showTip(rowIndex, columnIndex, event.currentTarget)}
                      onMouseLeave={() => setTip(null)}
                      onFocus={(event) => {
                        setFocusAt({ row: rowIndex, column: columnIndex });
                        showTip(rowIndex, columnIndex, event.currentTarget);
                      }}
                      onBlur={() => setTip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {legend}
        {tip ? (
          <div
            className={cx(frameStyles.tooltip, tip.flip && frameStyles.tooltipFlip)}
            style={{ left: tip.x, top: tip.y }}
            role="status"
            aria-live="polite"
          >
            <p className={frameStyles.tooltipTitle}>
              {rows[tip.row]} · {columns[tip.column]}
            </p>
            <div className={frameStyles.tooltipRow}>
              <span
                className={cx(frameStyles.tooltipKey, styles.tipKey, LEVEL_CLASS[levelOf(cells.get(cellKey(rows[tip.row], columns[tip.column])), max)])}
                aria-hidden
              />
              <span className={frameStyles.tooltipValue}>{textFor(rows[tip.row], columns[tip.column])}</span>
            </div>
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}
