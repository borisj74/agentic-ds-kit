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
import { formatPercent, formatSigned, lastFiniteIndex, sharePercent, stackLayers, warnStackMisuse, type StackResult } from "./lineChart.logic";
import { useChartSize } from "../shared/useChartSize";
import type { LineChartChangeStrip, LineChartProps, LineChartReference, LineChartSeries } from "./LineChart.types";
import styles from "./LineChart.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  LineChartProps,
  LineChartVariant,
  LineChartCurve,
  LineChartStack,
  LineChartSeries,
  LineChartReference,
  LineChartReferenceHighlight,
  LineChartChangeStrip,
} from "./LineChart.types";

/** Space between the plot and the change strip, and the strip's own height. */
const STRIP_GAP = 24;
const STRIP_HEIGHT = 48;
/** Widest change-strip bar. */
const STRIP_BAR_MAX = 12;
/** Strip axis labels sit this far inside its top and bottom, clear of the plot's floor label. */
const STRIP_LABEL_INSET = 4;


/** True when a value is past the reference line on the highlighted side. */
export function pastReference(value: number | undefined, reference: LineChartReference | undefined): boolean {
  if (!reference?.highlight || value === undefined || !Number.isFinite(value) || !Number.isFinite(reference.value)) return false;
  return reference.highlight === "above" ? value > reference.value : value < reference.value;
}

const isDashed = (entry: ChartSeries) => Boolean((entry as LineChartSeries).dashed);

type Point = { x: number; y: number };

type LineGeom = ChartSeries & {
  dashed: boolean;
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

type StripBar = { index: number; x: number; y: number; width: number; height: number };

type StripGeom = {
  top: number;
  bottom: number;
  zeroY: number;
  bars: StripBar[];
  upperLabel: string;
  lowerLabel: string;
};

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
  referenceY: null as number | null,
  strip: null as StripGeom | null,
};

function ChartTable({
  labels,
  series,
  totals,
  reference,
  strip,
}: {
  labels: string[];
  series: ChartSeries[];
  totals?: number[];
  reference?: LineChartReference;
  strip?: LineChartChangeStrip;
}) {
  const formatStrip = strip?.format ?? formatSigned;
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        {reference ? (
          <caption className={styles.tableCaption}>
            {reference.label}: {formatValue(reference.value)}
          </caption>
        ) : null}
        <thead>
          <tr>
            <th scope="col">Label</th>
            {series.map((entry, seriesIndex) => (
              <th key={seriesIndex} scope="col">
                {entry.label}
              </th>
            ))}
            {totals ? <th scope="col">Total</th> : null}
            {strip ? <th scope="col">{strip.label}</th> : null}
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
              {strip ? (
                <td>{Number.isFinite(strip.data[index]) ? formatStrip(strip.data[index]) : "—"}</td>
              ) : null}
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
  strip,
}: {
  strip?: { label: string; color: string };
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
                className={`${frameStyles.legendSwatch} ${frameStyles.legendSwatchLine}${isDashed(entry) ? ` ${styles.swatchDashed}` : ""}`}
                style={isDashed(entry) ? { color: entry.color } : { background: entry.color }}
                aria-hidden
              />
              <span>{entry.label}</span>
            </button>
          </li>
        );
      })}
      {strip ? (
        <li>
          <span className={`${frameStyles.legendItem} ${frameStyles.legendButton} ${styles.legendStatic}`}>
            <span className={`${frameStyles.legendSwatch} ${styles.swatchBar}`} style={{ background: strip.color }} aria-hidden />
            <span>{strip.label}</span>
          </span>
        </li>
      ) : null}
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
  referenceLine,
  highlightLast = false,
  changeStrip,
  error,
  onRetry,
  tooltipNote,
  className,
  ref: rootRef,
  ...rest
}: LineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const { ref, width } = useChartSize(height);
  const chartId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gridMaskId = `linechart-grid-${chartId}`;
  const plotClipId = `linechart-clip-${chartId}`;
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
  const strip = changeStrip && changeStrip.data.some((value) => Number.isFinite(value)) ? changeStrip : undefined;
  const formatStrip = strip?.format ?? formatSigned;
  // The strip and the latest-value dot take the first solid series' colour.
  const accentColor = series.find((entry) => !isDashed(entry))?.color ?? series[0]?.color ?? "var(--chart-1)";
  const svgHeight = strip ? height + STRIP_GAP + STRIP_HEIGHT : height;
  const showLegend = series.filter((entry) => entry.label.trim().length > 0).length >= 2 || Boolean(strip);

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
    const [dataMin, dataMax] = stacked ? [0, stacked.max || 1] : seriesExtent(series, { includeZero });
    // The reference line always sits inside the plot.
    const refValue = referenceLine && Number.isFinite(referenceLine.value) && !isPercent ? referenceLine.value : null;
    const rawMin = refValue === null ? dataMin : Math.min(dataMin, refValue);
    const rawMax = refValue === null ? dataMax : Math.max(dataMax, refValue);
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
          return { ...entry, dashed: false, seriesIndex: layer.seriesIndex, points, linePath, areaPath: `${linePath} ${back} Z` };
        })
      : series.map((entry, seriesIndex) => {
          const points = labels.map((_, index) => ({
            x: xScale(index),
            y: yScale(entry.data[index] ?? 0),
          }));
          const linePath = draw(points);
          const dashed = isDashed(entry);
          const areaPath = isArea && !dashed
            ? `${linePath} L ${points[points.length - 1]?.x ?? plotRight} ${plotBottom} L ${points[0]?.x ?? plotLeft} ${plotBottom} Z`
            : "";
          return { ...entry, dashed, seriesIndex, points, linePath, areaPath };
        });

    // Change strip: its own symmetric scale around zero, between the plot and the axis labels.
    let stripGeom: StripGeom | null = null;
    if (strip) {
      const top = plotBottom + STRIP_GAP;
      const bottom = top + STRIP_HEIGHT;
      const peak = strip.data.reduce((max, value) => (Number.isFinite(value) ? Math.max(max, Math.abs(value)) : max), 0) || 1;
      const extent = niceTicks(-peak, peak, 3);
      const reach = Math.max(Math.abs(extent.min), Math.abs(extent.max)) || 1;
      const stripScale = linearScale([-reach, reach], [bottom, top]);
      const zeroY = stripScale(0);
      const spacing = labels.length > 1 ? xScale(1) - xScale(0) : plotRight - plotLeft;
      const barWidth = Math.max(1, Math.min(STRIP_BAR_MAX, spacing * 0.6));
      const bars: StripBar[] = [];
      labels.forEach((_, index) => {
        const value = strip.data[index];
        if (value === undefined || !Number.isFinite(value) || value === 0) return;
        const end = stripScale(value);
        bars.push({ index, x: xScale(index) - barWidth / 2, y: Math.min(zeroY, end), width: barWidth, height: Math.abs(end - zeroY) });
      });
      stripGeom = { top, bottom, zeroY, bars, upperLabel: formatStrip(reach), lowerLabel: formatStrip(-reach) };
    }
    const labelsY = (stripGeom ? stripGeom.bottom : plotBottom) + 18;

    const categoryLabels: CategoryLabel[] = axisLabels(labels, {
      spacing: labels.length > 1 ? xScale(1) - xScale(0) : plotRight - plotLeft,
      tickInterval,
      formatLabel,
      measure: measureLabel,
    }).map(({ index, label }) => ({
      index,
      label,
      x: xScale(index),
      y: labelsY,
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

    const referenceY = refValue === null ? null : yScale(refValue);

    return { stacked, lines, ticks: tickMarks, categoryLabels, samples, plotLeft, plotRight, plotTop, plotBottom, referenceY, strip: stripGeom };
  }, [curve, formatLabel, formatStrip, height, includeZero, isArea, isEmpty, isPercent, isStacked, labels, referenceLine, series, strip, tickInterval, width]);

  // The plot's interactive height: down to the strip's floor when there is one.
  const hitBottom = layout.strip ? layout.strip.bottom : layout.plotBottom;

  // Latest value: the last finite point of the first solid series. Not on stacked bands.
  const lastLine = highlightLast && !isStacked ? layout.lines.find((line) => !line.dashed) : undefined;
  const lastIndex = lastLine ? lastFiniteIndex(lastLine.data) : -1;
  const lastPoint = lastLine && lastIndex >= 0 ? lastLine.points[lastIndex] : undefined;

  // Accent dots: solid series only, never on stacked bands (their edges are running totals).
  const highlightOn = Boolean(referenceLine?.highlight) && !isStacked && layout.referenceY !== null;
  const highlightPoints = highlightOn
    ? layout.lines.flatMap((line) =>
        line.dashed
          ? []
          : line.points
              .map((point, index) => ({ point, index, seriesIndex: line.seriesIndex }))
              .filter(({ index }) => pastReference(line.data[index], referenceLine)),
      )
    : [];

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
      const past = (entry: ChartSeries) =>
        highlightOn && !isDashed(entry) && pastReference(entry.data[index], referenceLine)
          ? ` (${referenceLine?.highlight} ${referenceLine?.label})`
          : "";
      const stripPart = strip ? `, ${strip.label} ${Number.isFinite(strip.data[index]) ? formatStrip(strip.data[index]) : "no value"}` : "";
      return `${label}: ${series.map((entry) => `${entry.label} ${formatValue(entry.data[index] ?? 0)}${past(entry)}`).join(", ")}${stripPart}`;
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
          strip={strip ? { label: strip.label, color: accentColor } : undefined}
        />
      ) : undefined}
      table={showTable ? (
        <ChartTable labels={labels} series={series} totals={stackTotals} reference={referenceLine && Number.isFinite(referenceLine.value) && !isPercent ? referenceLine : undefined} strip={strip} />
      ) : undefined}
      isEmpty={isEmpty}
      emptyLabel={emptyLabel}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      className={className}
    >
      <div ref={ref} className={styles.plot}>
        <svg
          className={styles.chart}
          width={width || "100%"}
          height={svgHeight}
          // Focusable points inside: a named group, not role="img" (which hides its children).
          role={layout.samples.length > 0 ? "group" : "img"}
          aria-label={title}
        >
          {width > 0 ? (
            // Lines and fills stop at the plot's left and right edges, like the gridlines: a 2px line's square
            // end would otherwise reach 1px past them. Open above and below, so the top line keeps its width.
            <defs>
              <clipPath id={plotClipId} clipPathUnits="userSpaceOnUse">
                <rect
                  x={layout.plotLeft}
                  y={-height}
                  width={Math.max(layout.plotRight - layout.plotLeft, 1)}
                  height={height * 3}
                />
              </clipPath>
            </defs>
          ) : null}
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
            <g clipPath={width > 0 ? `url(#${plotClipId})` : undefined}>
              {/* Bands bottom to top, then every top edge, so no fill covers the line of the band below.
                  Edges draw from the top band down: where a band is 0 its edge sits on the edge below, and
                  the band that has the value must stay visible on top. */}
              {layout.lines.map((line) => (
                <path
                  key={`band-${line.seriesIndex}`}
                  className={`${styles.series} ${styles.area}${highlighted !== null && highlighted !== line.seriesIndex ? ` ${styles.seriesDimmed}` : ""}${animate ? ` ${motionStyles.fadeAfter}` : ""}`}
                  style={seriesMotion(line.seriesIndex)}
                  d={line.areaPath}
                  fill={`url(#${areaFillId(line.seriesIndex)})`}
                />
              ))}
              {[...layout.lines].reverse().map((line) => (
                <path
                  key={`edge-${line.seriesIndex}`}
                  className={`${styles.series} ${styles.line}${highlighted !== null && highlighted !== line.seriesIndex ? ` ${styles.seriesDimmed}` : ""}${animate ? ` ${motionStyles.draw}` : ""}`}
                  style={seriesMotion(line.seriesIndex)}
                  d={line.linePath}
                  stroke={line.color}
                  pathLength={animate ? 1 : undefined}
                />
              ))}
            </g>
          ) : null}
          {isStacked ? null : layout.lines.map((line) => {
            const dimmed = highlighted !== null && highlighted !== line.seriesIndex;
            return (
              <g
                key={line.seriesIndex}
                className={`${styles.series}${dimmed ? ` ${styles.seriesDimmed}` : ""}`}
                clipPath={width > 0 ? `url(#${plotClipId})` : undefined}
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
                  className={`${styles.line}${line.dashed ? ` ${styles.lineDashed}` : ""}${animate && !line.dashed ? ` ${motionStyles.draw}` : ""}`}
                  style={seriesMotion(line.seriesIndex)}
                  d={line.linePath}
                  stroke={line.color}
                  pathLength={animate && !line.dashed ? 1 : undefined}
                />
              </g>
            );
          })}
          {layout.referenceY !== null && referenceLine ? (
            <g className={styles.reference}>
              <line
                className={styles.referenceLine}
                x1={layout.plotLeft}
                x2={layout.plotRight}
                y1={Math.round(layout.referenceY) + 0.5}
                y2={Math.round(layout.referenceY) + 0.5}
                vectorEffect="non-scaling-stroke"
              />
              <text
                className={styles.referenceLabel}
                x={layout.plotRight}
                y={layout.referenceY - 6}
                textAnchor="end"
              >
                {referenceLine.label}
              </text>
            </g>
          ) : null}
          {highlightPoints.map(({ point, index, seriesIndex }) => (
            <circle
              key={`past-${seriesIndex}-${index}`}
              className={`${styles.highlightDot}${highlighted !== null && highlighted !== seriesIndex ? ` ${styles.seriesDimmed}` : ""}`}
              cx={point.x}
              cy={point.y}
              r={4.5}
            />
          ))}
          {layout.strip ? (
            <g className={styles.strip}>
              <line
                className={styles.stripZero}
                x1={layout.plotLeft}
                x2={layout.plotRight}
                y1={Math.round(layout.strip.zeroY) + 0.5}
                y2={Math.round(layout.strip.zeroY) + 0.5}
                vectorEffect="non-scaling-stroke"
              />
              {layout.strip.bars.map((bar) => (
                <rect
                  key={`strip-${bar.index}`}
                  className={activeSample && activeSample.index !== bar.index ? styles.stripBarQuiet : undefined}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={accentColor}
                />
              ))}
              <text className={styles.tickLabel} x={layout.plotLeft - 8} y={layout.strip.top + STRIP_LABEL_INSET} textAnchor="end" dominantBaseline="middle">
                {layout.strip.upperLabel}
              </text>
              <text className={styles.tickLabel} x={layout.plotLeft - 8} y={layout.strip.bottom - STRIP_LABEL_INSET} textAnchor="end" dominantBaseline="middle">
                {layout.strip.lowerLabel}
              </text>
            </g>
          ) : null}
          {lastPoint ? (
            <circle className={styles.dot} cx={lastPoint.x} cy={lastPoint.y} r={4.5} fill={lastLine?.color} />
          ) : null}
          {activeSample ? (
            <line
              className={styles.crosshair}
              x1={activeSample.x}
              x2={activeSample.x}
              y1={layout.plotTop}
              y2={hitBottom}
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
              height={Math.max(hitBottom - layout.plotTop, 1)}
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
              height={Math.max(hitBottom - layout.plotTop, 1)}
              tabIndex={0}
              role="button"
              aria-label={sampleLabel(sample.index, sample.label)}
              onFocus={() => setActiveIndex(sample.index)}
              onBlur={clearSample}
            />
          ))}
        </svg>
        {lastPoint && lastLine ? (
          <span className={styles.lastValue} style={{ left: lastPoint.x, top: lastPoint.y }} aria-hidden>
            {formatValue(lastLine.data[lastIndex])}
          </span>
        ) : null}
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
            {strip ? (
              <div className={frameStyles.tooltipRow}>
                <span className={`${frameStyles.tooltipKey} ${frameStyles.tooltipKeySquare}`} style={{ background: accentColor }} aria-hidden />
                <span className={frameStyles.tooltipShare}>{strip.label}</span>
                <span className={frameStyles.tooltipValue}>
                  {Number.isFinite(strip.data[activeSample.index]) ? formatStrip(strip.data[activeSample.index]) : "—"}
                </span>
              </div>
            ) : null}
            {(() => {
              const note = tooltipNote?.(activeSample.index);
              return note ? <p className={frameStyles.tooltipNote}>{note}</p> : null;
            })()}
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}
