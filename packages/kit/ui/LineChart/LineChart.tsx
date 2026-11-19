"use client";

import { useId, useMemo, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ChartFrame } from "../shared/ChartFrame";
import frameStyles from "../shared/ChartFrame.module.css";
import motionStyles from "../shared/chartMotion.module.css";
import {
  axisLabels,
  CHART_MARGINS,
  formatAxisTick,
  formatValue,
  linearScale,
  niceTicks,
  normalizeLineInput,
  seriesExtent,
  type ChartSeries,
} from "../shared/chartMath";
import { measureLabel } from "../shared/measureLabel";
import { linearPath, reversedCurveCommands, smoothPath } from "../shared/curve";
import { formatPercent, sharePercent, stackLayers, warnStackMisuse, type StackResult } from "./lineChart.logic";
import { useChartSize } from "../shared/useChartSize";
import type { LineChartProps } from "./LineChart.types";
import styles from "./LineChart.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { LineChartProps, LineChartVariant, LineChartCurve, LineChartStack } from "./LineChart.types";

type Point = { x: number; y: number };

type LineGeom = ChartSeries & {
  seriesIndex: number;
  points: Point[];
  linePath: string;
  areaPath: string;
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

type SampleHit = {
  index: number;
  label: string;
  x: number;
  hitX: number;
  hitWidth: number;
};

const EMPTY_LAYOUT = {
  stacked: null as StackResult | null,
  lines: [] as LineGeom[],
  ticks: [] as TickMark[],
  categoryLabels: [] as CategoryLabel[],
  samples: [] as SampleHit[],
  plotLeft: 0,
  plotRight: 0,
  plotTop: 0,
  plotBottom: 0,
};

function ChartTable({ labels, series, totals }: { labels: string[]; series: ChartSeries[]; totals?: number[] }) {
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        <thead>
          <tr>
            <th scope="col">Label</th>
            {series.map((entry, seriesIndex) => (
              <th key={seriesIndex} scope="col">
                {entry.label}
              </th>
            ))}
            {totals ? <th scope="col">Total</th> : null}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, index) => (
            <tr key={index}>
              <th scope="row">{label}</th>
              {series.map((entry, seriesIndex) => (
                <td key={seriesIndex}>{formatValue(entry.data[index] ?? 0)}</td>
              ))}
              {totals ? <td>{formatValue(totals[index] ?? 0)}</td> : null}
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
  topFirst = false,
}: {
  series: ChartSeries[];
  active: number | null;
  onActivate: (seriesIndex: number) => void;
  onClear: () => void;
  /** Stacked bands list the top layer first, matching what the chart shows. */
  topFirst?: boolean;
}) {
  const order = series.map((_, seriesIndex) => seriesIndex);
  if (topFirst) order.reverse();
  return (
    <ul className={`${frameStyles.legend} ${frameStyles.legendInteractive}`}>
      {order.map((seriesIndex) => {
        const entry = series[seriesIndex];
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
                className={`${frameStyles.legendSwatch} ${frameStyles.legendSwatchLine}`}
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

function nearestIndex(x: number, samples: SampleHit[]) {
  let best = 0;
  let bestDist = Infinity;
  samples.forEach((sample) => {
    const dist = Math.abs(sample.x - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = sample.index;
    }
  });
  return best;
}


export function LineChart({
  data,
  labels: labelsProp,
  series: seriesProp,
  title,
  description,
  variant = "area",
  stack = "none",
  curve = "smooth",
  height = 240,
  showGrid = true,
  showTable = true,
  includeZero = false,
  emptyLabel = "No data for this range",
  isLoading = false,
  tickInterval,
  formatLabel,
  animate = false,
  className,
  ref: rootRef,
  ...rest
}: LineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const { ref, width } = useChartSize(height);
  const chartId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gridMaskId = `linechart-grid-${chartId}`;
  const areaFillId = (seriesIndex: number) => `linechart-area-${chartId}-${seriesIndex}`;

  const { labels, series } = useMemo(
    () => normalizeLineInput({ data, labels: labelsProp, series: seriesProp }),
    [data, labelsProp, seriesProp],
  );

  const hasValues = series.some((entry) => entry.data.some((value) => Number.isFinite(value)));
  const isEmpty = !labels.length || !series.length || !hasValues;
  const isArea = variant === "area";
  const isStacked = isArea && stack !== "none";
  const isPercent = isStacked && stack === "percent";
  warnStackMisuse(stack, isArea, series);
  const showLegend = series.filter((entry) => entry.label.trim().length > 0).length >= 2;

  const layout = useMemo(() => {
    if (isEmpty || width <= 0) return EMPTY_LAYOUT;

    const plotLeft = CHART_MARGINS.left;
    const plotRight = width - CHART_MARGINS.right;
    const plotTop = CHART_MARGINS.top;
    const plotBottom = height - CHART_MARGINS.bottom;

    // About one value label per 40px of plot (2 to 4): quiet guides, and short charts don't stack labels.
    const tickCount = Math.max(2, Math.min(4, Math.floor((plotBottom - plotTop) / 40) + 1));
    // Stacked: the axis runs from 0 to the largest total (or 0–100% in percent mode).
    const stacked = isStacked ? stackLayers(series, labels.length, isPercent ? "percent" : "stacked") : null;
    const [rawMin, rawMax] = stacked ? [0, stacked.max || 1] : seriesExtent(series, { includeZero });
    const { ticks, min, max } = niceTicks(rawMin, rawMax, tickCount);
    const yScale = linearScale([min, max], [plotBottom, plotTop]);
    const xScale = linearScale([0, Math.max(labels.length - 1, 1)], [plotLeft, plotRight]);
    const draw = (points: Point[]) => (curve === "linear" ? linearPath(points) : smoothPath(points));

    const lines: LineGeom[] = stacked
      ? stacked.layers.map((layer) => {
          // Each band runs along its own top edge, then back along the band below (or the floor), so
          // neighbouring bands share one edge with no gap.
          const points = labels.map((_, index) => ({ x: xScale(index), y: yScale(layer.upper[index]) }));
          const below = labels.map((_, index) => ({ x: xScale(index), y: yScale(layer.lower[index]) }));
          const linePath = draw(points);
          const last = below[below.length - 1];
          const back = layer.seriesIndex === 0
            ? `L ${last?.x ?? plotRight} ${yScale(0)} L ${below[0]?.x ?? plotLeft} ${yScale(0)}`
            : `L ${last?.x ?? plotRight} ${last?.y ?? plotBottom} ${reversedCurveCommands(below, curve === "linear" ? "linear" : "smooth")}`;
          const entry = series[layer.seriesIndex];
          return { ...entry, seriesIndex: layer.seriesIndex, points, linePath, areaPath: `${linePath} ${back} Z` };
        })
      : series.map((entry, seriesIndex) => {
          const points = labels.map((_, index) => ({
            x: xScale(index),
            y: yScale(entry.data[index] ?? 0),
          }));
          const linePath = draw(points);
          const areaPath = isArea
            ? `${linePath} L ${points[points.length - 1]?.x ?? plotRight} ${plotBottom} L ${points[0]?.x ?? plotLeft} ${plotBottom} Z`
            : "";
          return { ...entry, seriesIndex, points, linePath, areaPath };
        });

    const categoryLabels: CategoryLabel[] = axisLabels(labels, {
      spacing: labels.length > 1 ? xScale(1) - xScale(0) : plotRight - plotLeft,
      tickInterval,
      formatLabel,
      measure: measureLabel,
    }).map(({ index, label }) => ({
      index,
      label,
      x: xScale(index),
      y: plotBottom + 18,
    }));

    const tickMarks: TickMark[] = ticks.map((tick) => ({
      value: tick,
      label: isPercent ? formatPercent(tick) : formatAxisTick(tick),
      x: plotLeft - 8,
      y: yScale(tick),
      gridX1: plotLeft,
      gridX2: plotRight,
      gridY1: yScale(tick),
      gridY2: yScale(tick),
    }));

    const samples: SampleHit[] = labels.map((label, index) => {
      const x = xScale(index);
      const prev = index === 0 ? plotLeft : (xScale(index - 1) + x) / 2;
      const next = index === labels.length - 1 ? plotRight : (x + xScale(index + 1)) / 2;
      return { index, label, x, hitX: prev, hitWidth: Math.max(next - prev, 1) };
    });

    return { stacked, lines, ticks: tickMarks, categoryLabels, samples, plotLeft, plotRight, plotTop, plotBottom };
  }, [curve, formatLabel, height, includeZero, isArea, isEmpty, isPercent, isStacked, labels, series, tickInterval, width]);

  const visibleLines = highlighted !== null
    ? layout.lines.filter((line) => line.seriesIndex === highlighted)
    : layout.lines;
  const activeSample = activeIndex !== null ? (layout.samples[activeIndex] ?? null) : null;
  // Lowest value tick: its gridline sits on the plot floor, under the bottom of every area.
  const floorTick = layout.ticks.reduce<TickMark | null>(
    (lowest, tick) => (lowest === null || tick.value < lowest.value ? tick : lowest),
    null,
  );
  const flipTooltip = Boolean(activeSample && width > 0 && activeSample.x > width * 0.6);

  // Entrance: lines draw in left to right (series slightly staggered), area fills fade in after.
  const lastSeries = Math.max(layout.lines.length - 1, 1);
  const seriesMotion = (seriesIndex: number): CSSProperties | undefined =>
    animate ? ({ "--chart-stagger": seriesIndex / lastSeries } as CSSProperties) : undefined;

  const handlePlotPointer = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!layout.samples.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const plotWidth = layout.plotRight - layout.plotLeft;
    if (plotWidth <= 0 || rect.width <= 0) return;
    const x = layout.plotLeft + ((event.clientX - rect.left) / rect.width) * plotWidth;
    setActiveIndex(nearestIndex(x, layout.samples));
  };

  const clearSample = () => setActiveIndex(null);

  // Stacked totals for the table, tooltip and accessible names, from the raw values (missing as 0).
  const stackTotals = isStacked
    ? (layout.stacked?.totals ?? stackLayers(series, labels.length, "stacked").totals)
    : undefined;
  const stackValueAt = (seriesIndex: number, index: number) =>
    layout.stacked?.layers[seriesIndex]?.values[index] ?? 0;
  // Stacked charts read top layer first, the way the bands sit.
  const readingOrder = isStacked ? [...visibleLines].reverse() : visibleLines;
  const sampleLabel = (index: number, label: string) => {
    if (!isStacked) {
      return `${label}: ${series.map((entry) => `${entry.label} ${formatValue(entry.data[index] ?? 0)}`).join(", ")}`;
    }
    const total = stackTotals?.[index] ?? 0;
    const parts = [...series.keys()].reverse().map((seriesIndex) => {
      const value = stackValueAt(seriesIndex, index);
      return `${series[seriesIndex].label} ${formatValue(value)}${isPercent ? ` (${sharePercent(value, total)}%)` : ""}`;
    });
    return `${label}: ${parts.join(", ")}, Total ${formatValue(total)}`;
  };

  return (
    <ChartFrame
      {...rest} {...nisthaAttr("linechart", rest)}
      ref={rootRef}
      title={title}
      description={description}
      legend={showLegend ? (
        <Legend
          series={series}
          active={highlighted}
          onActivate={setHighlighted}
          onClear={() => setHighlighted(null)}
          topFirst={isStacked}
        />
      ) : undefined}
      table={showTable ? <ChartTable labels={labels} series={series} totals={stackTotals} /> : undefined}
      isEmpty={isEmpty}
      emptyLabel={emptyLabel}
      isLoading={isLoading}
      className={className}
    >
      <div ref={ref} className={styles.plot}>
        <svg
          className={styles.chart}
          width={width || "100%"}
          height={height}
          // Focusable points inside: a named group, not role="img" (which hides its children).
          role={layout.samples.length > 0 ? "group" : "img"}
          aria-label={title}
        >
          {isArea && width > 0 ? (
            // Area fill: the series colour fades from the top of each area down to the baseline.
            <defs>
              {layout.lines.map((line) => (
                <linearGradient key={line.seriesIndex} id={areaFillId(line.seriesIndex)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" className={isStacked ? styles.bandStopTop : styles.areaStopTop} style={{ stopColor: line.color }} />
                  <stop offset="1" className={isStacked ? styles.bandStopBottom : styles.areaStopBottom} style={{ stopColor: line.color }} />
                </linearGradient>
              ))}
            </defs>
          ) : null}
          {showGrid && isArea && width > 0 ? (
            <defs>
              <mask id={gridMaskId} maskUnits="userSpaceOnUse">
                <rect
                  x={layout.plotLeft}
                  y={layout.plotTop}
                  width={Math.max(layout.plotRight - layout.plotLeft, 1)}
                  height={Math.max(layout.plotBottom - layout.plotTop, 1)}
                  fill="white"
                />
                {layout.lines.map((line) =>
                  line.areaPath ? (
                    <path
                      key={`grid-mask-${line.seriesIndex}`}
                      className={animate ? motionStyles.fadeAfter : undefined}
                      style={seriesMotion(line.seriesIndex)}
                      d={line.areaPath}
                      fill="black"
                    />
                  ) : null,
                )}
              </mask>
            </defs>
          ) : null}
          {showGrid ? (
            <>
              <g mask={isArea && width > 0 ? `url(#${gridMaskId})` : undefined}>
                {layout.ticks.map((tick) =>
                  isArea && tick.value === floorTick?.value ? null : (
                    <line
                      key={tick.value}
                      x1={tick.gridX1}
                      x2={tick.gridX2}
                      y1={Math.round(tick.gridY1) + 0.5}
                      y2={Math.round(tick.gridY1) + 0.5}
                      className={`${styles.grid}${tick.value === 0 ? ` ${styles.gridBaseline}` : ""}`}
                      vectorEffect="non-scaling-stroke"
                    />
                  ),
                )}
              </g>
              {/* The bottom gridline is the floor the area fades onto: keep it out of the mask so it shows. */}
              {isArea && floorTick ? (
                <line
                  x1={floorTick.gridX1}
                  x2={floorTick.gridX2}
                  y1={Math.round(floorTick.gridY1) + 0.5}
                  y2={Math.round(floorTick.gridY1) + 0.5}
                  className={`${styles.grid}${floorTick.value === 0 ? ` ${styles.gridBaseline}` : ""}`}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </>
          ) : null}
          {width > 0 && !showGrid ? (
            <>
              <line
                className={styles.axis}
                x1={layout.plotLeft}
                x2={layout.plotRight}
                y1={layout.plotBottom}
                y2={layout.plotBottom}
              />
            </>
          ) : null}
          {isStacked ? (
            <>
              {/* Bands bottom to top, then every top edge, so no fill covers the line of the band below. */}
              {layout.lines.map((line) => (
                <path
                  key={`band-${line.seriesIndex}`}
                  className={`${styles.series} ${styles.area}${highlighted !== null && highlighted !== line.seriesIndex ? ` ${styles.seriesDimmed}` : ""}${animate ? ` ${motionStyles.fadeAfter}` : ""}`}
                  style={seriesMotion(line.seriesIndex)}
                  d={line.areaPath}
                  fill={`url(#${areaFillId(line.seriesIndex)})`}
                />
              ))}
              {layout.lines.map((line) => (
                <path
                  key={`edge-${line.seriesIndex}`}
                  className={`${styles.series} ${styles.line}${highlighted !== null && highlighted !== line.seriesIndex ? ` ${styles.seriesDimmed}` : ""}${animate ? ` ${motionStyles.draw}` : ""}`}
                  style={seriesMotion(line.seriesIndex)}
                  d={line.linePath}
                  stroke={line.color}
                  pathLength={animate ? 1 : undefined}
                />
              ))}
            </>
          ) : null}
          {isStacked ? null : layout.lines.map((line) => {
            const dimmed = highlighted !== null && highlighted !== line.seriesIndex;
            return (
              <g
                key={line.seriesIndex}
                className={`${styles.series}${dimmed ? ` ${styles.seriesDimmed}` : ""}`}
              >
                {isArea && line.areaPath ? (
                  <path
                    className={`${styles.area}${animate ? ` ${motionStyles.fadeAfter}` : ""}`}
                    style={seriesMotion(line.seriesIndex)}
                    d={line.areaPath}
                    fill={`url(#${areaFillId(line.seriesIndex)})`}
                  />
                ) : null}
                <path
                  className={`${styles.line}${animate ? ` ${motionStyles.draw}` : ""}`}
                  style={seriesMotion(line.seriesIndex)}
                  d={line.linePath}
                  stroke={line.color}
                  pathLength={animate ? 1 : undefined}
                />
              </g>
            );
          })}
          {activeSample ? (
            <line
              className={styles.crosshair}
              x1={activeSample.x}
              x2={activeSample.x}
              y1={layout.plotTop}
              y2={layout.plotBottom}
            />
          ) : null}
          {activeSample
            ? visibleLines.map((line) => {
                const point = line.points[activeSample.index];
                if (!point) return null;
                return (
                  <circle
                    key={`dot-${line.seriesIndex}`}
                    className={styles.dot}
                    cx={point.x}
                    cy={point.y}
                    r={5}
                    fill={line.color}
                  />
                );
              })
            : null}
          {layout.categoryLabels.map((entry) => (
            <text
              key={entry.index}
              x={entry.x}
              y={entry.y}
              className={styles.categoryLabel}
              textAnchor="middle"
              dominantBaseline="hanging"
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
              textAnchor="end"
              dominantBaseline="middle"
            >
              {tick.label}
            </text>
          ))}
          {width > 0 ? (
            <rect
              className={styles.overlay}
              x={layout.plotLeft}
              y={layout.plotTop}
              width={Math.max(layout.plotRight - layout.plotLeft, 1)}
              height={Math.max(layout.plotBottom - layout.plotTop, 1)}
              onPointerMove={handlePlotPointer}
              onPointerLeave={clearSample}
            />
          ) : null}
          {layout.samples.map((sample) => (
            <rect
              key={`hit-${sample.index}`}
              className={styles.hit}
              x={sample.hitX}
              y={layout.plotTop}
              width={sample.hitWidth}
              height={Math.max(layout.plotBottom - layout.plotTop, 1)}
              tabIndex={0}
              role="button"
              aria-label={sampleLabel(sample.index, sample.label)}
              onFocus={() => setActiveIndex(sample.index)}
              onBlur={clearSample}
            />
          ))}
        </svg>
        {activeSample ? (
          <div
            className={`${frameStyles.tooltip}${flipTooltip ? ` ${frameStyles.tooltipFlip}` : ""}`}
            style={{ left: activeSample.x, top: layout.plotTop }}
            role="status"
            aria-live="polite"
          >
            <p className={frameStyles.tooltipTitle}>{activeSample.label}</p>
            {readingOrder.map((line) => {
              const raw = isStacked ? stackValueAt(line.seriesIndex, activeSample.index) : (line.data[activeSample.index] ?? 0);
              const total = stackTotals?.[activeSample.index] ?? 0;
              return (
                <div key={line.seriesIndex} className={frameStyles.tooltipRow}>
                  <span className={frameStyles.tooltipKey} style={{ background: line.color }} aria-hidden />
                  <span className={frameStyles.tooltipShare}>{line.label}</span>
                  <span className={frameStyles.tooltipValue}>
                    {isPercent ? `${sharePercent(raw, total)}% · ${formatValue(raw)}` : formatValue(raw)}
                  </span>
                </div>
              );
            })}
            {isStacked ? (
              <div className={`${frameStyles.tooltipRow} ${styles.tooltipTotal}`}>
                <span className={frameStyles.tooltipKey} aria-hidden />
                <span className={frameStyles.tooltipShare}>Total</span>
                <span className={frameStyles.tooltipValue}>{formatValue(stackTotals?.[activeSample.index] ?? 0)}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}
