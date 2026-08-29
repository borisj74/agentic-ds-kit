"use client";

import { useMemo, useState } from "react";
import { ChartFrame } from "@/ui/shared/ChartFrame";
import frameStyles from "@/ui/shared/ChartFrame.module.css";
import {
  CHART_MARGINS,
  formatAxisTick,
  formatValue,
  linearScale,
  niceTicks,
  normalizeBarInput,
  seriesExtent,
  type ChartSeries,
} from "@/ui/shared/chartMath";
import { useChartSize } from "@/ui/shared/useChartSize";
import type { BarChartProps } from "./BarChart.types";
import styles from "./BarChart.module.css";

export type { BarChartProps, BarChartOrientation } from "./BarChart.types";

const DEFAULT_MAX_BAR_WIDTH = 40;

function ChartTable({ categories, series }: { categories: string[]; series: ChartSeries[] }) {
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        <thead>
          <tr>
            <th scope="col">Category</th>
            {series.map((entry) => (
              <th key={entry.label} scope="col">
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category}>
              <th scope="row">{category}</th>
              {series.map((entry) => (
                <td key={entry.label}>{formatValue(entry.data[index] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Legend({ series }: { series: ChartSeries[] }) {
  return (
    <ul className={frameStyles.legend}>
      {series.map((entry) => (
        <li key={entry.label} className={frameStyles.legendItem}>
          <span className={frameStyles.legendSwatch} style={{ background: entry.color }} aria-hidden />
          <span>{entry.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function BarChart({
  data,
  categories: categoriesProp,
  series: seriesProp,
  title,
  description,
  orientation = "vertical",
  height = 240,
  showGrid = true,
  showTable = true,
  emptyLabel = "No data for this range",
  isLoading = false,
  className = "",
}: BarChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const { ref, width } = useChartSize(height);

  const { categories, series } = useMemo(
    () => normalizeBarInput({ data, categories: categoriesProp, series: seriesProp }),
    [data, categoriesProp, seriesProp],
  );

  const hasValues = series.some((entry) => entry.data.some((value) => Number.isFinite(value) && value !== 0));
  const isEmpty = !categories.length || !series.length || !hasValues;
  const isVertical = orientation === "vertical";

  const layout = useMemo(() => {
    if (isEmpty || width <= 0) return { bars: [] as Array<Record<string, unknown>>, ticks: [], baseline: 0 };

    const plotLeft = CHART_MARGINS.left;
    const plotRight = width - CHART_MARGINS.right;
    const plotTop = CHART_MARGINS.top;
    const plotBottom = height - CHART_MARGINS.bottom;

    const [rawMin, rawMax] = seriesExtent(series, { includeZero: true });
    const { ticks, min, max } = niceTicks(rawMin, rawMax, 5);
    const valueScale = linearScale(
      [min, max],
      isVertical ? [plotBottom, plotTop] : [plotLeft, plotRight],
    );

    const groupCount = categories.length;
    const seriesCount = series.length;
    const plotSpan = isVertical ? plotRight - plotLeft : plotBottom - plotTop;
    const groupSize = plotSpan / Math.max(groupCount, 1);
    const barGap = 4;
    const barWidth = Math.min(
      DEFAULT_MAX_BAR_WIDTH,
      Math.max(8, (groupSize - barGap * (seriesCount + 1)) / seriesCount),
    );

    const bars = categories.flatMap((category, categoryIndex) => {
      const groupStart = isVertical
        ? plotLeft + categoryIndex * groupSize
        : plotTop + categoryIndex * groupSize;
      return series.map((entry, seriesIndex) => {
        const value = entry.data[categoryIndex] ?? 0;
        const offset = barGap + seriesIndex * (barWidth + barGap);
        const start = groupStart + offset;
        const end = valueScale(value);
        const baseline = valueScale(0);
        return {
          key: `${category}-${entry.label}`,
          category,
          series: entry.label,
          color: entry.color ?? "var(--fill-brand)",
          x: isVertical ? start : Math.min(baseline, end),
          y: isVertical ? Math.min(baseline, end) : start,
          width: isVertical ? barWidth : Math.abs(end - baseline),
          height: isVertical ? Math.abs(end - baseline) : barWidth,
          value,
        };
      });
    });

    const tickMarks = ticks.map((tick) => ({
      value: tick,
      label: formatAxisTick(tick),
      x: isVertical ? plotLeft - 8 : valueScale(tick),
      y: isVertical ? valueScale(tick) : plotBottom + 18,
      gridX1: isVertical ? plotLeft : valueScale(tick),
      gridX2: isVertical ? plotRight : valueScale(tick),
      gridY1: isVertical ? valueScale(tick) : plotTop,
      gridY2: isVertical ? valueScale(tick) : plotBottom,
    }));

    const categoryLabels = categories.map((label, index) => ({
      label,
      x: isVertical ? plotLeft + index * groupSize + groupSize / 2 : plotLeft - 8,
      y: isVertical ? plotBottom + 18 : plotTop + index * groupSize + groupSize / 2,
    }));

    return { bars, ticks: tickMarks, categoryLabels, baseline: valueScale(0) };
  }, [categories, height, isEmpty, isVertical, series, width]);

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={series.length > 1 ? <Legend series={series} /> : undefined}
      table={showTable ? <ChartTable categories={categories} series={series} /> : undefined}
      isEmpty={isEmpty}
      emptyLabel={emptyLabel}
      isLoading={isLoading}
      className={className}
    >
      <div ref={ref} className={styles.wrap}>
        <svg className={styles.chart} width={width || "100%"} height={height} role="img" aria-label={title}>
          {showGrid
            ? layout.ticks.map((tick) => (
                <line
                  key={tick.value}
                  x1={tick.gridX1}
                  x2={tick.gridX2}
                  y1={tick.gridY1}
                  y2={tick.gridY2}
                  className={styles.grid}
                />
              ))
            : null}
          {layout.bars.map((bar) => (
            <rect
              key={String(bar.key)}
              x={Number(bar.x)}
              y={Number(bar.y)}
              width={Number(bar.width)}
              height={Number(bar.height)}
              fill={String(bar.color)}
              rx={2}
              opacity={active && active !== String(bar.key) ? 0.45 : 1}
              onMouseEnter={() => setActive(String(bar.key))}
              onMouseLeave={() => setActive(null)}
              aria-label={`${String(bar.category)} ${String(bar.series)}: ${formatValue(Number(bar.value))}`}
            />
          ))}
          {layout.categoryLabels?.map((entry) => (
            <text
              key={entry.label}
              x={entry.x}
              y={entry.y}
              className={styles.categoryLabel}
              textAnchor={isVertical ? "middle" : "end"}
              dominantBaseline={isVertical ? "hanging" : "middle"}
            >
              {entry.label}
            </text>
          ))}
          {layout.ticks.map((tick) => (
            <text
              key={`tick-${tick.value}`}
              x={tick.x}
              y={tick.y}
              className={styles.tickLabel}
              textAnchor={isVertical ? "end" : "middle"}
              dominantBaseline={isVertical ? "middle" : "hanging"}
            >
              {tick.label}
            </text>
          ))}
        </svg>
      </div>
    </ChartFrame>
  );
}
