"use client";

import { useId, useState } from "react";
import { Badge } from "@/ui/Badge";
import type { RadioGroupProps } from "./RadioGroup.types";
import styles from "./RadioGroup.module.css";

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
}: RadioGroupProps) {
  const uid = useId();
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = isControlled ? valueProp : uncontrolled;
  const message = error || hint;
  const messageId = message ? `${uid}-message` : undefined;

  function emit(next: string) {
    if (disabled) return;
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  return (
    <fieldset
      className={`${styles.group} ${styles[size]} ${layout === "card" ? styles.card : ""}${error ? ` ${styles.groupError}` : ""}`}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={messageId}
    >
      <legend className={hideLegend ? styles.legendHidden : styles.legend}>{legend}</legend>
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
                aria-invalid={error ? true : undefined}
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
