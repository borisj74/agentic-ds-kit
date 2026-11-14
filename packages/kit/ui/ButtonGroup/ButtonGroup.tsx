import type { ButtonGroupProps } from "./ButtonGroup.types";
import { cx } from "../shared/cx";
import styles from "./ButtonGroup.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ButtonGroupProps } from "./ButtonGroup.types";

export function ButtonGroup({ children, ariaLabel, className, ref, ...rest }: ButtonGroupProps) {
  return (
    <div {...rest} {...nisthaAttr("buttongroup", rest)} ref={ref} className={cx(styles.group, className)} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
