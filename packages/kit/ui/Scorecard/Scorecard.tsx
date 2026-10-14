"use client";

import { useId, type Ref } from "react";
import { Badge } from "../Badge";
import { LucideByName } from "../Button/lucideName";
import type { ScorecardDeltaTone, ScorecardProps, ScorecardTrend } from "./Scorecard.types";
import { cx } from "../shared/cx";
import styles from "./Scorecard.module.css";

export type { ScorecardProps, ScorecardTrend, ScorecardSize, ScorecardDeltaTone } from "./Scorecard.types";

const TREND_ICON: Record<ScorecardTrend, string> = {
  up: "TrendingUp",
  down: "TrendingDown",
  flat: "Minus",
  neutral: "Minus",
};

const TREND_CLASS: Record<ScorecardTrend, string> = {
  up: styles.up,
  down: styles.down,
  flat: styles.flat,
  neutral: styles.neutral,
};

const DELTA_TONE_CLASS: Record<ScorecardDeltaTone, string> = {
  success: styles.up,
  warning: styles.warning,
  danger: styles.down,
  neutral: styles.neutral,
};

/** Trend `neutral` has no direction, so a toned delta shows the tone's status icon instead of the dash. */
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
  fill = false,
  className: userClassName,
  ref,
  ...rest
}: ScorecardProps) {
  const labelId = useId();
  const valueId = useId();
  const labelledBy = label ? `${labelId} ${valueId}` : valueId;
  const deltaClass = deltaTone ? DELTA_TONE_CLASS[deltaTone] : TREND_CLASS[trend];
  const deltaIcon = deltaTone && trend === "neutral" ? DELTA_TONE_ICON[deltaTone] : TREND_ICON[trend];
  const className = cx(styles.card, styles[size], fill && styles.fill, onClick && styles.interactive, userClassName);

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
            <span className={styles.badgeSlot}>
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
      {delta || hint ? (
        <span className={styles.footer}>
          {delta ? (
            <span className={`${styles.delta} ${deltaClass}`}>
              <LucideByName name={deltaIcon} size={15} className={styles.icon} />
              {delta}
            </span>
          ) : null}
          {hint ? <span className={styles.hint}>{hint}</span> : null}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        {...rest}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={className}
        onClick={onClick}
        aria-labelledby={labelledBy}
      >
        {body}
      </button>
    );
  }

  return (
    <article {...rest} ref={ref} className={className} aria-labelledby={labelledBy}>
      {body}
    </article>
  );
}
