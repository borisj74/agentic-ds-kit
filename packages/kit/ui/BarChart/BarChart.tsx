"use client";

import { useMemo, useState } from "react";
import { ChartFrame } from "../shared/ChartFrame";
import frameStyles from "../shared/ChartFrame.module.css";
import {
  CHART_MARGINS,
  colorAt,
  formatAxisTick,
  formatValue,
  linearScale,
  niceTicks,
  normalizeBarInput,
  seriesExtent,
  type ChartSeries,
} from "../shared/chartMath";
import { useChartSize } from "../shared/useChartSize";
import type { BarChartProps } from "./BarChart.types";
import styles from "./BarChart.module.css";

export type { BarChartProps, BarChartOrientation } from "./BarChart.types";

const DEFAULT_MAX_BAR_WIDTH = 32;

type BarGeom = {
  key: string;
  category: string;
  series: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  cx: number;
  cy: number;
};

type TickMark = {
  value: number;
  label: string;
  x: number;
  y: number;
  gridX1: number;
  gridX2: number;
  gridY1: number;
  gridY2: number;
};

type CategoryLabel = { label: string; x: number; y: number };

const EMPTY_LAYOUT = {
  bars: [] as BarGeom[],
  ticks: [] as TickMark[],
  categoryLabels: [] as CategoryLabel[],
  baseline: 0,
  plotLeft: 0,
  plotRight: 0,
  plotTop: 0,
  plotBottom: 0,
};

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

function Legend({
  series,
  active,
  onActivate,
  onClear,
}: {
  series: ChartSeries[];
  active: string | null;
  onActivate: (label: string) => void;
  onClear: () => void;
}) {
  return (
    <ul className={`${frameStyles.legend} ${frameStyles.legendInteractive}`}>
      {series.map((entry) => {
        const dimmed = Boolean(active) && active !== entry.label;
        return (
          <li key={entry.label}>
            <button
              type="button"
              className={`${frameStyles.legendItem} ${frameStyles.legendButton}${dimmed ? ` ${frameStyles.legendItemDimmed}` : ""}`}
              onMouseEnter={() => onActivate(entry.label)}
              onMouseLeave={onClear}
              onFocus={() => onActivate(entry.label)}
              onBlur={onClear}
            >
              <span
                className={`${frameStyles.legendSwatch} ${frameStyles.legendSwatchPill}`}
                style={{ background: entry.color }}
                aria-hidden
              />
              <span>{entry.label}</span>
            </button>
          </li>
        );
      })}
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
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const { ref, width } = useChartSize(height);

  const { categories, series } = useMemo(
    () => normalizeBarInput({ data, categories: categoriesProp, series: seriesProp }),
    [data, categoriesProp, seriesProp],
  );

  const hasValues = series.some((entry) => entry.data.some((value) => Number.isFinite(value) && value !== 0));
  const isEmpty = !categories.length || !series.length || !hasValues;
  const isVertical = orientation === "vertical";
  const isSingleSeries = series.length === 1;
  const labelledSeries = series.filter((entry) => entry.label.trim().length > 0);
  const showLegend = labelledSeries.length >= 2;

  const layout = useMemo(() => {
    if (isEmpty || width <= 0) return EMPTY_LAYOUT;

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
    const bandPad = groupSize * 0.24;
    const barGap = seriesCount > 1 ? 4 : 0;
    const inner = Math.max(groupSize - bandPad * 2, 8);
    const barWidth = Math.min(
      DEFAULT_MAX_BAR_WIDTH,
      Math.max(8, (inner - barGap * Math.max(seriesCount - 1, 0)) / seriesCount),
    );
    const clusterWidth = seriesCount * barWidth + Math.max(seriesCount - 1, 0) * barGap;

    const bars: BarGeom[] = categories.flatMap((category, categoryIndex) => {
      const groupStart = isVertical
        ? plotLeft + categoryIndex * groupSize
        : plotTop + categoryIndex * groupSize;
      const clusterStart = groupStart + (groupSize - clusterWidth) / 2;
      return series.map((entry, seriesIndex) => {
        const value = entry.data[categoryIndex] ?? 0;
        const start = clusterStart + seriesIndex * (barWidth + barGap);
        const end = valueScale(value);
        const origin = valueScale(0);
        const color = isSingleSeries
          ? colorAt(categoryIndex, data?.[categoryIndex]?.color)
          : (entry.color ?? colorAt(seriesIndex));
        const x = isVertical ? start : Math.min(origin, end);
        const y = isVertical ? Math.min(origin, end) : start;
        const barW = isVertical ? barWidth : Math.abs(end - origin);
        const barH = isVertical ? Math.abs(end - origin) : barWidth;
        return {
          key: `${category}-${entry.label}`,
          category,
          series: entry.label,
          color,
          x,
          y,
          width: barW,
          height: barH,
          value,
          cx: x + barW / 2,
          cy: y + barH / 2,
        };
      });
    });

    const tickMarks: TickMark[] = ticks.map((tick) => ({
      value: tick,
      label: formatAxisTick(tick),
      x: isVertical ? plotLeft - 8 : valueScale(tick),
      y: isVertical ? valueScale(tick) : plotBottom + 18,
      gridX1: isVertical ? plotLeft : valueScale(tick),
      gridX2: isVertical ? plotRight : valueScale(tick),
      gridY1: isVertical ? valueScale(tick) : plotTop,
      gridY2: isVertical ? valueScale(tick) : plotBottom,
    }));

    const categoryLabels: CategoryLabel[] = categories.map((label, index) => ({
      label,
      x: isVertical ? plotLeft + index * groupSize + groupSize / 2 : plotLeft - 8,
      y: isVertical ? plotBottom + 18 : plotTop + index * groupSize + groupSize / 2,
    }));

    return {
      bars,
      ticks: tickMarks,
      categoryLabels,
      baseline: valueScale(0),
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
    };
  }, [categories, data, height, isEmpty, isSingleSeries, isVertical, series, width]);

  const active = layout.bars.find((bar) => bar.key === activeBar) ?? null;
  const flipTooltip = Boolean(active && width > 0 && active.cx > width * 0.6);

  const isDimmed = (bar: BarGeom) => {
    if (highlighted) return bar.series !== highlighted;
    if (activeBar) return bar.key !== activeBar;
    return false;
  };

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={showLegend ? (
        <Legend
          series={labelledSeries}
          active={highlighted}
          onActivate={setHighlighted}
          onClear={() => setHighlighted(null)}
        />
      ) : undefined}
      table={showTable ? <ChartTable categories={categories} series={series} /> : undefined}
      isEmpty={isEmpty}
      emptyLabel={emptyLabel}
      isLoading={isLoading}
      className={className}
    >
      <div ref={ref} className={styles.plot}>
        <svg className={styles.chart} width={width || "100%"} height={height} role="img" aria-label={title}>
          {showGrid
            ? layout.ticks.map((tick) => {
                const horizontal = tick.gridY1 === tick.gridY2;
                const x1 = horizontal ? tick.gridX1 : Math.round(tick.gridX1) + 0.5;
                const x2 = horizontal ? tick.gridX2 : Math.round(tick.gridX2) + 0.5;
                const y1 = horizontal ? Math.round(tick.gridY1) + 0.5 : tick.gridY1;
                const y2 = horizontal ? Math.round(tick.gridY2) + 0.5 : tick.gridY2;
                return (
                  <line
                    key={tick.value}
                    x1={x1}
                    x2={x2}
                    y1={y1}
                    y2={y2}
                    className={styles.grid}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })
            : null}
          {width > 0 && !showGrid ? (
            <>
              <line
                className={styles.axis}
                x1={layout.plotLeft}
                x2={layout.plotLeft}
                y1={layout.plotTop}
                y2={layout.plotBottom}
              />
              <line
                className={styles.axis}
                x1={layout.plotLeft}
                x2={layout.plotRight}
                y1={layout.plotBottom}
                y2={layout.plotBottom}
              />
            </>
          ) : null}
          {layout.bars.map((bar) => (
            <rect
              key={bar.key}
              className={`${styles.bar}${isDimmed(bar) ? ` ${styles.barDimmed}` : ""}`}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              rx={2}
              tabIndex={0}
              role="button"
              aria-label={`${bar.category} ${bar.series}: ${formatValue(bar.value)}`}
              onMouseEnter={() => setActiveBar(bar.key)}
              onMouseLeave={() => setActiveBar(null)}
              onFocus={() => setActiveBar(bar.key)}
              onBlur={() => setActiveBar(null)}
            />
          ))}
          {layout.categoryLabels.map((entry) => (
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
        {active ? (
          <div
            className={`${frameStyles.tooltip}${flipTooltip ? ` ${frameStyles.tooltipFlip}` : ""}`}
            style={{ left: active.cx, top: active.cy }}
            role="status"
            aria-live="polite"
          >
            <p className={frameStyles.tooltipTitle}>{active.category}</p>
            <div className={frameStyles.tooltipRow}>
              <span className={frameStyles.tooltipKey} style={{ background: active.color }} aria-hidden />
              <span className={frameStyles.tooltipShare}>{active.series}</span>
              <span className={frameStyles.tooltipValue}>{formatValue(active.value)}</span>
            </div>
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}
