"use client";

import { useId } from "react";
import { Badge } from "@/ui/Badge";
import { LucideByName } from "@/ui/Button/lucideName";
import type { ScorecardProps, ScorecardTrend } from "./Scorecard.types";
import styles from "./Scorecard.module.css";

export type { ScorecardProps, ScorecardTrend, ScorecardSize } from "./Scorecard.types";

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

export function Scorecard({
  label,
  value,
  delta,
  trend = "neutral",
  hint,
  size = "md",
  badge,
  badgeTone = "neutral",
  onClick,
}: ScorecardProps) {
  const labelId = useId();
  const valueId = useId();
  const labelledBy = label ? `${labelId} ${valueId}` : valueId;
  const className = [styles.card, styles[size], onClick ? styles.interactive : ""]
    .filter(Boolean)
    .join(" ");

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
            <span className={`${styles.delta} ${TREND_CLASS[trend]}`}>
              <LucideByName name={TREND_ICON[trend]} size={15} className={styles.icon} />
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
      <button type="button" className={className} onClick={onClick} aria-labelledby={labelledBy}>
        {body}
      </button>
    );
  }

  return (
    <article className={className} aria-labelledby={labelledBy}>
      {body}
    </article>
  );
}
