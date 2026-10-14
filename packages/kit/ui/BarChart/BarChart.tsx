"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ChartFrame } from "../shared/ChartFrame";
import frameStyles from "../shared/ChartFrame.module.css";
import motionStyles from "../shared/chartMotion.module.css";
import {
  axisLabels,
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
import { measureLabel } from "../shared/measureLabel";
import { useChartSize } from "../shared/useChartSize";
import type { BarChartProps } from "./BarChart.types";
import styles from "./BarChart.module.css";

export type { BarChartProps, BarChartOrientation } from "./BarChart.types";

const DEFAULT_MAX_BAR_WIDTH = 32;
/** Dense layout (many categories): thinner padding and gaps before bars may shrink below 8px. */
const DENSE_BAND_PAD = 0.15;
const DENSE_BAR_GAP = 2;
const DENSE_MIN_BAR_WIDTH = 6;

type BarGeom = {
  key: string;
  categoryIndex: number;
  seriesIndex: number;
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

type CategoryLabel = { index: number; label: string; x: number; y: number };

const EMPTY_LAYOUT = {
  bars: [] as BarGeom[],
  ticks: [] as TickMark[],
  categoryLabels: [] as CategoryLabel[],
  baseline: 0,
  plotLeft: 0,
  plotRight: 0,
  plotTop: 0,
  plotBottom: 0,
  contentWidth: 0,
  scrolls: false,
};

function ChartTable({ categories, series }: { categories: string[]; series: ChartSeries[] }) {
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        <thead>
          <tr>
            <th scope="col">Category</th>
            {series.map((entry, seriesIndex) => (
              <th key={seriesIndex} scope="col">
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={index}>
              <th scope="row">{category}</th>
              {series.map((entry, seriesIndex) => (
                <td key={seriesIndex}>{formatValue(entry.data[index] ?? 0)}</td>
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
  active: number | null;
  onActivate: (seriesIndex: number) => void;
  onClear: () => void;
}) {
  return (
    <ul className={`${frameStyles.legend} ${frameStyles.legendInteractive}`}>
      {series.map((entry, seriesIndex) => {
        if (!entry.label.trim()) return null;
        const dimmed = active !== null && active !== seriesIndex;
        return (
          <li key={seriesIndex}>
            <button
              type="button"
              className={`${frameStyles.legendItem} ${frameStyles.legendButton}${dimmed ? ` ${frameStyles.legendItemDimmed}` : ""}`}
              onMouseEnter={() => onActivate(seriesIndex)}
              onMouseLeave={onClear}
              onFocus={() => onActivate(seriesIndex)}
              onBlur={onClear}
            >
              <span
                className={`${frameStyles.legendSwatch} ${frameStyles.legendSwatchDot}`}
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
  tickInterval,
  formatLabel,
  animate = false,
  className,
  ref: rootRef,
  ...rest
}: BarChartProps) {
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { ref, width } = useChartSize(height);

  const { categories, series } = useMemo(
    () => normalizeBarInput({ data, categories: categoriesProp, series: seriesProp }),
    [data, categoriesProp, seriesProp],
  );

  const hasValues = series.some((entry) => entry.data.some((value) => Number.isFinite(value) && value !== 0));
  const isEmpty = !categories.length || !series.length || !hasValues;
  const isVertical = orientation === "vertical";
  const isSingleSeries = series.length === 1;
  const showLegend = series.filter((entry) => entry.label.trim().length > 0).length >= 2;

  const layout = useMemo(() => {
    if (isEmpty || width <= 0) return EMPTY_LAYOUT;

    const groupCount = categories.length;
    const seriesCount = series.length;
    const plotTop = CHART_MARGINS.top;
    const plotBottom = height - CHART_MARGINS.bottom;
    const naturalSpan = isVertical
      ? width - CHART_MARGINS.left - CHART_MARGINS.right
      : plotBottom - plotTop;
    const naturalGroup = naturalSpan / Math.max(groupCount, 1);
    const fitsRegular =
      (naturalGroup * (1 - 0.48) - (seriesCount > 1 ? 4 : 0) * Math.max(seriesCount - 1, 0)) / seriesCount >= 8;
    const denseGap = seriesCount > 1 ? DENSE_BAR_GAP : 0;
    const denseMinGroup =
      (seriesCount * DENSE_MIN_BAR_WIDTH + denseGap * Math.max(seriesCount - 1, 0)) / (1 - DENSE_BAND_PAD * 2);
    // Vertical charts that cannot fit even dense bars keep a minimum group width and scroll sideways,
    // with the value axis pinned outside the scroller.
    const scrolls = isVertical && !fitsRegular && naturalGroup < denseMinGroup;
    // Scrolled content gets a small inset on both ends so edge labels are not clipped.
    const contentWidth = scrolls
      ? groupCount * denseMinGroup + CHART_MARGINS.right * 2
      : width;

    const plotLeft = scrolls ? CHART_MARGINS.right : CHART_MARGINS.left;
    const plotRight = contentWidth - CHART_MARGINS.right;

    const [rawMin, rawMax] = seriesExtent(series, { includeZero: true });
    const { ticks, min, max } = niceTicks(rawMin, rawMax, 5);
    const valueScale = linearScale(
      [min, max],
      isVertical ? [plotBottom, plotTop] : [plotLeft, plotRight],
    );

    const plotSpan = isVertical ? plotRight - plotLeft : plotBottom - plotTop;
    const groupSize = plotSpan / Math.max(groupCount, 1);
    const bandPad = groupSize * (fitsRegular ? 0.24 : DENSE_BAND_PAD);
    const barGap = seriesCount > 1 ? (fitsRegular ? 4 : DENSE_BAR_GAP) : 0;
    const inner = fitsRegular ? Math.max(groupSize - bandPad * 2, 8) : groupSize - bandPad * 2;
    const barWidth = Math.min(
      DEFAULT_MAX_BAR_WIDTH,
      Math.max(fitsRegular ? 8 : 1, (inner - barGap * Math.max(seriesCount - 1, 0)) / seriesCount),
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
          key: `${categoryIndex}-${seriesIndex}`,
          categoryIndex,
          seriesIndex,
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
      x: isVertical ? CHART_MARGINS.left - 8 : valueScale(tick),
      y: isVertical ? valueScale(tick) : plotBottom + 18,
      gridX1: isVertical ? (scrolls ? 0 : plotLeft) : valueScale(tick),
      gridX2: isVertical ? plotRight : valueScale(tick),
      gridY1: isVertical ? valueScale(tick) : plotTop,
      gridY2: isVertical ? valueScale(tick) : plotBottom,
    }));

    const categoryLabels: CategoryLabel[] = axisLabels(categories, {
      spacing: groupSize,
      stacked: !isVertical,
      tickInterval,
      formatLabel,
      measure: measureLabel,
    }).map(({ index, label }) => ({
      index,
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
      contentWidth,
      scrolls,
    };
  }, [categories, data, formatLabel, height, isEmpty, isSingleSeries, isVertical, series, tickInterval, width]);

  const active = layout.bars.find((bar) => bar.key === activeBar) ?? null;
  const offsetX = layout.scrolls ? CHART_MARGINS.left - scrollLeft : 0;
  const activeX = active ? active.cx + offsetX : 0;
  const flipTooltip = Boolean(active && width > 0 && activeX > width * 0.6);

  const isDimmed = (bar: BarGeom) => {
    if (highlighted !== null) return bar.seriesIndex !== highlighted;
    if (activeBar) return bar.key !== activeBar;
    return false;
  };

  // Entrance: each bar scales out of the zero line (works for negative values), staggered by category.
  const growClass = isVertical ? motionStyles.barGrowY : motionStyles.barGrowX;
  const lastCategory = Math.max(categories.length - 1, 1);
  const barMotion = (bar: BarGeom): CSSProperties | undefined =>
    animate
      ? ({
          transformOrigin: isVertical ? `${bar.x}px ${layout.baseline}px` : `${layout.baseline}px ${bar.y}px`,
          "--chart-stagger": bar.categoryIndex / lastCategory,
        } as CSSProperties)
      : undefined;

  const tickLabels = layout.ticks.map((tick) => (
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
  ));

  const plot = (
    <svg
      className={styles.chart}
      width={layout.scrolls ? layout.contentWidth : width || "100%"}
      height={height}
      style={layout.scrolls ? { width: layout.contentWidth } : undefined}
      role="img"
      aria-label={title}
    >
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
          {layout.scrolls ? null : (
            <line
              className={styles.axis}
              x1={layout.plotLeft}
              x2={layout.plotLeft}
              y1={layout.plotTop}
              y2={layout.plotBottom}
            />
          )}
          <line
            className={styles.axis}
            x1={layout.scrolls ? 0 : layout.plotLeft}
            x2={layout.plotRight}
            y1={layout.plotBottom}
            y2={layout.plotBottom}
          />
        </>
      ) : null}
      {layout.bars.map((bar) => (
        <rect
          key={bar.key}
          className={`${styles.bar}${isDimmed(bar) ? ` ${styles.barDimmed}` : ""}${animate ? ` ${growClass}` : ""}`}
          style={barMotion(bar)}
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
          key={entry.index}
          x={entry.x}
          y={entry.y}
          className={styles.categoryLabel}
          textAnchor={isVertical ? "middle" : "end"}
          dominantBaseline={isVertical ? "hanging" : "middle"}
        >
          {entry.label}
        </text>
      ))}
      {layout.scrolls ? null : tickLabels}
    </svg>
  );

  return (
    <ChartFrame
      {...rest}
      ref={rootRef}
      title={title}
      description={description}
      legend={showLegend ? (
        <Legend
          series={series}
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
        {layout.scrolls ? (
          <div className={styles.scrollLayout}>
            <svg className={styles.valueAxis} width={CHART_MARGINS.left} height={height} aria-hidden>
              {tickLabels}
              {!showGrid ? (
                <line
                  className={styles.axis}
                  x1={CHART_MARGINS.left - 1}
                  x2={CHART_MARGINS.left - 1}
                  y1={layout.plotTop}
                  y2={layout.plotBottom}
                />
              ) : null}
            </svg>
            <div
              className={styles.scroller}
              tabIndex={0}
              role="region"
              aria-label={`${title ?? "Bar chart"}, scrolls horizontally`}
              onScroll={(event) => setScrollLeft(event.currentTarget.scrollLeft)}
            >
              {plot}
            </div>
          </div>
        ) : (
          plot
        )}
        {active ? (
          <div
            className={`${frameStyles.tooltip}${flipTooltip ? ` ${frameStyles.tooltipFlip}` : ""}`}
            style={{ left: activeX, top: active.cy }}
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
