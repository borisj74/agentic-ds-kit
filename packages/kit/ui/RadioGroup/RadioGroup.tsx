"use client";

import { useId, useState } from "react";
import { Badge } from "../Badge";
import type { RadioGroupProps } from "./RadioGroup.types";
import { cx } from "../shared/cx";
import styles from "./RadioGroup.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  RadioGroupProps,
  RadioGroupOption,
  RadioGroupOrientation,
  RadioGroupSize,
  RadioGroupLayout,
} from "./RadioGroup.types";

export function RadioGroup({
  name,
  legend,
  hideLegend = false,
  size = "md",
  orientation = "vertical",
  layout = "list",
  options,
  defaultValue,
  value: valueProp,
  onChange,
  disabled = false,
  error,
  hint,
  describedBy,
  className,
  ref,
  ...rest
}: RadioGroupProps) {
  const uid = useId();
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = isControlled ? valueProp : uncontrolled;
  const message = error || hint;
  const messageId = message ? `${uid}-message` : undefined;
  const legendId = `${uid}-legend`;
  const describedByIds = [messageId, describedBy].filter(Boolean).join(" ") || undefined;

  function emit(next: string) {
    if (disabled) return;
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  return (
    <fieldset
      {...rest} {...nisthaAttr("radiogroup", rest)}
      ref={ref}
      className={cx(styles.group, styles[size], layout === "card" && styles.card, error && styles.groupError, className)}
      disabled={disabled}
      // radiogroup (not the fieldset's implicit group) so aria-invalid is a supported state here.
      role="radiogroup"
      aria-labelledby={legendId}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedByIds}
    >
      <legend id={legendId} className={hideLegend ? styles.legendHidden : styles.legend}>
        {legend}
      </legend>
      <div
        className={`${styles.options} ${orientation === "horizontal" && layout !== "card" ? styles.horizontal : ""}`}
      >
        {options.map((option) => {
          const optionId = `${uid}-${option.value || "empty"}`;
          const optionDisabled = Boolean(disabled || option.disabled);
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={styles.radio}
              htmlFor={optionId}
              data-checked={checked || undefined}
              data-disabled={optionDisabled || undefined}
            >
              <input
                id={optionId}
                className={styles.input}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={optionDisabled}
                onChange={() => emit(option.value)}
              />
              {layout === "card" ? (
                <span className={styles.copy}>
                  <span className={styles.titleRow}>
                    <span className={styles.label}>{option.label}</span>
                    {option.badge ? (
                      <Badge size="sm" tone={option.badgeTone ?? "neutral"}>
                        {option.badge}
                      </Badge>
                    ) : null}
                  </span>
                  {option.description ? (
                    <span className={styles.description}>{option.description}</span>
                  ) : null}
                </span>
              ) : (
                <>
                  <span className={styles.control} aria-hidden>
                    <span className={styles.dot} />
                  </span>
                  <span className={styles.label}>{option.label}</span>
                </>
              )}
              {layout === "card" ? (
                <span className={styles.control} aria-hidden>
                  <span className={styles.dot} />
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      {message ? (
        <p id={messageId} className={`${styles.message}${error ? ` ${styles.messageError}` : ""}`}>
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
