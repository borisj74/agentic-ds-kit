import { cloneElement, isValidElement, type ReactElement } from "react";
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
  const hintId = hint && !error ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control =
    describedBy && isValidElement(children)
      ? cloneElement(children as ReactElement<{ describedBy?: string }>, { describedBy })
      : children;

  return (
    <div
      className={`${styles.field} ${styles[labelPosition]}`}
      role="group"
      data-invalid={error ? "true" : undefined}
    >
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      <div className={styles.body}>{control}</div>
      {hint && !error ? (
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
