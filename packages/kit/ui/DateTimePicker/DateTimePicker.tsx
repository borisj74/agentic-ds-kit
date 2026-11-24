"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Button } from "../Button";
import { MonthGrid } from "../DatePicker/MonthGrid";
import { OverlayHeader } from "../ModalCard/ModalCardParts";
import { LucideByName } from "../Button/lucideName";
import { TimePicker } from "../TimePicker";
import { formatTime } from "../TimePicker/time";
import { formatDateLabel } from "../DateRangePicker/dateRange";
import { cx } from "../shared/cx";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import controlStyles from "../shared/controls.module.css";
import panelStyles from "../shared/pickerPanel.module.css";
import { usePickerFocus } from "../shared/pickerPanel";
import type { DateTimePickerProps, DateTimeValue } from "./DateTimePicker.types";
import styles from "./DateTimePicker.module.css";
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";

export type { DateTimePickerProps, DateTimePickerSize, DateTimeValue } from "./DateTimePicker.types";

const CONTROL_SIZE = { sm: controlStyles.controlSm, md: controlStyles.controlMd, lg: controlStyles.controlLg } as const;
const ICON_PX = { sm: 14, md: 16, lg: 18 } as const;

export function DateTimePicker({
  id,
  size = "md",
  value,
  defaultValue,
  onValueChange,
  hourCycle = "12",
  disabled = false,
  error = false,
  minDate,
  maxDate,
  name,
  describedBy,
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
  const labels = useKitLabels();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
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
  usePickerFocus(open, panelRef);

  function emit(next: DateTimeValue) {
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  }

  const hidden = current.date && current.time ? `${current.date}T${current.time}` : current.date ?? "";

  return (
    <div {...nisthaAttr("datetimepicker")} ref={rootRef} className={cx(styles.root, className)}>
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
          CONTROL_SIZE[size],
          error && controlStyles.controlError,
          styles.trigger,
        )}
        onClick={() => setOpen((was) => !was)}
      >
        <LucideByName name="CalendarDays" size={ICON_PX[size]} className={styles.icon} />
        <span className={display ? styles.value : styles.placeholder}>{display || placeholder}</span>
      </button>
      {name ? <input type="hidden" name={name} value={hidden} /> : null}
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={labels.chooseDateAndTime}
          className={cx(panelStyles.panel, size === "sm" && panelStyles.sm)}
          tabIndex={-1}
        >
          <OverlayHeader
            className={panelStyles.header}
            icon="CalendarDays"
            eyebrow={display || placeholder}
            title={labels.chooseDateAndTime}
            titleId={`${panelId}-title`}
            descriptionId={`${panelId}-description`}
            onClose={() => close("escape")}
          />
          <div className={cx(styles.body, size === "sm" && styles.bodySm)} data-part="body">
            <div data-autofocus="">
              <MonthGrid
                bare
                size={size === "sm" ? "sm" : "md"}
                value={current.date}
                minDate={minDate}
                maxDate={maxDate}
                onValueChange={(date) => emit({ ...current, date })}
              />
            </div>
            <div className={styles.time}>
              <TimePicker
                id={`${id}-time`}
                size={size === "sm" ? "sm" : "md"}
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
        </div>
      ) : null}
    </div>
  );
}
