"use client";

import { useId, useState } from "react";
import type { RadioGroupProps } from "./RadioGroup.types";
import styles from "./RadioGroup.module.css";

export type {
  RadioGroupProps,
  RadioGroupOption,
  RadioGroupOrientation,
  RadioGroupSize,
} from "./RadioGroup.types";

export function RadioGroup({
  name,
  legend,
  size = "md",
  orientation = "vertical",
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
      className={`${styles.group} ${styles[size]}${error ? ` ${styles.groupError}` : ""}`}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={messageId}
    >
      <legend className={styles.legend}>{legend}</legend>
      <div
        className={`${styles.options} ${orientation === "horizontal" ? styles.horizontal : ""}`}
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
              <span className={styles.control} aria-hidden>
                <span className={styles.dot} />
              </span>
              <span className={styles.label}>{option.label}</span>
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
