"use client";

import { useId, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ChartFrame } from "@/ui/shared/ChartFrame";
import frameStyles from "@/ui/shared/ChartFrame.module.css";
import {
  CHART_MARGINS,
  formatAxisTick,
  formatValue,
  linearScale,
  niceTicks,
  normalizeLineInput,
  seriesExtent,
  type ChartSeries,
} from "@/ui/shared/chartMath";
import { useChartSize } from "@/ui/shared/useChartSize";
import type { LineChartProps } from "./LineChart.types";
import styles from "./LineChart.module.css";

export type { LineChartProps, LineChartVariant } from "./LineChart.types";

type Point = { x: number; y: number };

type LineGeom = ChartSeries & {
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

type CategoryLabel = { label: string; x: number; y: number };

type SampleHit = {
  index: number;
  label: string;
  x: number;
  hitX: number;
  hitWidth: number;
};

const EMPTY_LAYOUT = {
  lines: [] as LineGeom[],
  ticks: [] as TickMark[],
  categoryLabels: [] as CategoryLabel[],
  samples: [] as SampleHit[],
  plotLeft: 0,
  plotRight: 0,
  plotTop: 0,
  plotBottom: 0,
};

function ChartTable({ labels, series }: { labels: string[]; series: ChartSeries[] }) {
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        <thead>
          <tr>
            <th scope="col">Label</th>
            {series.map((entry) => (
              <th key={entry.label} scope="col">
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, index) => (
            <tr key={label}>
              <th scope="row">{label}</th>
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
  height = 240,
  showGrid = true,
  showTable = true,
  includeZero = false,
  emptyLabel = "No data for this range",
  isLoading = false,
  className = "",
}: LineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const { ref, width } = useChartSize(height);
  const gridMaskId = `linechart-grid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const { labels, series } = useMemo(
    () => normalizeLineInput({ data, labels: labelsProp, series: seriesProp }),
    [data, labelsProp, seriesProp],
  );

  const hasValues = series.some((entry) => entry.data.some((value) => Number.isFinite(value)));
  const isEmpty = !labels.length || !series.length || !hasValues;
  const isArea = variant === "area";
  const labelledSeries = series.filter((entry) => entry.label.trim().length > 0);
  const showLegend = labelledSeries.length >= 2;

  const layout = useMemo(() => {
    if (isEmpty || width <= 0) return EMPTY_LAYOUT;

    const plotLeft = CHART_MARGINS.left;
    const plotRight = width - CHART_MARGINS.right;
    const plotTop = CHART_MARGINS.top;
    const plotBottom = height - CHART_MARGINS.bottom;

    const [rawMin, rawMax] = seriesExtent(series, { includeZero });
    const { ticks, min, max } = niceTicks(rawMin, rawMax, 5);
    const yScale = linearScale([min, max], [plotBottom, plotTop]);
    const xScale = linearScale([0, Math.max(labels.length - 1, 1)], [plotLeft, plotRight]);

    const lines: LineGeom[] = series.map((entry) => {
      const points = labels.map((_, index) => ({
        x: xScale(index),
        y: yScale(entry.data[index] ?? 0),
      }));
      const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
      const areaPath = isArea
        ? `${linePath} L ${points[points.length - 1]?.x ?? plotRight} ${plotBottom} L ${points[0]?.x ?? plotLeft} ${plotBottom} Z`
        : "";
      return { ...entry, points, linePath, areaPath };
    });

    const categoryLabels: CategoryLabel[] = labels.map((label, index) => ({
      label,
      x: xScale(index),
      y: plotBottom + 18,
    }));

    const tickMarks: TickMark[] = ticks.map((tick) => ({
      value: tick,
      label: formatAxisTick(tick),
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

    return { lines, ticks: tickMarks, categoryLabels, samples, plotLeft, plotRight, plotTop, plotBottom };
  }, [height, includeZero, isArea, isEmpty, labels, series, width]);

  const visibleLines = highlighted
    ? layout.lines.filter((line) => line.label === highlighted)
    : layout.lines;
  const activeSample = activeIndex !== null ? (layout.samples[activeIndex] ?? null) : null;
  const flipTooltip = Boolean(activeSample && width > 0 && activeSample.x > width * 0.6);

  const handlePlotPointer = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!layout.samples.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const plotWidth = layout.plotRight - layout.plotLeft;
    if (plotWidth <= 0 || rect.width <= 0) return;
    const x = layout.plotLeft + ((event.clientX - rect.left) / rect.width) * plotWidth;
    setActiveIndex(nearestIndex(x, layout.samples));
  };

  const clearSample = () => setActiveIndex(null);

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
      table={showTable ? <ChartTable labels={labels} series={series} /> : undefined}
      isEmpty={isEmpty}
      emptyLabel={emptyLabel}
      isLoading={isLoading}
      className={className}
    >
      <div ref={ref} className={styles.plot}>
        <svg className={styles.chart} width={width || "100%"} height={height} role="img" aria-label={title}>
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
                  line.areaPath ? <path key={`grid-mask-${line.label}`} d={line.areaPath} fill="black" /> : null,
                )}
              </mask>
            </defs>
          ) : null}
          {showGrid ? (
            <g mask={isArea && width > 0 ? `url(#${gridMaskId})` : undefined}>
              {layout.ticks.map((tick) => (
                <line
                  key={tick.value}
                  x1={tick.gridX1}
                  x2={tick.gridX2}
                  y1={Math.round(tick.gridY1) + 0.5}
                  y2={Math.round(tick.gridY1) + 0.5}
                  className={styles.grid}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          ) : null}
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
          {layout.lines.map((line) => {
            const dimmed = Boolean(highlighted) && highlighted !== line.label;
            return (
              <g
                key={line.label}
                className={`${styles.series}${dimmed ? ` ${styles.seriesDimmed}` : ""}`}
              >
                {isArea && line.areaPath ? (
                  <path className={styles.area} d={line.areaPath} fill={line.color} />
                ) : null}
                <path className={styles.line} d={line.linePath} stroke={line.color} />
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
                    key={`dot-${line.label}`}
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
              key={entry.label}
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
              key={`hit-${sample.label}-${sample.index}`}
              className={styles.hit}
              x={sample.hitX}
              y={layout.plotTop}
              width={sample.hitWidth}
              height={Math.max(layout.plotBottom - layout.plotTop, 1)}
              tabIndex={0}
              role="button"
              aria-label={`${sample.label}: ${series
                .map((entry) => `${entry.label} ${formatValue(entry.data[sample.index] ?? 0)}`)
                .join(", ")}`}
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
            {visibleLines.map((line) => (
              <div key={line.label} className={frameStyles.tooltipRow}>
                <span className={frameStyles.tooltipKey} style={{ background: line.color }} aria-hidden />
                <span className={frameStyles.tooltipShare}>{line.label}</span>
                <span className={frameStyles.tooltipValue}>{formatValue(line.data[activeSample.index] ?? 0)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}
