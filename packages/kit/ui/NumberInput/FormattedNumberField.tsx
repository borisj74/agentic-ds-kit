"use client";

import { useState } from "react";
import { Button } from "../Button";
import { cx } from "../shared/cx";
import controlStyles from "../shared/controls.module.css";
import { bumpNumber, clampNumber, currencyAffix, editNumber, formatNumber, parseNumber } from "./numberFormat";
import type { NumberInputProps } from "./NumberInput.types";
import styles from "./NumberInput.module.css";
import { useKitLabels } from "../shared/labels";

export interface FormattedNumberFieldProps extends NumberInputProps {
  /** ISO 4217 code. When set, the symbol sits beside the number and the value formats as money. */
  currency?: string;
}

export function FormattedNumberField({
  id,
  size = "md",
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  step = 1,
  locale,
  currency,
  placeholder,
  disabled = false,
  error = false,
  name,
  describedBy,
  ariaLabel,
  steppers = true,
  className,
  ref,
}: FormattedNumberFieldProps) {
  const labels = useKitLabels();
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<number | null>(defaultValue);
  const numeric = isControlled ? value : uncontrolled;
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const affix = currency ? currencyAffix(locale, currency) : {};
  const shown = draft !== null ? draft : numeric === null || numeric === undefined ? "" : formatNumber(numeric, locale, currency);
  const sizeClass =
    size === "sm" ? controlStyles.controlSm : size === "lg" ? controlStyles.controlLg : controlStyles.controlMd;
  const atMin = min !== undefined && numeric !== null && numeric !== undefined && numeric <= min;
  const atMax = max !== undefined && numeric !== null && numeric !== undefined && numeric >= max;

  function emit(next: number | null) {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  function commit(text: string) {
    const parsed = parseNumber(text, locale);
    emit(parsed === null ? null : clampNumber(parsed, min, max));
    setDraft(null);
  }

  function stepBy(direction: 1 | -1) {
    const base = draft !== null ? parseNumber(draft, locale) : numeric;
    const next = bumpNumber(base, direction, step, min, max);
    emit(next);
    if (focused) setDraft(editNumber(next, locale));
  }

  return (
    <div
      className={cx(controlStyles.control, sizeClass, error && controlStyles.controlError, styles.shell, className)}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
    >
      {affix.start ? (
        <span className={styles.affix} aria-hidden>
          {affix.start}
        </span>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={styles.native}
        role="spinbutton"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={shown}
        aria-invalid={error || undefined}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-valuenow={typeof numeric === "number" ? numeric : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={shown || undefined}
        onFocus={() => {
          setFocused(true);
          setDraft(typeof numeric === "number" ? editNumber(numeric, locale) : "");
        }}
        onBlur={(event) => {
          setFocused(false);
          commit(event.target.value);
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            stepBy(1);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            stepBy(-1);
          } else if (event.key === "Enter") {
            event.preventDefault();
            commit(draft ?? event.currentTarget.value);
          }
        }}
      />
      {affix.end ? (
        <span className={styles.affix} aria-hidden>
          {affix.end}
        </span>
      ) : null}
      {name ? <input type="hidden" name={name} value={typeof numeric === "number" ? String(numeric) : ""} /> : null}
      {steppers ? (
        <span className={styles.steppers}>
          <Button
            appearance="ghost"
            mode="neutral"
            size="sm"
            iconStart="Minus"
            ariaLabel={labels.decreaseValue}
            disabled={disabled || atMin}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => stepBy(-1)}
          />
          <Button
            appearance="ghost"
            mode="neutral"
            size="sm"
            iconStart="Plus"
            ariaLabel={labels.increaseValue}
            disabled={disabled || atMax}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => stepBy(1)}
          />
        </span>
      ) : null}
    </div>
  );
}
