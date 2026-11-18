"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { Button } from "../Button";
import { formatValue } from "../shared/chartMath";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { barPercent, safeValue, sortRows, visibleCount } from "./barList.logic";
import type { BarListProps } from "./BarList.types";
import styles from "./BarList.module.css";

export type { BarListDatum, BarListProps, BarListSort } from "./BarList.types";

export function BarList({
  data,
  sort = "descending",
  maxRows,
  valueFormatter = formatValue,
  label = "Ranked list",
  className,
  ref,
  ...rest
}: BarListProps) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  const rows = useMemo(() => sortRows(data, sort), [data, sort]);
  // Bars are sized against the largest value in all of data, so they keep their length when more rows open.
  const max = useMemo(() => rows.reduce((top, row) => Math.max(top, safeValue(row.value)), 0), [rows]);
  const shown = visibleCount(rows.length, maxRows, expanded);
  const canToggle = maxRows !== undefined && rows.length > visibleCount(rows.length, maxRows, false);

  return (
    <div {...rest} {...nisthaAttr("barlist", rest)} ref={ref} className={cx(styles.root, className)}>
      {rows.length === 0 ? (
        <p className={styles.empty}>No data</p>
      ) : (
        <ol id={listId} className={styles.list} aria-label={label}>
          {rows.slice(0, shown).map((row) => {
            const value = valueFormatter(safeValue(row.value));
            const bar = { "--barlist-length": `${barPercent(row.value, max)}%` } as CSSProperties;
            return (
              <li key={row.label} className={styles.row}>
                <span className={styles.track} style={bar}>
                  <span className={styles.bar} aria-hidden />
                  {row.href ? (
                    <a className={cx(styles.label, styles.link)} href={row.href}>
                      {row.label}
                    </a>
                  ) : (
                    <span className={styles.label}>{row.label}</span>
                  )}
                </span>
                <span className={styles.value}>{value}</span>
              </li>
            );
          })}
        </ol>
      )}
      {canToggle ? (
        <div className={styles.footer}>
          <Button
            appearance="ghost"
            mode="neutral"
            size="sm"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? "Show fewer" : `Show all ${rows.length}`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
