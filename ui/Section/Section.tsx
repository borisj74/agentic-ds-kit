import type { SectionProps } from "./Section.types";
import styles from "./Section.module.css";

export type { SectionProps } from "./Section.types";

export function Section({ title, description, children }: SectionProps) {
  const headingId = title ? `section-${title.replace(/\s+/g, "-").toLowerCase()}` : undefined;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      {title ? (
        <div className={styles.header}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
