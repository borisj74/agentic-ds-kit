import { Scorecard } from "../Scorecard";
import type { ScoreboardProps } from "./Scoreboard.types";
import styles from "./Scoreboard.module.css";

export type { ScoreboardProps } from "./Scoreboard.types";

export function Scoreboard({ items, "aria-label": ariaLabel = "Key metrics" }: ScoreboardProps) {
  return (
    <section className={styles.scoreboard} aria-label={ariaLabel}>
      {items.map((item) => (
        <Scorecard key={item.label} {...item} />
      ))}
    </section>
  );
}
