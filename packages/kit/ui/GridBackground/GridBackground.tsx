import type { GridBackgroundProps } from "./GridBackground.types";
import { cx } from "../shared/cx";
import styles from "./GridBackground.module.css";

export type { GridBackgroundProps, GridBackgroundVariant } from "./GridBackground.types";

/**
 * A quiet line or dot grid behind a demo or hero, fading out toward the edges. Decorative only:
 * the grid layer is aria-hidden and sits behind `children`, which keep their full contrast.
 * Static; Paper's optional slow drift is not built (see NOTES.md).
 */
export function GridBackground({
  variant = "lines",
  inverse = false,
  children,
  className,
  ref,
  ...rest
}: GridBackgroundProps) {
  return (
    <div {...rest} ref={ref} className={cx(styles.root, inverse && styles.inverse, className)}>
      {variant !== "none" ? <div className={cx(styles.grid, styles[variant])} aria-hidden="true" /> : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
