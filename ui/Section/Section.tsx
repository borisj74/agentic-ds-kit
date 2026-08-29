import { useId } from "react";
import type { SectionProps } from "./Section.types";
import styles from "./Section.module.css";

export type { SectionProps, SectionSize } from "./Section.types";

export function Section({
  title,
  description,
  size = "md",
  actions,
  children,
}: SectionProps) {
  const headingId = useId();
  const showHeader = Boolean(title || description || actions);

  return (
    <section
      className={`${styles.section} ${styles[size]}`}
      aria-labelledby={title ? headingId : undefined}
    >
      {showHeader ? (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title ? (
              <h2 id={headingId} className={styles.title}>
                {title}
              </h2>
            ) : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
