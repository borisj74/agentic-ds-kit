import type { ButtonGroupProps } from "./ButtonGroup.types";
import { cx } from "../shared/cx";
import styles from "./ButtonGroup.module.css";

export type { ButtonGroupProps } from "./ButtonGroup.types";

export function ButtonGroup({ children, ariaLabel, className, ref, ...rest }: ButtonGroupProps) {
  return (
    <div {...rest} ref={ref} className={cx(styles.group, className)} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
