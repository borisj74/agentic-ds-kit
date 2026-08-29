"use client";

import { useMemo } from "react";
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
  const { ref, width } = useChartSize(height);

  const { labels, series } = useMemo(
    () => normalizeLineInput({ data, labels: labelsProp, series: seriesProp }),
    [data, labelsProp, seriesProp],
  );

  const hasValues = series.some((entry) => entry.data.some((value) => Number.isFinite(value)));
  const isEmpty = !labels.length || !series.length || !hasValues;
  const isArea = variant === "area";

  const layout = useMemo(() => {
    if (isEmpty || width <= 0) return { lines: [] as Array<Record<string, unknown>>, ticks: [], categoryLabels: [] };

    const plotLeft = CHART_MARGINS.left;
    const plotRight = width - CHART_MARGINS.right;
    const plotTop = CHART_MARGINS.top;
    const plotBottom = height - CHART_MARGINS.bottom;

    const [rawMin, rawMax] = seriesExtent(series, { includeZero });
    const { ticks, min, max } = niceTicks(rawMin, rawMax, 5);
    const yScale = linearScale([min, max], [plotBottom, plotTop]);
    const xScale = linearScale([0, Math.max(labels.length - 1, 1)], [plotLeft, plotRight]);

    const lines = series.map((entry) => {
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

    const categoryLabels = labels.map((label, index) => ({
      label,
      x: xScale(index),
      y: plotBottom + 18,
    }));

    const tickMarks = ticks.map((tick) => ({
      value: tick,
      label: formatAxisTick(tick),
      x: plotLeft - 8,
      y: yScale(tick),
      gridX1: plotLeft,
      gridX2: plotRight,
      gridY1: yScale(tick),
      gridY2: yScale(tick),
    }));

    return { lines, ticks: tickMarks, categoryLabels };
  }, [height, includeZero, isArea, isEmpty, labels, series, width]);

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={series.length > 1 ? <Legend series={series} /> : undefined}
      table={showTable ? <ChartTable labels={labels} series={series} /> : undefined}
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
          {layout.lines.map((line) => (
            <g key={String(line.label)}>
              {isArea && line.areaPath ? (
                <path d={String(line.areaPath)} fill={String(line.color)} fillOpacity={0.15} />
              ) : null}
              <path
                d={String(line.linePath)}
                fill="none"
                stroke={String(line.color)}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {(line.points as Array<{ x: number; y: number }>).map((point, index) => (
                <circle
                  key={`${String(line.label)}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  fill={String(line.color)}
                />
              ))}
            </g>
          ))}
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
        </svg>
      </div>
    </ChartFrame>
  );
}
