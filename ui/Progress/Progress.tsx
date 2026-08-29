import { useId } from "react";
import type { ProgressProps } from "./Progress.types";
import styles from "./Progress.module.css";

export type { ProgressProps, ProgressSize } from "./Progress.types";

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function Progress({
  value = 0,
  size = "md",
  label,
  showValue = false,
  ariaLabel,
}: ProgressProps) {
  const uid = useId();
  const percent = clamp(value);
  const rounded = Math.round(percent);
  const labelId = label ? `${uid}-label` : undefined;
  const showMeta = Boolean(label) || showValue;
  const unnamed = ariaLabel || `${rounded}%`;

  return (
    <div className={`${styles.root} ${styles[size]}`}>
      {showMeta ? (
        <div className={styles.meta}>
          {label ? (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? <span className={styles.value}>{rounded}%</span> : null}
        </div>
      ) : null}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={`${rounded}%`}
        aria-labelledby={labelId}
        aria-label={label ? undefined : unnamed}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
