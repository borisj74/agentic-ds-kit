"use client";

import { useId, useMemo, useState } from "react";
import { DataTable } from "../DataTable";
import { LineChart } from "../LineChart";
import { Scoreboard } from "../Scoreboard";
import { SegmentedControl } from "../SegmentedControl";
import { cx } from "../shared/cx";
import { cardsFor, resolveMetric, resolveRange, seriesFor, topRows } from "./kpiBoard.logic";
import type { KpiBoardProps } from "./KpiBoard.types";
import styles from "./KpiBoard.module.css";

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
    <section {...rest} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
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
        items={cards.map(({ id, ...card }) => ({ ...card, onClick: () => select(id) }))}
      />

      {metric ? (
        <div className={cx("layout-split--primary", styles.split)}>
          <LineChart
            title={`${metric.label}${rangeText}`}
            description={cards.find((card) => card.id === metric.id)?.value}
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
