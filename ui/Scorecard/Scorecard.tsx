import type { ScorecardProps } from "./Scorecard.types";
import styles from "./Scorecard.module.css";

export type { ScorecardProps, ScorecardTrend } from "./Scorecard.types";

export function Scorecard({ title, metric, trend, trendLabel }: ScorecardProps) {
  const trendClass =
    trend === "up" ? styles.trendUp : trend === "down" ? styles.trendDown : styles.trendNeutral;

  return (
    <article className={styles.card} aria-labelledby={`scorecard-${title}`}>
      <h3 id={`scorecard-${title}`} className={styles.title}>
        {title}
      </h3>
      <p className={styles.metric}>{metric}</p>
      {trend ? (
        <p className={`${styles.trend} ${trendClass}`} aria-label={trendLabel}>
          {trendLabel ?? (trend === "up" ? "Trending up" : trend === "down" ? "Trending down" : "No change")}
        </p>
      ) : null}
    </article>
  );
}
