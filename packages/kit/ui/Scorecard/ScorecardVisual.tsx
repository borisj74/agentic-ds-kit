"use client";

import { useId } from "react";
import { Meter } from "../Meter";
import type { ScorecardMeter, ScorecardReference } from "./Scorecard.types";
import { PAD_TOP_TAG, VISUAL_H, VISUAL_W, meterState, sparklineLayout } from "./scorecardVisual.logic";
import styles from "./Scorecard.module.css";

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

type SparklineProps = {
  values: number[] | undefined;
  variant: "reference" | "expressive";
  reference?: ScorecardReference;
  compare?: number[];
  highlightLast?: number;
  dates?: [string, string];
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** The reference and expressive sparklines. Decorative: the card's value, delta and hint carry the meaning. */
export function ScorecardSparkline({ values, variant, reference, compare, highlightLast = 0, dates }: SparklineProps) {
  const rawId = useId();
  const gradientId = `scorecard-area-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const expressive = variant === "expressive";
  const layout = sparklineLayout(values, {
    compare: expressive ? compare : undefined,
    reference: !expressive ? reference?.value : undefined,
    smooth: expressive,
    padTop: expressive ? PAD_TOP_TAG : undefined,
  });
  if (!layout) return null;

  const { points, line, area, compareLine, referenceY } = layout;
  const last = points[points.length - 1];
  const finite = (values ?? []).filter((v) => Number.isFinite(v));
  // The latest point's own value (e.g. this week), not the card's headline figure, so nothing repeats.
  // Lowercase suffix (4.3k) to match how the kit writes figures like $40.7k.
  const latest = compact.format(finite[finite.length - 1]).toLowerCase();
  const dotCount = expressive ? 0 : Math.max(0, Math.min(Math.floor(highlightLast), points.length));

  return (
    <span className={styles.visual} aria-hidden="true">
      <span className={`${styles.plot} ${expressive ? styles.plotExpressive : ""}`}>
        <svg
          className={styles.plotSvg}
          viewBox={`0 0 ${VISUAL_W} ${VISUAL_H}`}
          preserveAspectRatio="none"
          focusable="false"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className={styles.areaStopTop} />
              <stop offset="1" className={styles.areaStopBottom} />
            </linearGradient>
          </defs>
          {!expressive ? (
            <>
              <line className={styles.gridLine} x1="0" y1="0" x2={VISUAL_W} y2="0" vectorEffect="non-scaling-stroke" />
              <line className={styles.gridLine} x1="0" y1={VISUAL_H} x2={VISUAL_W} y2={VISUAL_H} vectorEffect="non-scaling-stroke" />
            </>
          ) : null}
          <path d={area} fill={`url(#${gradientId})`} />
          {referenceY !== null ? (
            <line
              className={styles.referenceLine}
              x1="0"
              y1={referenceY}
              x2={VISUAL_W}
              y2={referenceY}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {compareLine ? <path className={styles.compareLine} d={compareLine} vectorEffect="non-scaling-stroke" /> : null}
          <path className={styles.dataLine} d={line} vectorEffect="non-scaling-stroke" />
        </svg>

        {referenceY !== null && reference?.label ? (
          <span className={styles.referenceLabel} style={{ top: pct(referenceY, VISUAL_H) }}>
            {reference.label}
          </span>
        ) : null}

        {points.slice(points.length - dotCount).map((point) => (
          <span
            key={point.x}
            className={styles.highlightDot}
            style={{ left: pct(point.x, VISUAL_W), top: pct(point.y, VISUAL_H) }}
          />
        ))}

        {expressive ? (
          <>
            <span className={styles.latestBand} style={{ left: pct(last.x, VISUAL_W) }} />
            <span className={styles.endDot} style={{ left: pct(last.x, VISUAL_W), top: pct(last.y, VISUAL_H) }} />
            <span
              className={styles.endTag}
              style={{ left: pct(last.x, VISUAL_W), top: pct(last.y, VISUAL_H) }}
            >
              {latest}
            </span>
          </>
        ) : null}
      </span>

      {!expressive && dates ? (
        <span className={styles.dates}>
          <span>{dates[0]}</span>
          <span>{dates[1]}</span>
        </span>
      ) : null}

      {expressive && compareLine ? (
        <span className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.swatch} />
            This period
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchDashed}`} />
            Previous
          </span>
        </span>
      ) : null}
    </span>
  );
}

/** A calm bar toward a target (or under a limit) from kit Meter, with the percent and the target text under it. */
export function ScorecardMeterBar({ meter, cardLabel }: { meter: ScorecardMeter; cardLabel: string }) {
  const state = meterState(meter);
  if (!state) return null;
  // Meter reads at most 100%; past that the real share joins the name so it matches the text on screen.
  const parts = [cardLabel, meter.label, state.percent > 100 ? `${state.percent}%` : ""].filter(Boolean);
  const name = parts.join(", ");
  return (
    <span className={styles.visual}>
      <Meter
        value={state.percent}
        shape="bar"
        size="sm"
        intent={state.overLimit ? "warning" : "neutral"}
        label={name}
      />
      <span className={styles.meterRow} aria-hidden="true">
        <span className={styles.meterPercent}>{state.percent}%</span>
        <span className={styles.meterLabel}>{meter.label}</span>
      </span>
    </span>
  );
}
