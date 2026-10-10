import type { DividerProps } from "./Divider.types";
import styles from "./Divider.module.css";

export type { DividerProps, DividerOrientation, DividerAlign, DividerTone } from "./Divider.types";

export function Divider({
  orientation = "horizontal",
  label,
  align = "center",
  action,
  tone = "faint",
}: DividerProps) {
  const toneClass = styles[tone];

  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`${styles.vertical} ${toneClass}`}
      />
    );
  }

  if (!label && !action) {
    return <hr className={`${styles.rule} ${toneClass}`} />;
  }

  return (
    <div className={`${styles.labelled} ${toneClass}`}>
      {align !== "start" ? <span className={styles.line} aria-hidden /> : null}
      <span className={styles.content}>
        {label ? <span className={styles.label}>{label}</span> : null}
        {action}
      </span>
      {align !== "end" ? <span className={styles.line} aria-hidden /> : null}
    </div>
  );
}
