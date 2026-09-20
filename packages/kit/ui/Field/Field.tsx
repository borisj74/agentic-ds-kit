import { cloneElement, isValidElement, type ReactElement } from "react";
import { Button } from "../Button";
import { HelpPopover } from "../HelpPopover";
import type { FieldProps } from "./Field.types";
import styles from "./Field.module.css";

export type { FieldProps, FieldLabelPosition } from "./Field.types";

export function Field({
  label,
  htmlFor,
  hint,
  help,
  error,
  labelPosition = "top",
  children,
}: FieldProps) {
  const hintId = hint && !error ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const controlProps: { describedBy?: string; error?: boolean } = {};
  if (describedBy) controlProps.describedBy = describedBy;
  if (error) controlProps.error = true;

  const control =
    Object.keys(controlProps).length > 0 && isValidElement(children)
      ? cloneElement(children as ReactElement<{ describedBy?: string; error?: boolean }>, controlProps)
      : children;

  const labelNode = (
    <label className={styles.label} htmlFor={htmlFor}>
      {label}
    </label>
  );

  return (
    <div
      className={`${styles.field} ${styles[labelPosition]}`}
      role="group"
      data-invalid={error ? "true" : undefined}
    >
      {help ? (
        <div className={styles.labelRow}>
          {labelNode}
          <HelpPopover title={label} content={help} placement="right">
            <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
          </HelpPopover>
        </div>
      ) : (
        labelNode
      )}
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
