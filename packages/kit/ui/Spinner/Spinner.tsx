import { Loader } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { SpinnerProps } from "./Spinner.types";
import { cx } from "../shared/cx";
import styles from "./Spinner.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { SpinnerProps, SpinnerSize } from "./Spinner.types";

export function Spinner({ size = "md", label, className, ref, ...rest }: SpinnerProps) {
  return (
    <span
      {...rest} {...nisthaAttr("spinner", rest)}
      ref={ref}
      className={cx(styles.root, styles[size], className)}
      role="status"
      aria-live="polite"
      aria-label={label ? undefined : "Loading"}
    >
      <Loader className={styles.icon} strokeWidth={ICON_STROKE} aria-hidden />
      {label ? <span className={styles.label}>{label}</span> : null}
    </span>
  );
}
