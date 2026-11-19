"use client";

import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChartFrame } from "../shared/ChartFrame";
import frameStyles from "../shared/ChartFrame.module.css";
import { CHART_MARGINS, formatAxisTick, formatValue, linearScale } from "../shared/chartMath";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { measureLabel } from "../shared/measureLabel";
import { useChartSize } from "../shared/useChartSize";
import {
  axisTicks,
  groupColor,
  groupsOf,
  keyboardOrder,
  nextPosition,
  plottable,
  radiusScale,
} from "./scatterChart.logic";
import type { ScatterChartDatum, ScatterChartProps } from "./ScatterChart.types";
import styles from "./ScatterChart.module.css";

export type { ScatterChartDatum, ScatterChartFormatters, ScatterChartProps, ScatterChartSize } from "./ScatterChart.types";

/** Below this width the chart is narrow: fewer ticks and smaller dots. */
const NARROW = 480;
const TICK_GAP = 8;
/** Space under the plot for the x tick labels, then the x axis name. */
const X_TICK_OFFSET = 10;
const X_TITLE_OFFSET = 30;
/** Space above the plot for the y axis name. */
const Y_TITLE_SPACE = 28;

function widest(labels: string[]): number {
  return labels.reduce((max, label) => Math.max(max, measureLabel(label) ?? label.length * 6.5), 0);
}

function ScatterTable({
  rows,
  showGroup,
  xLabel,
  yLabel,
  sizeLabel,
  formatX,
  formatY,
  formatSize,
}: {
  rows: ScatterChartDatum[];
  showGroup: boolean;
  xLabel: string;
  yLabel: string;
  sizeLabel: string | null;
  formatX: (value: number) => string;
  formatY: (value: number) => string;
  formatSize: (value: number) => string;
}) {
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        <thead>
          <tr>
            <th scope="col">Item</th>
            {showGroup ? <th scope="col">Group</th> : null}
            <th scope="col">{xLabel}</th>
            <th scope="col">{yLabel}</th>
            {sizeLabel ? <th scope="col">{sizeLabel}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.label}</th>
              {showGroup ? <td className={styles.textCell}>{row.group ?? "—"}</td> : null}
              <td>{formatX(row.x)}</td>
              <td>{formatY(row.y)}</td>
              {sizeLabel ? <td>{typeof row.size === "number" ? formatSize(row.size) : "—"}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScatterChart({
  data,
  xLabel,
  yLabel,
  size = "fixed",
  sizeLabel = "Size",
  valueFormatter,
  title,
  description,
  height = 280,
  className,
  ref,
  ...rest
}: ScatterChartProps) {
  const formatX = valueFormatter?.x ?? formatValue;
  const formatY = valueFormatter?.y ?? formatValue;
  const formatSize = valueFormatter?.size ?? formatValue;
  const bySize = size === "value";
  const { ref: sizeRef, width } = useChartSize(height);
  const [focusPosition, setFocusPosition] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [tipPlace, setTipPlace] = useState<{ left: number; top: number } | null>(null);
  const hitRefs = useRef<(SVGCircleElement | null)[]>([]);
  const tipRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => plottable(data), [data]);
  const groups = useMemo(() => groupsOf(rows), [rows]);
  const order = useMemo(() => keyboardOrder(rows), [rows]);
  const showLegend = groups.filter((group) => group !== "").length >= 2;
  const isEmpty = rows.length === 0;

  const layout = useMemo(() => {
    if (isEmpty || width <= 0) return null;
    const narrow = width < NARROW;
    const target = narrow ? 3 : 4;
    const radii: [number, number] = narrow ? [3, 10] : [4, 14];
    const fixedRadius = narrow ? 4 : 5;
    const radiusOf = bySize ? radiusScale(rows.map((row) => row.size), radii) : () => fixedRadius;
    const maxRadius = bySize ? radii[1] : fixedRadius;

    const xAxis = axisTicks(rows.map((row) => row.x), target);
    const yAxis = axisTicks(rows.map((row) => row.y), target);
    const xTickLabels = xAxis.ticks.map((tick) => (valueFormatter?.x ? valueFormatter.x(tick) : formatAxisTick(tick)));
    const yTickLabels = yAxis.ticks.map((tick) => (valueFormatter?.y ? valueFormatter.y(tick) : formatAxisTick(tick)));

    // Margins fit the widest labels and the biggest dot, so nothing is clipped at the edges.
    const left = Math.max(CHART_MARGINS.left, widest(yTickLabels) + TICK_GAP * 2);
    const right = Math.max(CHART_MARGINS.right, widest([xTickLabels[xTickLabels.length - 1] ?? ""]) / 2 + 2, maxRadius + 2);
    const top = Math.max(Y_TITLE_SPACE, maxRadius + 2);
    const bottom = X_TITLE_OFFSET + 18;
    const plotLeft = left;
    const plotRight = width - right;
    const plotTop = top;
    const plotBottom = height - bottom;

    const xScale = linearScale([xAxis.min, xAxis.max], [plotLeft, plotRight]);
    const yScale = linearScale([yAxis.min, yAxis.max], [plotBottom, plotTop]);

    const dots = rows.map((row, index) => ({
      index,
      row,
      cx: xScale(row.x),
      cy: yScale(row.y),
      r: radiusOf(row.size),
      color: groupColor(groups, row.group),
    }));

    return {
      narrow,
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
      xTicks: xAxis.ticks.map((tick, index) => ({ value: tick, x: xScale(tick), label: xTickLabels[index], isEdge: tick === xAxis.min })),
      yTicks: yAxis.ticks.map((tick, index) => ({ value: tick, y: yScale(tick), label: yTickLabels[index], isEdge: tick === yAxis.min })),
      dots,
      // Big dots first, so small ones stay on top and visible.
      paintOrder: [...dots].sort((a, b) => b.r - a.r || a.index - b.index),
    };
  }, [bySize, groups, height, isEmpty, rows, valueFormatter, width]);

  const activeDot = layout && active !== null ? layout.dots[active] : null;

  // Place the tooltip beside the dot, on the side with room, and keep it inside the plot area.
  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!activeDot || !tip || width <= 0) {
      setTipPlace(null);
      return;
    }
    const tipWidth = tip.offsetWidth;
    let left = activeDot.cx + activeDot.r + TICK_GAP;
    if (left + tipWidth > width) left = activeDot.cx - activeDot.r - TICK_GAP - tipWidth;
    setTipPlace({ left: Math.max(0, Math.min(left, width - tipWidth)), top: activeDot.cy });
  }, [activeDot, width]);

  const describe = (row: ScatterChartDatum) => {
    const parts = [`${xLabel} ${formatX(row.x)}`, `${yLabel} ${formatY(row.y)}`];
    if (bySize) parts.push(`${sizeLabel} ${typeof row.size === "number" ? formatSize(row.size) : "no value"}`);
    if (showLegend && row.group) parts.push(row.group);
    return `${row.label}: ${parts.join(", ")}`;
  };

  const onKeyDown = (event: KeyboardEvent<SVGCircleElement>) => {
    const next = nextPosition(focusPosition, event.key, order.length);
    if (next === null || next === focusPosition) return;
    event.preventDefault();
    setFocusPosition(next);
    hitRefs.current[order[next]]?.focus();
  };

  const dimmed = (group: string | undefined) => highlighted !== null && (group ?? "") !== highlighted;

  const legend = showLegend ? (
    <ul className={cx(frameStyles.legend, frameStyles.legendInteractive)}>
      {groups.map((group) => (
        <li key={group || "(none)"}>
          <button
            type="button"
            className={cx(frameStyles.legendItem, frameStyles.legendButton, dimmed(group) && frameStyles.legendItemDimmed)}
            onMouseEnter={() => setHighlighted(group)}
            onMouseLeave={() => setHighlighted(null)}
            onFocus={() => setHighlighted(group)}
            onBlur={() => setHighlighted(null)}
          >
            <span
              className={cx(frameStyles.legendSwatch, frameStyles.legendSwatchDot)}
              style={{ background: groupColor(groups, group) }}
              aria-hidden
            />
            <span>{group || "Other"}</span>
          </button>
        </li>
      ))}
    </ul>
  ) : undefined;

  return (
    <ChartFrame
      {...rest}
      {...nisthaAttr("scatterchart", rest)}
      ref={ref}
      title={title}
      description={description}
      legend={legend}
      table={
        <ScatterTable
          rows={order.map((index) => rows[index])}
          showGroup={showLegend}
          xLabel={xLabel}
          yLabel={yLabel}
          sizeLabel={bySize ? sizeLabel : null}
          formatX={formatX}
          formatY={formatY}
          formatSize={formatSize}
        />
      }
      isEmpty={isEmpty}
      className={className}
    >
      <div ref={sizeRef} className={styles.plot}>
        {layout ? (
          <svg className={styles.chart} width={width} height={height} role="group" aria-label={title ?? `${yLabel} by ${xLabel}`}>
            {layout.yTicks.map((tick) => (
              <line
                key={`y-${tick.value}`}
                className={cx(styles.grid, tick.isEdge && styles.gridEdge)}
                x1={layout.plotLeft}
                x2={layout.plotRight}
                y1={Math.round(tick.y) + 0.5}
                y2={Math.round(tick.y) + 0.5}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {layout.xTicks.map((tick) => (
              <line
                key={`x-${tick.value}`}
                className={cx(styles.grid, tick.isEdge && styles.gridEdge)}
                x1={Math.round(tick.x) + 0.5}
                x2={Math.round(tick.x) + 0.5}
                y1={layout.plotTop}
                y2={layout.plotBottom}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {layout.yTicks.map((tick) => (
              <text key={`yl-${tick.value}`} className={styles.tickLabel} x={layout.plotLeft - TICK_GAP} y={tick.y} textAnchor="end" dominantBaseline="middle">
                {tick.label}
              </text>
            ))}
            {layout.xTicks.map((tick) => (
              <text key={`xl-${tick.value}`} className={styles.tickLabel} x={tick.x} y={layout.plotBottom + X_TICK_OFFSET} textAnchor="middle" dominantBaseline="hanging">
                {tick.label}
              </text>
            ))}
            <text className={styles.axisTitle} x={layout.plotRight} y={layout.plotBottom + X_TITLE_OFFSET} textAnchor="end" dominantBaseline="hanging">
              {xLabel}
            </text>
            {/* The y measure's name starts at the chart's left edge, in line with the title above and the tick numbers. */}
            <text className={styles.axisTitle} x={0} y={layout.plotTop - 14} textAnchor="start" dominantBaseline="middle">
              {yLabel}
            </text>
            {layout.paintOrder.map((dot) => (
              <circle
                key={dot.row.id}
                className={cx(styles.dot, dimmed(dot.row.group) && styles.dimmed)}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={dot.color}
              />
            ))}
            {activeDot ? <circle className={styles.ring} cx={activeDot.cx} cy={activeDot.cy} r={activeDot.r + 3} /> : null}
            {order.map((index, position) => {
              const dot = layout.dots[index];
              return (
                <circle
                  key={`hit-${dot.row.id}`}
                  ref={(node) => {
                    hitRefs.current[index] = node;
                  }}
                  className={styles.hit}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={Math.max(dot.r, 8)}
                  tabIndex={position === focusPosition ? 0 : -1}
                  role="button"
                  aria-label={describe(dot.row)}
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => {
                    setFocusPosition(position);
                    setActive(index);
                  }}
                  onBlur={() => setActive(null)}
                  onKeyDown={onKeyDown}
                />
              );
            })}
          </svg>
        ) : null}
        {activeDot ? (
          <div
            ref={tipRef}
            className={cx(frameStyles.tooltip, styles.tooltipPlaced)}
            style={{ left: tipPlace?.left ?? 0, top: tipPlace?.top ?? 0, visibility: tipPlace ? undefined : "hidden" }}
            role="status"
            aria-live="polite"
          >
            <p className={frameStyles.tooltipTitle}>{activeDot.row.label}</p>
            {showLegend && activeDot.row.group ? (
              <div className={frameStyles.tooltipRow}>
                <span className={frameStyles.tooltipKey} style={{ background: activeDot.color }} aria-hidden />
                <span className={frameStyles.tooltipShare}>{activeDot.row.group}</span>
              </div>
            ) : null}
            <div className={frameStyles.tooltipRow}>
              <span className={frameStyles.tooltipShare}>{xLabel}</span>
              <span className={frameStyles.tooltipValue}>{formatX(activeDot.row.x)}</span>
            </div>
            <div className={frameStyles.tooltipRow}>
              <span className={frameStyles.tooltipShare}>{yLabel}</span>
              <span className={frameStyles.tooltipValue}>{formatY(activeDot.row.y)}</span>
            </div>
            {bySize ? (
              <div className={frameStyles.tooltipRow}>
                <span className={frameStyles.tooltipShare}>{sizeLabel}</span>
                <span className={frameStyles.tooltipValue}>
                  {typeof activeDot.row.size === "number" ? formatSize(activeDot.row.size) : "—"}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}
