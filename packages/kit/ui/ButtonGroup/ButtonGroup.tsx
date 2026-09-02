import type { ButtonGroupProps } from "./ButtonGroup.types";
import styles from "./ButtonGroup.module.css";

export type { ButtonGroupProps } from "./ButtonGroup.types";

export function ButtonGroup({ children, ariaLabel }: ButtonGroupProps) {
  return (
    <div className={styles.group} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
