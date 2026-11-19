"use client";

import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ChartFrame } from "../shared/ChartFrame";
import frameStyles from "../shared/ChartFrame.module.css";
import { axisLabels, CHART_MARGINS, formatAxisTick, formatValue, linearScale } from "../shared/chartMath";
import { smoothPath } from "../shared/curve";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { measureLabel } from "../shared/measureLabel";
import { useChartSize } from "../shared/useChartSize";
import { alignedTicks, axisTicks, barColor, columnValues, extentOf, LINE_COLOR, nextColumn, valueOf } from "./comboChart.logic";
import type { ComboChartProps, ComboChartSeries } from "./ComboChart.types";
import styles from "./ComboChart.module.css";

export type { ComboChartAxis, ComboChartDatum, ComboChartFormatters, ComboChartProps, ComboChartSeries } from "./ComboChart.types";

const MAX_BAR = 32;
const MIN_BAR = 6;
const BAR_GAP = 4;
const BAND_PAD = 0.2;
/** Narrowest column before the plot scrolls sideways, so bars and labels stay readable. */
const MIN_COLUMN = 20;
/** Inset at both ends of a scrolled plot, so edge labels are not clipped. */
const SCROLL_INSET = CHART_MARGINS.right;
/** Space between a value label and the plot. */
const TICK_GAP = 8;

function widest(labels: string[]): number {
  return labels.reduce((max, label) => Math.max(max, measureLabel(label) ?? label.length * 6.5), 0);
}

type Tick = { value: number; y: number; label: string };

function ComboTable({
  data,
  bars,
  line,
  formatBar,
  formatLine,
}: {
  data: ComboChartProps["data"];
  bars: ComboChartSeries[];
  line: ComboChartSeries;
  formatBar: (value: number) => string;
  formatLine: (value: number) => string;
}) {
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        <thead>
          <tr>
            <th scope="col">Category</th>
            {bars.map((series) => (
              <th key={series.key} scope="col">
                {series.label}
              </th>
            ))}
            <th scope="col">{line.label}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const values = columnValues(row, bars, line);
            return (
              <tr key={index}>
                <th scope="row">{row.label}</th>
                {values.bars.map((value, seriesIndex) => (
                  <td key={seriesIndex}>{value === undefined ? "—" : formatBar(value)}</td>
                ))}
                <td>{values.line === undefined ? "—" : formatLine(values.line)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ComboChart({
  data,
  bars,
  line,
  axis = "shared",
  valueFormatter,
  title,
  description,
  height = 240,
  className,
  ref,
  ...rest
}: ComboChartProps) {
  const formatBar = valueFormatter?.bars ?? formatValue;
  const formatLine = valueFormatter?.line ?? formatValue;
  const isDual = axis === "dual";
  const { ref: sizeRef, width } = useChartSize(height);
  const [active, setActive] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hitRefs = useRef<(SVGRectElement | null)[]>([]);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipLeft, setTipLeft] = useState<number | null>(null);

  const barKeys = bars.map((series) => series.key);
  const hasValues = data.some((row) => [...barKeys, line.key].some((key) => valueOf(row, key) !== undefined));
  const isEmpty = data.length === 0 || bars.length === 0 || !hasValues;

  const layout = useMemo(() => {
    if (isEmpty || width <= 0) return null;
    const count = data.length;
    const seriesCount = bars.length;
    const plotTop = CHART_MARGINS.top;
    const plotBottom = height - CHART_MARGINS.bottom;

    // Value axes first: their widest label sets the margin, so a formatter like "€40,000" never clips.
    const leftKeys = isDual ? barKeys : [...barKeys, line.key];
    const integer = data.every((row) => leftKeys.every((key) => {
      const value = valueOf(row, key);
      return value === undefined || Number.isInteger(value);
    }));
    const [leftMin, leftMax] = extentOf(data, leftKeys);
    const left = axisTicks(leftMin, leftMax, integer);
    const right = isDual ? alignedTicks(...extentOf(data, [line.key]), left.ticks.length) : null;
    const leftLabels = left.ticks.map((value) => formatAxisLabel(value, valueFormatter?.bars));
    const rightLabels = right ? right.ticks.map((value) => formatAxisLabel(value, valueFormatter?.line)) : [];
    const leftMargin = Math.max(CHART_MARGINS.left, widest(leftLabels) + TICK_GAP * 2);
    const rightMargin = isDual ? Math.max(CHART_MARGINS.left, widest(rightLabels) + TICK_GAP * 2) : CHART_MARGINS.right;

    // Too many columns for even thin bars: keep a floor width per column and scroll, axes pinned outside.
    const minGroup = Math.max(MIN_COLUMN, (seriesCount * MIN_BAR + (seriesCount - 1) * BAR_GAP) / (1 - BAND_PAD * 2));
    const natural = (width - leftMargin - rightMargin) / count;
    const scrolls = natural < minGroup;
    const contentWidth = scrolls ? count * minGroup + SCROLL_INSET * 2 : width;
    const plotLeft = scrolls ? SCROLL_INSET : leftMargin;
    const plotRight = contentWidth - (scrolls ? SCROLL_INSET : rightMargin);
    const groupSize = (plotRight - plotLeft) / count;
    const barWidth = Math.min(
      MAX_BAR,
      Math.max(1, (groupSize * (1 - BAND_PAD * 2) - (seriesCount - 1) * BAR_GAP) / seriesCount),
    );
    const clusterWidth = seriesCount * barWidth + (seriesCount - 1) * BAR_GAP;

    const yLeft = linearScale([left.min, left.max], [plotBottom, plotTop]);
    const yLine = right ? linearScale([right.min, right.max], [plotBottom, plotTop]) : yLeft;

    const centers = data.map((_, index) => plotLeft + index * groupSize + groupSize / 2);
    const baseline = yLeft(0);
    const barRects = data.flatMap((row, index) =>
      bars.map((series, seriesIndex) => {
        const value = valueOf(row, series.key);
        if (value === undefined) return null;
        const x = centers[index] - clusterWidth / 2 + seriesIndex * (barWidth + BAR_GAP);
        const end = yLeft(value);
        return {
          key: `${index}-${seriesIndex}`,
          seriesIndex,
          x,
          y: Math.min(baseline, end),
          width: barWidth,
          height: Math.abs(end - baseline),
          color: barColor(seriesIndex),
        };
      }),
    ).filter((rect) => rect !== null);

    const points = data
      .map((row, index) => {
        const value = valueOf(row, line.key);
        return value === undefined ? null : { index, x: centers[index], y: yLine(value) };
      })
      .filter((point) => point !== null);

    const leftTicks: Tick[] = left.ticks.map((value, index) => ({ value, y: yLeft(value), label: leftLabels[index] }));
    const rightTicks: Tick[] = right
      ? right.ticks.map((value, index) => ({ value, y: yLine(value), label: rightLabels[index] }))
      : [];

    const categoryLabels = axisLabels(
      data.map((row) => row.label),
      { spacing: groupSize, measure: measureLabel },
    ).map(({ index, label }) => ({ index, label, x: centers[index], y: plotBottom + 18 }));

    return {
      scrolls,
      contentWidth,
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
      leftMargin,
      rightMargin,
      groupSize,
      centers,
      bottom: left.min,
      leftTicks,
      rightTicks,
      barRects,
      points,
      linePath: smoothPath(points),
      categoryLabels,
    };
  }, [bars, barKeys, data, height, isDual, isEmpty, line.key, valueFormatter?.bars, valueFormatter?.line, width]);

  const offsetX = layout?.scrolls ? layout.leftMargin - scrollLeft : 0;
  const activeRow = active !== null ? data[active] : undefined;
  const activeX = layout && active !== null ? layout.centers[active] + offsetX : 0;

  // Place the tooltip beside the column, on the side with room, and keep it inside the plot.
  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (active === null || !tip || width <= 0) {
      setTipLeft(null);
      return;
    }
    const tipWidth = tip.offsetWidth;
    let left = activeX + TICK_GAP;
    if (left + tipWidth > width) left = activeX - TICK_GAP - tipWidth;
    setTipLeft(Math.max(0, Math.min(left, width - tipWidth)));
  }, [active, activeX, width]);
  const activePoint = layout && active !== null ? layout.points.find((point) => point.index === active) : undefined;
  const lineIndex = bars.length;

  const dimmed = (seriesIndex: number) => highlighted !== null && highlighted !== seriesIndex;

  const columnLabel = (index: number) => {
    const row = data[index];
    const values = columnValues(row, bars, line);
    const parts = bars.map((series, seriesIndex) => {
      const value = values.bars[seriesIndex];
      return `${series.label} ${value === undefined ? "no value" : formatBar(value)}`;
    });
    parts.push(`${line.label} ${values.line === undefined ? "no value" : formatLine(values.line)}`);
    return `${row.label}: ${parts.join(", ")}`;
  };

  const onPointer = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!layout) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const x = event.clientX - svg.getBoundingClientRect().left;
    const index = Math.floor((x - layout.plotLeft) / layout.groupSize);
    setActive(Math.max(0, Math.min(data.length - 1, index)));
  };

  const onColumnKey = (index: number) => (event: KeyboardEvent<SVGRectElement>) => {
    const next = nextColumn(index, event.key, data.length);
    if (next === null || next === index) return;
    event.preventDefault();
    hitRefs.current[next]?.focus();
  };

  const tickText = (ticks: Tick[], x: number, anchor: "start" | "end") =>
    ticks.map((tick) => (
      <text key={`${anchor}-${tick.value}`} x={x} y={tick.y} className={styles.tickLabel} textAnchor={anchor} dominantBaseline="middle">
        {tick.label}
      </text>
    ));

  const plot = layout ? (
    <svg
      className={styles.chart}
      width={layout.contentWidth}
      height={height}
      style={layout.scrolls ? { width: layout.contentWidth } : undefined}
      role="group"
      aria-label={title ?? "Combo chart"}
    >
      {layout.leftTicks.map((tick) => (
        <line
          key={tick.value}
          x1={layout.scrolls ? 0 : layout.plotLeft}
          x2={layout.scrolls ? layout.contentWidth : layout.plotRight}
          y1={Math.round(tick.y) + 0.5}
          y2={Math.round(tick.y) + 0.5}
          className={cx(styles.grid, (tick.value === 0 || tick.value === layout.bottom) && styles.gridBaseline)}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {active !== null ? (
        <rect
          className={styles.column}
          x={layout.plotLeft + active * layout.groupSize}
          y={layout.plotTop}
          width={layout.groupSize}
          height={layout.plotBottom - layout.plotTop}
        />
      ) : null}
      {layout.barRects.map((rect) => (
        <rect
          key={rect.key}
          className={cx(styles.bar, dimmed(rect.seriesIndex) && styles.dimmed)}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          rx={2}
          fill={rect.color}
        />
      ))}
      {layout.points.length > 1 ? (
        <path className={cx(styles.line, dimmed(lineIndex) && styles.dimmed)} d={layout.linePath} stroke={LINE_COLOR} />
      ) : null}
      {activePoint ? <circle className={styles.dot} cx={activePoint.x} cy={activePoint.y} r={5} fill={LINE_COLOR} /> : null}
      {layout.categoryLabels.map((entry) => (
        <text key={entry.index} x={entry.x} y={entry.y} className={styles.categoryLabel} textAnchor="middle" dominantBaseline="hanging">
          {entry.label}
        </text>
      ))}
      {layout.scrolls ? null : tickText(layout.leftTicks, layout.leftMargin - TICK_GAP, "end")}
      {layout.scrolls ? null : tickText(layout.rightTicks, layout.plotRight + TICK_GAP, "start")}
      <rect
        className={styles.overlay}
        x={layout.plotLeft}
        y={layout.plotTop}
        width={Math.max(layout.plotRight - layout.plotLeft, 1)}
        height={Math.max(layout.plotBottom - layout.plotTop, 1)}
        onPointerMove={onPointer}
        onPointerLeave={() => setActive(null)}
      />
      {data.map((row, index) => (
        <rect
          key={`hit-${index}`}
          ref={(node) => {
            hitRefs.current[index] = node;
          }}
          className={styles.hit}
          x={layout.plotLeft + index * layout.groupSize}
          y={layout.plotTop}
          width={layout.groupSize}
          height={layout.plotBottom - layout.plotTop}
          tabIndex={0}
          role="button"
          aria-label={columnLabel(index)}
          onFocus={() => setActive(index)}
          onBlur={() => setActive(null)}
          onKeyDown={onColumnKey(index)}
        />
      ))}
    </svg>
  ) : null;

  const legend = !isEmpty ? (
    <ul className={cx(frameStyles.legend, frameStyles.legendInteractive)}>
      {[...bars, line].map((series, seriesIndex) => {
        const isLine = seriesIndex === lineIndex;
        return (
          <li key={`${series.key}-${seriesIndex}`}>
            <button
              type="button"
              className={cx(frameStyles.legendItem, frameStyles.legendButton, dimmed(seriesIndex) && frameStyles.legendItemDimmed)}
              onMouseEnter={() => setHighlighted(seriesIndex)}
              onMouseLeave={() => setHighlighted(null)}
              onFocus={() => setHighlighted(seriesIndex)}
              onBlur={() => setHighlighted(null)}
            >
              <span
                className={cx(frameStyles.legendSwatch, isLine ? frameStyles.legendSwatchLine : frameStyles.legendSwatchDot)}
                style={{ background: isLine ? LINE_COLOR : barColor(seriesIndex) }}
                aria-hidden
              />
              <span>{series.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  ) : undefined;

  const values = activeRow ? columnValues(activeRow, bars, line) : null;

  return (
    <ChartFrame
      {...rest}
      {...nisthaAttr("combochart", rest)}
      ref={ref}
      title={title}
      description={description}
      legend={legend}
      table={<ComboTable data={data} bars={bars} line={line} formatBar={formatBar} formatLine={formatLine} />}
      isEmpty={isEmpty}
      className={className}
    >
      <div ref={sizeRef} className={styles.plot}>
        {layout?.scrolls ? (
          <div className={styles.scrollLayout}>
            <svg className={styles.axis} width={layout.leftMargin} height={height} aria-hidden>
              {tickText(layout.leftTicks, layout.leftMargin - TICK_GAP, "end")}
            </svg>
            <div
              className={styles.scroller}
              tabIndex={-1}
              onScroll={(event) => setScrollLeft(event.currentTarget.scrollLeft)}
            >
              {plot}
            </div>
            {isDual ? (
              <svg className={styles.axis} width={layout.rightMargin} height={height} aria-hidden>
                {tickText(layout.rightTicks, TICK_GAP, "start")}
              </svg>
            ) : null}
          </div>
        ) : (
          plot
        )}
        {activeRow && values ? (
          <div
            ref={tipRef}
            className={cx(frameStyles.tooltip, styles.tooltipPlaced)}
            style={{
              left: tipLeft ?? activeX,
              top: layout ? (layout.plotTop + layout.plotBottom) / 2 : 0,
              visibility: tipLeft === null ? "hidden" : undefined,
            }}
            role="status"
            aria-live="polite"
          >
            <p className={frameStyles.tooltipTitle}>{activeRow.label}</p>
            {bars.map((series, seriesIndex) => (
              <div key={series.key} className={frameStyles.tooltipRow}>
                <span className={frameStyles.tooltipKey} style={{ background: barColor(seriesIndex) }} aria-hidden />
                <span className={frameStyles.tooltipShare}>{series.label}</span>
                <span className={frameStyles.tooltipValue}>
                  {values.bars[seriesIndex] === undefined ? "—" : formatBar(values.bars[seriesIndex] as number)}
                </span>
              </div>
            ))}
            <div className={frameStyles.tooltipRow}>
              <span className={cx(frameStyles.tooltipKey, styles.lineKey)} style={{ background: LINE_COLOR }} aria-hidden />
              <span className={frameStyles.tooltipShare}>{line.label}</span>
              <span className={frameStyles.tooltipValue}>{values.line === undefined ? "—" : formatLine(values.line)}</span>
            </div>
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}

/** Axis labels: the series formatter when given, else the compact axis format (1k, 2.5M). */
function formatAxisLabel(value: number, formatter: ((value: number) => string) | undefined): string {
  return formatter ? formatter(value) : formatAxisTick(value);
}
