"use client";

import { useId, type Ref } from "react";
import { Badge } from "../Badge";
import { Delta } from "../Delta";
import type { DeltaDirection } from "../Delta";
import { LucideByName } from "../Button/lucideName";
import type { ScorecardDeltaTone, ScorecardProps, ScorecardTrend } from "./Scorecard.types";
import { cx } from "../shared/cx";
import styles from "./Scorecard.module.css";
import { ScorecardMeterBar, ScorecardSparkline } from "./ScorecardVisual";
import { meterState, sparklineLayout } from "./scorecardVisual.logic";
import { nisthaAttr } from "../shared/inspect";

export type {
  ScorecardProps,
  ScorecardTrend,
  ScorecardSize,
  ScorecardDeltaTone,
  ScorecardAppearance,
  ScorecardSelectionRole,
  ScorecardSparklineVariant,
  ScorecardReference,
  ScorecardMeter,
  ScorecardMeterDirection,
} from "./Scorecard.types";

const SPARK_W = 100;
const SPARK_H = 24;

/** Polyline points for the sparkline in a 100 × 24 box, or null with fewer than two finite values. */
export function sparklinePoints(values: number[] | undefined): string | null {
  const finite = (values ?? []).filter((v) => Number.isFinite(v));
  if (finite.length < 2) return null;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min || 1;
  const step = SPARK_W / (finite.length - 1);
  return finite
    .map((v, i) => {
      const x = i * step;
      // Flat series sit in the middle; otherwise 1 unit of headroom so the stroke is not clipped.
      const y = max === min ? SPARK_H / 2 : 1 + (SPARK_H - 2) * (1 - (v - min) / span);
      return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
    })
    .join(" ");
}

/** Trend to kit Delta direction. `neutral` has no direction and reads as no change. */
const TREND_DIRECTION: Record<ScorecardTrend, DeltaDirection> = {
  up: "up",
  down: "down",
  flat: "flat",
  neutral: "flat",
};

const DELTA_TONE_CLASS: Record<ScorecardDeltaTone, string> = {
  success: styles.up,
  warning: styles.warning,
  danger: styles.down,
  neutral: styles.neutral,
};

/**
 * Trend `neutral` with a deltaTone is a status, not a change (e.g. an amber "3 urgent"), so it
 * shows the tone's status icon instead of a Delta arrow.
 */
const DELTA_TONE_ICON: Record<ScorecardDeltaTone, string> = {
  success: "CircleCheck",
  warning: "TriangleAlert",
  danger: "CircleX",
  neutral: "Minus",
};

export function Scorecard({
  label,
  value,
  delta,
  trend = "neutral",
  deltaTone,
  hint,
  size = "md",
  badge,
  badgeTone = "neutral",
  onClick,
  selected,
  selectionRole = "toggle",
  sparkline,
  sparklineVariant = "plain",
  reference,
  compare,
  highlightLast,
  sparklineDates,
  meter,
  appearance = "card",
  fill = false,
  className: userClassName,
  ref,
  ...rest
}: ScorecardProps) {
  const labelId = useId();
  const valueId = useId();
  const badgeId = useId();
  const labelledBy = label ? `${labelId} ${valueId}` : valueId;
  const toggle = onClick && selected !== undefined;
  const deltaIsStatus = Boolean(deltaTone) && trend === "neutral";
  const radio = toggle && selectionRole === "radio";
  // A meter replaces the sparkline. The reference and expressive looks move the chart to the card's foot.
  const showMeter = meterState(meter) !== null;
  const showRichLine = !showMeter && sparklineVariant !== "plain" && sparklineLayout(sparkline) !== null;
  const richVisual = showMeter && meter
    ? <ScorecardMeterBar meter={meter} cardLabel={label} />
    : showRichLine && (sparklineVariant === "reference" || sparklineVariant === "expressive")
      ? (
          <ScorecardSparkline
            values={sparkline}
            variant={sparklineVariant}
            reference={reference}
            compare={compare}
            highlightLast={highlightLast}
            dates={sparklineDates}
          />
        )
      : null;
  const rich = richVisual !== null;
  const sparkPoints = rich ? null : sparklinePoints(sparkline);
  const className = cx(styles.card, styles[size], rich && styles.stacked, appearance === "plain" && styles.plain, fill && styles.fill, onClick && styles.interactive, toggle && selected && styles.selected, userClassName);

  const body = (
    <>
      {label || badge ? (
        <span className={styles.header}>
          {label ? (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          ) : null}
          {badge ? (
            <span id={badgeId} className={styles.badgeSlot}>
              <Badge size="sm" tone={badgeTone}>
                {badge}
              </Badge>
            </span>
          ) : null}
        </span>
      ) : null}
      <span id={valueId} className={styles.value}>
        {value}
      </span>
      {sparkPoints ? (
        <svg
          className={styles.sparkline}
          viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <polyline points={sparkPoints} vectorEffect="non-scaling-stroke" />
        </svg>
      ) : null}
      {delta || hint ? (
        <span className={styles.footer}>
          {delta && deltaIsStatus && deltaTone ? (
            <span className={`${styles.delta} ${DELTA_TONE_CLASS[deltaTone]}`}>
              <LucideByName name={DELTA_TONE_ICON[deltaTone]} size={16} className={styles.icon} />
              {delta}
            </span>
          ) : delta ? (
            <Delta value={delta} direction={TREND_DIRECTION[trend]} tone={deltaTone} size="sm" />
          ) : null}
          {hint ? <span className={styles.hint}>{hint}</span> : null}
        </span>
      ) : null}
      {richVisual}
    </>
  );

  if (onClick) {
    return (
      <button
        {...rest} {...nisthaAttr("scorecard", rest)}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={className}
        onClick={onClick}
        aria-labelledby={toggle && badge ? `${labelledBy} ${badgeId}` : labelledBy}
        role={radio ? "radio" : undefined}
        aria-checked={radio ? selected : undefined}
        aria-pressed={toggle && !radio ? selected : undefined}
      >
        {body}
      </button>
    );
  }

  return (
    <article {...rest} {...nisthaAttr("scorecard", rest)} ref={ref} className={className} aria-labelledby={labelledBy}>
      {body}
    </article>
  );
}
