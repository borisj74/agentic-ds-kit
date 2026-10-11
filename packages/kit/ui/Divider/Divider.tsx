import type { Ref } from "react";
import type { DividerProps } from "./Divider.types";
import { cx } from "../shared/cx";
import styles from "./Divider.module.css";

export type { DividerProps, DividerOrientation, DividerAlign, DividerTone } from "./Divider.types";

export function Divider({
  orientation = "horizontal",
  label,
  align = "center",
  action,
  tone = "faint",
  className,
  ref,
  ...rest
}: DividerProps) {
  const toneClass = styles[tone];

  if (orientation === "vertical") {
    return (
      <div
        {...rest}
        ref={ref as Ref<HTMLDivElement>}
        className={cx(styles.vertical, toneClass, className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (!label && !action) {
    return <hr {...rest} ref={ref as Ref<HTMLHRElement>} className={cx(styles.rule, toneClass, className)} />;
  }

  return (
    <div {...rest} ref={ref as Ref<HTMLDivElement>} className={cx(styles.labelled, toneClass, className)}>
      {align !== "start" ? <span className={styles.line} aria-hidden /> : null}
      <span className={styles.content}>
        {label ? <span className={styles.label}>{label}</span> : null}
        {action}
      </span>
      {align !== "end" ? <span className={styles.line} aria-hidden /> : null}
    </div>
  );
}
