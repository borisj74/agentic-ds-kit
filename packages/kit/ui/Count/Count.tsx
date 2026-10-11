import type { CountProps } from "./Count.types";
import { cx } from "../shared/cx";
import styles from "./Count.module.css";

export type { CountProps, CountIntent, CountSize } from "./Count.types";

export function Count({
  intent = "info",
  size = "md",
  subtle = false,
  disabled = false,
  count,
  max = 99,
  label,
  className,
  ref,
  ...rest
}: CountProps) {
  const shown = count > max ? `${max}+` : String(count);
  return (
    <span
      {...rest}
      ref={ref}
      className={cx(styles.count, styles[intent], styles[size], subtle && styles.subtle, disabled && styles.disabled, className)}
      aria-disabled={disabled || undefined}
    >
      <span aria-hidden="true">{shown}</span>
      <span className={styles.srOnly}>{label ? `${count} ${label}` : String(count)}</span>
    </span>
  );
}
