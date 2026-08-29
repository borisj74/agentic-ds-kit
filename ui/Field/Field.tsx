import type { FieldProps } from "./Field.types";
import styles from "./Field.module.css";

export type { FieldProps, FieldLabelPosition } from "./Field.types";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  labelPosition = "top",
  children,
}: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`${styles.field} ${styles[labelPosition]}`}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      <div className={styles.body} aria-describedby={describedBy}>
        {children}
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
