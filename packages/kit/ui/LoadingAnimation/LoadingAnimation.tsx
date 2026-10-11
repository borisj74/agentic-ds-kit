import type { CSSProperties } from "react";
import type { LoadingAnimationProps } from "./LoadingAnimation.types";
import { cx } from "../shared/cx";
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
  className,
  ref,
  ...rest
}: LoadingAnimationProps) {
  return (
    <span
      {...rest}
      ref={ref}
      className={cx(styles.root, styles[size], styles[variant], className)}
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
