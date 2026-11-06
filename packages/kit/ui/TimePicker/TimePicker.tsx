"use client";

import { useState } from "react";
import { cx } from "../shared/cx";
import controlStyles from "../shared/controls.module.css";
import { bump, formatTime, parseTime, toTime, togglePeriod } from "./time";
import type { TimePickerProps } from "./TimePicker.types";
import styles from "./TimePicker.module.css";

export type { HourCycle, TimePickerProps, TimePickerSize } from "./TimePicker.types";
export { formatTime } from "./time";

export function TimePicker({
  id,
  size = "md",
  value,
  defaultValue,
  onValueChange,
  hourCycle = "12",
  disabled = false,
  error = false,
  name,
  describedBy,
  ariaLabel,
  className,
}: TimePickerProps) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "09:00");
  const current = isControlled ? value : uncontrolled;
  const { hour, minute } = parseTime(current);
  const period = hour >= 12 ? "PM" : "AM";
  const hourLabel = hourCycle === "24" ? String(hour).padStart(2, "0") : String(hour % 12 || 12);

  function emit(nextHour: number, nextMinute: number) {
    const next = toTime(nextHour, nextMinute);
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  }

  const sizeClass = size === "sm" ? controlStyles.controlSm : controlStyles.controlMd;

  return (
    <div
      className={cx(controlStyles.control, sizeClass, error && controlStyles.controlError, styles.shell, className)}
      role="group"
      aria-label={ariaLabel ?? "Time"}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
    >
      <input
        id={id}
        className={styles.segment}
        role="spinbutton"
        inputMode="numeric"
        aria-label="Hour"
        aria-valuenow={hourCycle === "24" ? hour : hour % 12 || 12}
        aria-valuemin={hourCycle === "24" ? 0 : 1}
        aria-valuemax={hourCycle === "24" ? 23 : 12}
        aria-valuetext={formatTime(current, hourCycle)}
        aria-describedby={describedBy}
        disabled={disabled}
        value={hourLabel}
        onChange={() => undefined}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            emit(bump(hour, 1, 24), minute);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            emit(bump(hour, -1, 24), minute);
          }
        }}
      />
      <span className={styles.colon} aria-hidden>
        :
      </span>
      <input
        className={styles.segment}
        role="spinbutton"
        inputMode="numeric"
        aria-label="Minute"
        aria-valuenow={minute}
        aria-valuemin={0}
        aria-valuemax={59}
        disabled={disabled}
        value={String(minute).padStart(2, "0")}
        onChange={() => undefined}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            emit(hour, bump(minute, 1, 60));
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            emit(hour, bump(minute, -1, 60));
          }
        }}
      />
      {hourCycle === "12" ? (
        <button
          type="button"
          className={styles.period}
          aria-label={`Period, ${period}`}
          disabled={disabled}
          onClick={() => emit(togglePeriod(hour), minute)}
        >
          {period}
        </button>
      ) : null}
      {name ? <input type="hidden" name={name} value={toTime(hour, minute)} /> : null}
    </div>
  );
}
