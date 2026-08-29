"use client";

import { useId, useMemo, useState } from "react";
import { ChartFrame } from "@/ui/shared/ChartFrame";
import frameStyles from "@/ui/shared/ChartFrame.module.css";
import {
  formatValue,
  prepareSegments,
  ringPath,
  TAU,
  wedgePath,
  type PreparedSegment,
} from "@/ui/shared/chartMath";
import type { PieChartProps } from "./PieChart.types";
import styles from "./PieChart.module.css";

export type { PieChartProps, PieChartVariant } from "./PieChart.types";

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
          {segments.map((segment) => (
            <tr key={segment.label}>
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

function Legend({ segments, total }: { segments: PreparedSegment[]; total: number }) {
  return (
    <ul className={frameStyles.legend}>
      {segments.map((segment) => (
        <li key={segment.label} className={frameStyles.legendItem}>
          <span className={frameStyles.legendSwatch} style={{ background: segment.color }} aria-hidden />
          <span>{segment.label}</span>
          <span className={frameStyles.legendMeta}>{formatValue(segment.value)}</span>
        </li>
      ))}
      {total > 0 ? (
        <li className={frameStyles.legendItem}>
          <span>Total</span>
          <span className={frameStyles.legendMeta}>{formatValue(total)}</span>
        </li>
      ) : null}
    </ul>
  );
}

export function PieChart({
  data = [],
  title,
  description,
  variant = "donut",
  size = 240,
  maxSegments = 6,
  sort = true,
  otherLabel = "Other",
  centerLabel = "Total",
  showCenterTotal = true,
  showTable = true,
  emptyLabel = "No data for this range",
  isLoading = false,
  className = "",
}: PieChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const titleId = useId();

  const segments = useMemo(
    () => prepareSegments(data, { maxSegments, sort, otherLabel }),
    [data, maxSegments, sort, otherLabel],
  );

  const total = useMemo(() => segments.reduce((sum, entry) => sum + entry.value, 0), [segments]);
  const isEmpty = !segments.length || total <= 0;
  const isDonut = variant === "donut";

  const geometry = useMemo(() => {
    if (isEmpty) return [] as Array<PreparedSegment & { path: string }>;

    const cx = size / 2;
    const cy = size / 2;
    const pad = 4;
    const outerRadius = size / 2 - pad;
    const thickness = isDonut ? outerRadius * 0.34 : 0;
    const innerRadius = isDonut ? Math.max(0, outerRadius - thickness) : 0;

    let cursor = 0;
    return segments.map((segment) => {
      const sweep = segment.share * TAU;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end;
      return {
        ...segment,
        path: isDonut
          ? ringPath({ cx, cy, innerRadius, outerRadius, startAngle: start, endAngle: end })
          : wedgePath({ cx, cy, radius: outerRadius, startAngle: start, endAngle: end }),
      };
    });
  }, [isDonut, isEmpty, segments, size]);

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={!isEmpty ? <Legend segments={segments} total={total} /> : undefined}
      table={showTable ? <ChartTable segments={segments} total={total} /> : undefined}
      isEmpty={isEmpty}
      emptyLabel={emptyLabel}
      isLoading={isLoading}
      className={className}
    >
      <div className={styles.wrap}>
        <svg
          className={styles.chart}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-labelledby={title ? titleId : undefined}
        >
          {title ? <title id={titleId}>{title}</title> : null}
          {geometry.map((segment) => (
            <path
              key={segment.label}
              d={segment.path}
              fill={segment.color}
              className={active === segment.label ? styles.active : undefined}
              opacity={active && active !== segment.label ? 0.45 : 1}
              onMouseEnter={() => setActive(segment.label)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(segment.label)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              aria-label={`${segment.label}: ${formatValue(segment.value)}`}
            />
          ))}
        </svg>
        {isDonut && showCenterTotal && !isEmpty ? (
          <div className={styles.center} aria-hidden>
            <span className={styles.centerLabel}>{centerLabel}</span>
            <span className={styles.centerValue}>{formatValue(total)}</span>
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}
