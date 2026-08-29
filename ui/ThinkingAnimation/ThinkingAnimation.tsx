import type { ThinkingAnimationProps } from "./ThinkingAnimation.types";
import styles from "./ThinkingAnimation.module.css";

export type { ThinkingAnimationProps, ThinkingAnimationSize } from "./ThinkingAnimation.types";

export function ThinkingAnimation({
  label = "Thinking",
  size = "md",
  showLabel = true,
  className = "",
}: ThinkingAnimationProps) {
  return (
    <span
      className={`${styles.root} ${styles[size]} ${className}`.trim()}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <span className={styles.dots} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </span>
      {showLabel ? (
        <span className={styles.label} aria-hidden="true">
          {label}
        </span>
      ) : null}
    </span>
  );
}
