import { Loader } from "lucide-react";
import type { SpinnerProps } from "./Spinner.types";
import styles from "./Spinner.module.css";

export type { SpinnerProps, SpinnerSize } from "./Spinner.types";

export function Spinner({ size = "md", label }: SpinnerProps) {
  return (
    <span
      className={`${styles.root} ${styles[size]}`}
      role="status"
      aria-live="polite"
      aria-label={label ? undefined : "Loading"}
    >
      <Loader className={styles.icon} strokeWidth={2} aria-hidden />
      {label ? <span className={styles.label}>{label}</span> : null}
    </span>
  );
}
