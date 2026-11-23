"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { Badge, type BadgeTone } from "../Badge";
import { Button } from "../Button";
import { formatValue } from "../shared/chartMath";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { barPercent, changeFrom, scaleBase, shareText, sortRows, safeValue, visibleCount, type BarListChange } from "./barList.logic";
import type { BarListProps } from "./BarList.types";
import styles from "./BarList.module.css";

export type { BarListDatum, BarListProps, BarListScale, BarListSort } from "./BarList.types";

/** The change Badge says Up, Down or No change in words, so its tone is never the only signal. */
const CHANGE_TONE: Record<BarListChange["direction"], BadgeTone> = { up: "success", down: "danger", flat: "neutral" };

export function BarList({
  data,
  sort = "descending",
  scale = "max",
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
  // Bars are sized against all of data (its largest value, or its sum), so they keep their length when more rows open.
  const base = useMemo(() => scaleBase(rows, scale), [rows, scale]);
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
            const bar = { "--barlist-length": `${barPercent(row.value, base)}%` } as CSSProperties;
            const meta = [scale === "total" ? shareText(row.value, base) : null, row.meta].filter(Boolean).join(" · ");
            const change = changeFrom(row.value, row.previous);
            return (
              <li key={row.label} className={cx(styles.row, meta && styles.tall)}>
                <span className={styles.track} style={bar}>
                  <span className={styles.bar} aria-hidden />
                  <span className={styles.lead}>
                    {row.media ? (
                      <span className={styles.media} aria-hidden>
                        {row.media}
                      </span>
                    ) : null}
                    <span className={styles.text}>
                      {row.href ? (
                        <a className={cx(styles.label, styles.link)} href={row.href}>
                          {row.label}
                        </a>
                      ) : (
                        <span className={styles.label}>{row.label}</span>
                      )}
                      {meta ? <span className={styles.meta}>{meta}</span> : null}
                    </span>
                  </span>
                </span>
                <span className={styles.end}>
                  <span className={styles.value}>{value}</span>
                  {change ? (
                    <Badge size="sm" tone={CHANGE_TONE[change.direction]}>
                      {change.text}
                    </Badge>
                  ) : null}
                </span>
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
