import type { CSSProperties } from "react";
import type { LoadingAnimationProps } from "./LoadingAnimation.types";
import styles from "./LoadingAnimation.module.css";

export type {
  LoadingAnimationProps,
  LoadingAnimationSize,
  LoadingAnimationVariant,
} from "./LoadingAnimation.types";

const DOTS = Array.from({ length: 9 }, (_, index) => index);

export function LoadingAnimation({
  label = "Loading",
  size = "md",
  variant = "grid",
  className = "",
}: LoadingAnimationProps) {
  return (
    <span
      className={`${styles.root} ${styles[size]} ${styles[variant]} ${className}`.trim()}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      {DOTS.map((index) => (
        <span
          className={styles.dot}
          style={
            {
              "--loading-index": index,
              "--loading-phase": index / (DOTS.length - 1),
            } as CSSProperties
          }
          aria-hidden="true"
          key={index}
        />
      ))}
    </span>
  );
}
