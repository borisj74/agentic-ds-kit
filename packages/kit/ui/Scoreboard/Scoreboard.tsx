import { Conveyor } from "../Conveyor";
import { Scorecard } from "../Scorecard";
import type { ScoreboardProps } from "./Scoreboard.types";
import styles from "./Scoreboard.module.css";

export type { ScoreboardProps } from "./Scoreboard.types";

const STRIP_MAX = 4;

export function Scoreboard({
  items,
  scroll = true,
  "aria-label": ariaLabel = "Key metrics",
  className = "",
}: ScoreboardProps) {
  if (items.length > STRIP_MAX) {
    const strip = (
      <section className={`${styles.scoreboard} ${styles.overflowStrip} ${className}`.trim()} aria-label={ariaLabel}>
        <div className={styles.overflowRow}>
          {items.map((item) => (
            <div key={item.label} className={styles.overflowItem}>
              <Scorecard {...item} fill />
            </div>
          ))}
        </div>
      </section>
    );

    if (!scroll) return strip;

    return <Conveyor label={ariaLabel}>{strip}</Conveyor>;
  }

  const cards = items.map((item) => (
    <Scorecard key={item.label} {...item} fill />
  ));

  const countClass =
    items.length <= 1
      ? styles.count1
      : items.length === 2
        ? styles.count2
        : items.length === 3
          ? styles.count3
          : styles.count4;

  return (
    <section className={styles.scoreboard} aria-label={ariaLabel}>
      <div className={`${styles.grid} ${countClass} ${className}`.trim()}>{cards}</div>
    </section>
  );
}
