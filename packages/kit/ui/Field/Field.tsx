"use client";

import { cloneElement, isValidElement, type ReactElement } from "react";
import { CircleCheck, CircleX, Pencil } from "lucide-react";
import { Button } from "../Button";
import { HelpPopover } from "../HelpPopover";
import type { FieldProps } from "./Field.types";
import { cx } from "../shared/cx";
import { useKitLabels } from "../shared/labels";
import { ICON_STROKE } from "../../lib/icon";
import styles from "./Field.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { FieldProps, FieldLabelPosition } from "./Field.types";

type FieldChildFlags = { fieldLabelledBy?: boolean; fieldRequired?: boolean };

export function Field({
  label,
  htmlFor,
  hint,
  help,
  helpLabel = "Help",
  error,
  success,
  optional = false,
  required = false,
  changed = false,
  labelPosition = "top",
  children,
  className,
  ref,
  ...rest
}: FieldProps) {
  const labels = useKitLabels();
  // Error wins over success. The hint stays under the control either way.
  const message = error || success;
  const tone = error ? "error" : success ? "success" : undefined;
  const changedId = changed ? `${htmlFor}-changed` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const messageId = message ? `${htmlFor}-${tone}` : undefined;
  const labelId = `${htmlFor}-label`;
  const describedBy = [changedId, hintId, messageId].filter(Boolean).join(" ") || undefined;
  const flags = isValidElement(children) ? (children.type as FieldChildFlags) : undefined;
  const controlProps: {
    describedBy?: string;
    error?: boolean;
    labelledBy?: string;
    "aria-required"?: boolean;
  } = {};
  if (describedBy) controlProps.describedBy = describedBy;
  if (error) controlProps.error = true;
  // Controls a <label for> cannot name (Slider's role="slider" thumbs) opt in to get the label id.
  if (flags?.fieldLabelledBy) controlProps.labelledBy = labelId;
  // Only controls whose named element takes aria-required opt in. Button triggers (Select, the date pickers) do not.
  if (required && flags?.fieldRequired) controlProps["aria-required"] = true;

  const control =
    Object.keys(controlProps).length > 0 && isValidElement(children)
      ? cloneElement(children as ReactElement<typeof controlProps>, controlProps)
      : children;

  const labelNode = (
    <label id={labelId} className={styles.label} htmlFor={htmlFor}>
      {label}
      {optional && !required ? <span className={styles.optional}> {labels.optional}</span> : null}
    </label>
  );

  const changedNode = changed ? (
    <span id={changedId} className={styles.changed}>
      <Pencil className={styles.changedIcon} size={12} strokeWidth={ICON_STROKE} aria-hidden="true" />
      {labels.edited}
    </span>
  ) : null;

  const MessageIcon = error ? CircleX : CircleCheck;

  return (
    <div
      {...rest} {...nisthaAttr("field", rest)}
      ref={ref}
      className={cx(styles.field, styles[labelPosition], className)}
      data-invalid={error ? "true" : undefined}
      data-success={!error && success ? "true" : undefined}
      data-changed={changed ? "true" : undefined}
    >
      {help || changed ? (
        <div className={styles.labelRow}>
          {labelNode}
          {help ? (
            <HelpPopover title={label} content={help} placement="right">
              <Button appearance="ghost" mode="neutral" size="sm" iconStart="CircleHelp" ariaLabel={helpLabel} />
            </HelpPopover>
          ) : null}
          {changedNode}
        </div>
      ) : (
        labelNode
      )}
      <div className={styles.body}>{control}</div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {message ? (
        <p id={messageId} className={cx(styles.message, error ? styles.error : styles.success)}>
          <MessageIcon className={styles.messageIcon} size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}
