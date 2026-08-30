import { Carousel } from "@/ui/Carousel";
import { Scorecard } from "../Scorecard";
import type { ScoreboardProps } from "./Scoreboard.types";
import styles from "./Scoreboard.module.css";

export type { ScoreboardProps } from "./Scoreboard.types";

const STRIP_MAX = 4;

export function Scoreboard({ items, "aria-label": ariaLabel = "Key metrics" }: ScoreboardProps) {
  const cards = items.map((item) => (
    <Scorecard key={item.label} {...item} fill />
  ));

  if (items.length > STRIP_MAX) {
    return (
      <div className={styles.overflow}>
        <Carousel items={cards} slidesPerView={4} ariaLabel={ariaLabel} />
      </div>
    );
  }

  const countClass =
    items.length <= 1
      ? styles.count1
      : items.length === 2
        ? styles.count2
        : items.length === 3
          ? styles.count3
          : styles.count4;

  return (
    <section className={`${styles.scoreboard} ${countClass}`} aria-label={ariaLabel}>
      {cards}
    </section>
  );
}
