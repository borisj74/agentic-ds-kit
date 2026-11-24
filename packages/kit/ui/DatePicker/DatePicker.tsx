"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MonthGrid } from "./MonthGrid";
import { OverlayHeader } from "../ModalCard/ModalCardParts";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import controlStyles from "../shared/controls.module.css";
import panelStyles from "../shared/pickerPanel.module.css";
import { usePickerFocus } from "../shared/pickerPanel";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import type { DatePickerProps, DatePickerRange } from "./DatePicker.types";
import styles from "./DatePicker.module.css";
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";

export type {
  DatePickerProps,
  DatePickerRange,
  DatePickerMode,
  DatePickerSize,
  DatePickerRangeProps,
  DatePickerSingleProps,
} from "./DatePicker.types";

function parseISODate(iso?: string): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

function formatDisplay(iso?: string): string {
  const date = parseISODate(iso);
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRange(range?: DatePickerRange): string {
  if (!range?.start) return "";
  const start = formatDisplay(range.start);
  if (!range.end) return start;
  return `${start} – ${formatDisplay(range.end)}`;
}

function isRangeValue(value: string | DatePickerRange | undefined): value is DatePickerRange {
  return typeof value === "object" && value !== null;
}

const CONTROL_SIZE = { sm: controlStyles.controlSm, md: controlStyles.controlMd, lg: controlStyles.controlLg } as const;
const ICON_PX = { sm: 14, md: 16, lg: 18 } as const;

let warnedRange = false;

function nextRange(current: DatePickerRange | undefined, iso: string): DatePickerRange {
  if (!current?.start || current.end) return { start: iso };
  return iso < current.start ? { start: iso, end: current.start } : { start: current.start, end: iso };
}

export function DatePicker(props: DatePickerProps) {
  const labels = useKitLabels();
  const {
    id,
    size = "md",
    placeholder,
    disabled = false,
    error = false,
    minDate,
    maxDate,
    weekStart,
    isDateDisabled,
    name,
    describedBy,
    className,
    ref,
    mode,
    value,
    defaultValue,
    onValueChange,
    ...rest
  } = props;
  const isRange = mode === "range";
  const fallbackId = useId();
  const triggerId = id || fallbackId;
  const panelId = `${triggerId}-calendar`;
  const titleId = `${triggerId}-calendar-title`;
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string | DatePickerRange | undefined>(defaultValue);
  const selected = isControlled ? value : uncontrolled;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DatePickerRange | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const setTriggerRef = useMemo(() => mergeRefs(triggerRef, ref), [ref]);
  const panelRef = useRef<HTMLDivElement>(null);
  const resolvedPlaceholder = placeholder ?? (isRange ? "Pick dates" : "Pick a date");
  const display = isRange
    ? formatRange(isRangeValue(selected) ? selected : undefined)
    : formatDisplay(typeof selected === "string" ? selected : undefined);
  const iconPx = ICON_PX[size];
  const picking = isRange ? (draft ?? (isRangeValue(selected) ? selected : undefined)) : undefined;
  const hiddenValue = isRange
    ? isRangeValue(selected)
      ? selected.end
        ? `${selected.start}/${selected.end}`
        : selected.start
      : ""
    : typeof selected === "string"
      ? selected
      : "";

  const closeOverlay = useCallback(() => {
    setOpen(false);
    setDraft(null);
    triggerRef.current?.focus();
  }, []);

  function openOverlay() {
    setDraft(isRange && isRangeValue(selected) ? selected : null);
    setOpen(true);
  }

  // Escape (only when this is the newest open overlay) and a pointer down outside close the panel.
  useOverlayDismiss(open, rootRef, closeOverlay);
  usePickerFocus(open, panelRef);

  useEffect(() => {
    if (isRange && !warnedRange && process.env.NODE_ENV !== "production") {
      warnedRange = true;
      console.warn("DatePicker mode=\"range\" is deprecated. Use DateRangePicker (presets={[]} for the month grid only).");
    }
  }, [isRange]);

  function commitSingle(iso: string) {
    if (!isControlled) setUncontrolled(iso);
    if (!isRange) (onValueChange as ((date: string) => void) | undefined)?.(iso);
    closeOverlay();
  }

  function commitRange(range: DatePickerRange) {
    if (!isControlled) setUncontrolled(range);
    if (isRange) (onValueChange as ((next: DatePickerRange) => void) | undefined)?.(range);
    setDraft(null);
    closeOverlay();
  }

  function onRangeDay(iso: string) {
    const next = nextRange(picking, iso);
    if (next.end) {
      commitRange(next);
      return;
    }
    setDraft(next);
  }

  const rangeStatus = !picking?.start
    ? "Pick a start date"
    : picking.end
      ? `${formatDisplay(picking.start)} – ${formatDisplay(picking.end)}`
      : "Pick an end date";

  return (
    <div {...nisthaAttr("datepicker")} ref={rootRef} className={cx(styles.root, className)}>
      <button
        {...rest}
        ref={setTriggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-describedby={describedBy}
        className={cx(
          controlStyles.control,
          CONTROL_SIZE[size],
          error && controlStyles.controlError,
          styles.trigger,
        )}
        onClick={() => {
          if (disabled) return;
          if (open) closeOverlay();
          else openOverlay();
        }}
      >
        <LucideByName name="CalendarDays" size={iconPx} className={styles.icon} />
        <span className={display ? styles.value : styles.placeholder}>{display || resolvedPlaceholder}</span>
      </button>
      {name ? <input type="hidden" name={name} value={hiddenValue} /> : null}
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className={cx(panelStyles.panel, size === "sm" && panelStyles.sm)}
          role="dialog"
          aria-modal="true"
          aria-label={isRange ? labels.chooseDates : labels.chooseDate}
          data-kit-date-panel=""
          tabIndex={-1}
        >
          <OverlayHeader
            className={panelStyles.header}
            icon="CalendarDays"
            eyebrow={isRange ? rangeStatus : display || resolvedPlaceholder}
            title={isRange ? labels.chooseDates : labels.chooseDate}
            titleId={titleId}
            descriptionId={`${titleId}-description`}
            onClose={closeOverlay}
          />
          {isRange ? (
            <span className={panelStyles.srOnly} aria-live="polite">
              {rangeStatus}
            </span>
          ) : null}
          <div className={cx(styles.body, size === "sm" && styles.bodySm)} data-part="body" data-autofocus="">
          <MonthGrid
            bare
            size={size === "sm" ? "sm" : "md"}
            value={isRange ? undefined : typeof selected === "string" ? selected : undefined}
            start={picking?.start}
            end={picking?.end}
            onValueChange={isRange ? onRangeDay : commitSingle}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            weekStart={weekStart}
            isDateDisabled={isDateDisabled}
          />
          </div>
        </div>
      ) : null}
    </div>
  );
}
