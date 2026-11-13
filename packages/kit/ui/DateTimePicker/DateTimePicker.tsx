"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Button } from "../Button";
import { MonthGrid } from "../DatePicker/MonthGrid";
import { LucideByName } from "../Button/lucideName";
import { TimePicker } from "../TimePicker";
import { formatTime } from "../TimePicker/time";
import { formatDateLabel } from "../DateRangePicker/dateRange";
import { cx } from "../shared/cx";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import controlStyles from "../shared/controls.module.css";
import type { DateTimePickerProps, DateTimeValue } from "./DateTimePicker.types";
import styles from "./DateTimePicker.module.css";
import { useKitLabels } from "../shared/labels";

export type { DateTimePickerProps, DateTimePickerSize, DateTimeValue } from "./DateTimePicker.types";

export function DateTimePicker({
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
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
  const labels = useKitLabels();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<DateTimeValue>(defaultValue ?? {});
  const current = isControlled ? value : uncontrolled;
  const [open, setOpen] = useState(false);
  const displayDate = formatDateLabel(current.date);
  const displayTime = current.time ? formatTime(current.time, hourCycle) : "";
  const display = displayDate && displayTime ? `${displayDate}, ${displayTime}` : displayDate || displayTime;

  const close = useCallback((reason: "escape" | "outside") => {
    setOpen(false);
    if (reason === "escape") triggerRef.current?.focus();
  }, []);
  useOverlayDismiss(open, rootRef, close);

  function emit(next: DateTimeValue) {
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  }

  const hidden = current.date && current.time ? `${current.date}T${current.time}` : current.date ?? "";

  return (
    <div ref={rootRef} className={cx(styles.root, className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-describedby={describedBy}
        className={cx(
          controlStyles.control,
          size === "sm" ? controlStyles.controlSm : controlStyles.controlMd,
          error && controlStyles.controlError,
          styles.trigger,
        )}
        onClick={() => setOpen((was) => !was)}
      >
        <LucideByName name="CalendarDays" size={size === "sm" ? 14 : 16} className={styles.icon} />
        <span className={display ? styles.value : styles.placeholder}>{display || placeholder}</span>
      </button>
      {name ? <input type="hidden" name={name} value={hidden} /> : null}
      {open ? (
        <div id={panelId} role="dialog" aria-label={labels.chooseDateAndTime} className={styles.panel} tabIndex={-1}>
          <MonthGrid
            size={size === "sm" ? "sm" : "md"}
            value={current.date}
            onValueChange={(date) => emit({ ...current, date })}
          />
          <div className={styles.time}>
            <TimePicker
              id={`${id}-time`}
              size={size}
              hourCycle={hourCycle}
              value={current.time ?? "09:00"}
              onValueChange={(time) => emit({ ...current, time })}
              ariaLabel={labels.time}
            />
            <Button appearance="outline" mode="neutral" size="sm" onClick={() => close("escape")}>
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
