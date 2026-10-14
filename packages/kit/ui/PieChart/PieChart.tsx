"use client";

import { useId, useMemo, useState } from "react";
import { ChartFrame } from "../shared/ChartFrame";
import { cx } from "../shared/cx";
import frameStyles from "../shared/ChartFrame.module.css";
import motionStyles from "../shared/chartMotion.module.css";
import {
  formatValue,
  pointOnCircle,
  prepareSegments,
  ringPath,
  TAU,
  wedgePath,
  type PreparedSegment,
} from "../shared/chartMath";
import type { PieChartProps } from "./PieChart.types";
import styles from "./PieChart.module.css";

export type { PieChartLayout, PieChartProps, PieChartVariant } from "./PieChart.types";

type SliceGeom = PreparedSegment & {
  path: string;
  midX: number;
  midY: number;
  percent: number;
};

function ChartTable({ segments, total }: { segments: PreparedSegment[]; total: number }) {
  return (
    <div className={frameStyles.tableScroll}>
      <table className={frameStyles.table}>
        <thead>
          <tr>
            <th scope="col">Segment</th>
            <th scope="col">Value</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment, index) => (
            <tr key={index}>
              <th scope="row">{segment.label}</th>
              <td>{formatValue(segment.value)}</td>
              <td>{`${Math.round(segment.share * 100)}%`}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Total</th>
            <td>{formatValue(total)}</td>
            <td>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Legend({
  segments,
  active,
  orientation,
  onActivate,
  onClear,
}: {
  segments: PreparedSegment[];
  active: number | null;
  orientation: "vertical" | "horizontal";
  onActivate: (index: number) => void;
  onClear: () => void;
}) {
  return (
    <ul
      className={`${frameStyles.legend} ${frameStyles.legendInteractive}${orientation === "vertical" ? ` ${frameStyles.legendVertical}` : ""}`}
    >
      {segments.map((segment, index) => {
        const dimmed = active !== null && active !== index;
        const percent = `${Math.round(segment.share * 100)}%`;
        return (
          <li key={index}>
            <button
              type="button"
              className={`${frameStyles.legendItem} ${frameStyles.legendButton}${dimmed ? ` ${frameStyles.legendItemDimmed}` : ""}`}
              onMouseEnter={() => onActivate(index)}
              onMouseLeave={onClear}
              onFocus={() => onActivate(index)}
              onBlur={onClear}
            >
              <span
                className={`${frameStyles.legendSwatch} ${frameStyles.legendSwatchDot}`}
                style={{ background: segment.color }}
                aria-hidden
              />
              <span>{segment.label}</span>
              <span className={orientation === "vertical" ? frameStyles.legendPercent : frameStyles.legendMeta}>
                {percent}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function PieChart({
  data = [],
  title,
  description,
  variant = "donut",
  layout = "split",
  size = 240,
  maxSegments = 6,
  sort = true,
  otherLabel = "Other",
  centerLabel = "Total",
  showCenterTotal = true,
  showTable = true,
  emptyLabel = "No data for this range",
  isLoading = false,
  animate = false,
  className,
  ref: rootRef,
  ...rest
}: PieChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const rawId = useId();
  const glowId = `pie-glow-${rawId.replace(/:/g, "")}`;
  const sweepId = `pie-sweep-${rawId.replace(/:/g, "")}`;
  const isDonut = variant === "donut";
  const isSplit = layout === "split";

  const segments = useMemo(
    () => prepareSegments(data, { maxSegments, sort, otherLabel }),
    [data, maxSegments, sort, otherLabel],
  );

  const total = useMemo(() => segments.reduce((sum, entry) => sum + entry.value, 0), [segments]);
  const isEmpty = !segments.length || total <= 0;

  const geometry = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const pad = 4;
    const outerRadius = size / 2 - pad;
    const thickness = isDonut ? outerRadius * 0.34 : 0;
    const innerRadius = isDonut ? Math.max(0, outerRadius - thickness) : 0;
    const midRadius = isDonut ? (innerRadius + outerRadius) / 2 : outerRadius * 0.55;

    if (isEmpty) {
      return { cx, cy, slices: [] as SliceGeom[] };
    }

    let cursor = 0;
    const slices: SliceGeom[] = segments.map((segment) => {
      const sweep = segment.share * TAU;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end;
      const mid = (start + end) / 2;
      const point = pointOnCircle(cx, cy, midRadius, mid);
      return {
        ...segment,
        path: isDonut
          ? ringPath({ cx, cy, innerRadius, outerRadius, startAngle: start, endAngle: end })
          : wedgePath({ cx, cy, radius: outerRadius, startAngle: start, endAngle: end }),
        midX: point.x,
        midY: point.y,
        percent: Math.round(segment.share * 100),
      };
    });

    return { cx, cy, slices };
  }, [isDonut, isEmpty, segments, size]);

  const activeSlice = active !== null ? (geometry.slices[active] ?? null) : null;
  const compactTotal = formatValue(total);
  const valueSize = size * 0.14;
  const labelSize = size * 0.07;

  const legend = !isEmpty ? (
    <Legend
      segments={segments}
      active={active}
      orientation={isSplit ? "vertical" : "horizontal"}
      onActivate={setActive}
      onClear={() => setActive(null)}
    />
  ) : undefined;

  const plot = (
    <div className={styles.plot} style={{ width: size, height: size }}>
      <svg
        className={styles.chart}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        overflow="visible"
      >
        <defs>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          {animate ? (
            // Entrance: one wide stroke drawn clockwise from 12 o'clock reveals the slices as a sweep.
            // Pure CSS, so the final state shows without JS; reduced motion skips it.
            <mask id={sweepId} maskUnits="userSpaceOnUse" x={-size} y={-size} width={size * 3} height={size * 3}>
              <circle
                className={motionStyles.draw}
                cx={geometry.cx}
                cy={geometry.cy}
                r={size / 2}
                fill="none"
                stroke="white"
                strokeWidth={size}
                pathLength={1}
                transform={`rotate(-90 ${geometry.cx} ${geometry.cy})`}
              />
            </mask>
          ) : null}
        </defs>
        <g mask={animate ? `url(#${sweepId})` : undefined}>
          {geometry.slices.map((slice, index) => {
            const isActive = active === index;
            const isDimmed = active !== null && !isActive;
            return (
              <g
                key={index}
                className={`${styles.slice}${isActive ? ` ${styles.sliceActive}` : ""}${isDimmed ? ` ${styles.sliceDimmed}` : ""}`}
              >
                <path
                  className={styles.glow}
                  d={slice.path}
                  fill={slice.color}
                  filter={`url(#${glowId})`}
                />
                <path className={styles.mark} d={slice.path} fill={slice.color} />
              </g>
            );
          })}
        </g>
        {isDonut && showCenterTotal && !isEmpty ? (
          <text className={styles.center} textAnchor="middle">
            <tspan
              className={styles.centerValue}
              x={geometry.cx}
              y={geometry.cy}
              dy="-0.15em"
              fontSize={valueSize}
            >
              {compactTotal}
            </tspan>
            <tspan
              className={styles.centerLabel}
              x={geometry.cx}
              dy="1.45em"
              fontSize={labelSize}
            >
              {centerLabel}
            </tspan>
          </text>
        ) : null}
        {geometry.slices.map((slice, index) => (
          <path
            key={`hit-${index}`}
            className={styles.hit}
            d={slice.path}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${slice.label}: ${formatValue(slice.value)}, ${slice.percent} percent`}
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
          />
        ))}
      </svg>
      {activeSlice ? (
        <div
          className={`${frameStyles.tooltip}${activeSlice.midX > size * 0.6 ? ` ${frameStyles.tooltipFlip}` : ""}`}
          style={{ left: activeSlice.midX, top: activeSlice.midY }}
          role="status"
          aria-live="polite"
        >
          <p className={frameStyles.tooltipTitle}>{activeSlice.label}</p>
          <div className={frameStyles.tooltipRow}>
            <span className={frameStyles.tooltipKey} style={{ background: activeSlice.color }} aria-hidden />
            <span className={frameStyles.tooltipShare}>{`${activeSlice.percent}% of ${compactTotal}`}</span>
            <span className={frameStyles.tooltipValue}>{formatValue(activeSlice.value)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <ChartFrame
      {...rest}
      ref={rootRef}
      title={title}
      description={description}
      legend={!isSplit ? legend : undefined}
      table={showTable ? <ChartTable segments={segments} total={total} /> : undefined}
      isEmpty={isEmpty}
      emptyLabel={emptyLabel}
      isLoading={isLoading}
      className={cx("pie-chart", `pie-chart--${layout}`, styles.root, className)}
    >
      {isSplit ? (
        <div className={styles.split}>
          {plot}
          {legend}
        </div>
      ) : (
        <div className={styles.stackPlot}>{plot}</div>
      )}
    </ChartFrame>
  );
}
