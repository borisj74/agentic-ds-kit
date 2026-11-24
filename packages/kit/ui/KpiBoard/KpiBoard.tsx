"use client";

import { useId, useMemo, useState } from "react";
import { mergeRefs } from "../shared/mergeRefs";
import { useNarrow } from "../shared/useNarrow";
import { DataTable } from "../DataTable";
import { LineChart } from "../LineChart";
import { Scoreboard } from "../Scoreboard";
import { SegmentedControl } from "../SegmentedControl";
import { cx } from "../shared/cx";
import { cardsFor, resolveMetric, resolveRange, seriesFor, topRows } from "./kpiBoard.logic";
import type { KpiBoardProps } from "./KpiBoard.types";
import styles from "./KpiBoard.module.css";
import { nisthaAttr } from "../shared/inspect";

/** Block width (rem) below which the strip turns divided: --grid-breakpoint-sm. */
const NARROW_REM = 40;

export type { KpiBoardProps, KpiBoardMetric, KpiBoardRange, KpiBoardValue } from "./KpiBoard.types";

/**
 * Block: the top of a dashboard. A Scoreboard of KPIs that doubles as the picker, a LineChart of
 * the picked KPI, and a DataTable of the top rows behind it, all under one range control.
 */
export function KpiBoard(props: KpiBoardProps) {
  const {
    metrics,
    series,
    rows,
    ranges,
    range: rangeProp,
    defaultRange,
    onRangeChange,
    selectedMetric: selectedProp,
    defaultSelectedMetric,
    onSelectedMetricChange,
    rowLimit = 5,
    description,
    title = "Key metrics",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  // Below --grid-breakpoint-sm (40rem) of block width the strip turns divided and goes 2×2.
  const { ref: measureRef, narrow } = useNarrow<HTMLElement>(NARROW_REM);
  const rootRef = useMemo(() => mergeRefs<HTMLElement>(measureRef, ref), [measureRef, ref]);
  const [innerRange, setInnerRange] = useState(defaultRange);
  const [innerSelected, setInnerSelected] = useState(defaultSelectedMetric);
  const range = resolveRange(ranges, rangeProp ?? innerRange);
  const metric = resolveMetric(metrics, selectedProp ?? innerSelected);

  const cards = useMemo(() => cardsFor(metrics, range, metric?.id), [metrics, range, metric?.id]);
  const data = useMemo(() => seriesFor(series, metric?.id, range?.value), [series, metric?.id, range?.value]);
  const top = useMemo(() => topRows(rows, metric, range?.value, rowLimit), [rows, metric, range?.value, rowLimit]);

  function changeRange(next: string) {
    if (rangeProp === undefined) setInnerRange(next);
    onRangeChange?.(next);
  }

  function select(next: string) {
    if (selectedProp === undefined) setInnerSelected(next);
    onSelectedMetricChange?.(next);
  }

  const rangeText = range ? ` · ${range.label}` : "";
  const rowsTitle = metric?.rowsTitle ?? "Top rows";

  return (
    <section {...rest} {...nisthaAttr("kpiboard", rest)} ref={rootRef} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description ? <p className={styles.lead}>{description}</p> : null}
        </div>
        {ranges.length ? (
          <SegmentedControl
            size="sm"
            ariaLabel="Range"
            value={range?.value}
            onChange={changeRange}
            items={ranges.map((item) => ({ value: item.value, label: item.label }))}
          />
        ) : null}
      </header>

      <Scoreboard
        aria-label={`${title}, pick one to chart`}
        appearance={narrow ? "divided" : "cards"}
        selectable
        value={metric?.id}
        onValueChange={select}
        items={cards.map(({ selected: _selected, badge, ...card }) => {
          void _selected;
          return badge ? { ...card, badge, badgeTone: "brand" as const } : card;
        })}
      />

      {metric ? (
        <div className={cx("layout-split--primary", styles.split)}>
          <LineChart
            title={`${metric.label}${rangeText}`}
            data={data}
            variant="area"
            height={240}
            emptyLabel="No data for this range"
          />
          <DataTable
            caption={`${rowsTitle}${rangeText}`}
            cellSize="sm"
            columns={metric.columns}
            rows={top}
            emptyMessage="No rows for this range"
          />
        </div>
      ) : null}
    </section>
  );
}
