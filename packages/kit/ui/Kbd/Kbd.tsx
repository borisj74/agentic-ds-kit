import type { KbdProps } from "./Kbd.types";
import { cx } from "../shared/cx";
import styles from "./Kbd.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { KbdProps } from "./Kbd.types";

/** One keyboard key. Put several next to each other for a chord: ⌘ then K. */
export function Kbd({ children, className, ref, ...rest }: KbdProps) {
  return (
    <kbd {...rest} {...nisthaAttr("kbd", rest)} ref={ref} className={cx(styles.kbd, className)}>
      {children}
    </kbd>
  );
}
