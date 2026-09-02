import type { TimelineProps } from "./Timeline.types";
import styles from "./Timeline.module.css";

export type { TimelineItem, TimelineProps, TimelineStatus } from "./Timeline.types";

const STATUSES = ["now", "next", "later"] as const;

function headingTag(level: 2 | 3 | 4): "h2" | "h3" | "h4" {
  if (level === 2) return "h2";
  if (level === 4) return "h4";
  return "h3";
}

export function Timeline({
  items = [],
  label,
  headingLevel = 3,
  className = "",
}: TimelineProps) {
  if (!items.length) return null;

  const TitleTag = headingTag(headingLevel);

  return (
    <ol className={`${styles.timeline} ${className}`.trim()} aria-label={label}>
      {items.map((item, index) => {
        const status = STATUSES.includes(item.status ?? "next")
          ? (item.status ?? "next")
          : "next";

        return (
          <li key={item.id ?? item.title ?? index} className={`${styles.step} ${styles[status]}`}>
            <span className={styles.rail} aria-hidden="true">
              <span className={styles.dot} />
              {index < items.length - 1 ? <span className={styles.line} /> : null}
            </span>
            <div className={styles.copy}>
              {item.phase ? <p className={styles.phase}>{item.phase}</p> : null}
              {item.title ? <TitleTag className={styles.title}>{item.title}</TitleTag> : null}
              {item.body ? <p className={styles.body}>{item.body}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
