"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar } from "../Calendar";
import { LucideByName } from "../Button/lucideName";
import controlStyles from "../shared/controls.module.css";
import type { DatePickerProps, DatePickerRange } from "./DatePicker.types";
import styles from "./DatePicker.module.css";

export type {
  DatePickerProps,
  DatePickerRange,
  DatePickerMode,
  DatePickerSize,
  DatePickerRangeProps,
  DatePickerSingleProps,
} from "./DatePicker.types";

const FOCUSABLE =
  "a, button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

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

function nextRange(current: DatePickerRange | undefined, iso: string): DatePickerRange {
  if (!current?.start || current.end) return { start: iso };
  return iso < current.start ? { start: iso, end: current.start } : { start: current.start, end: iso };
}

export function DatePicker(props: DatePickerProps) {
  const {
    id,
    size = "md",
    placeholder,
    disabled = false,
    error = false,
    minDate,
    maxDate,
    name,
    describedBy,
  } = props;
  const isRange = props.mode === "range";
  const fallbackId = useId();
  const triggerId = id || fallbackId;
  const panelId = `${triggerId}-calendar`;
  const isControlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string | DatePickerRange | undefined>(props.defaultValue);
  const selected = isControlled ? props.value : uncontrolled;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DatePickerRange | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const resolvedPlaceholder = placeholder ?? (isRange ? "Pick dates" : "Pick a date");
  const display = isRange
    ? formatRange(isRangeValue(selected) ? selected : undefined)
    : formatDisplay(typeof selected === "string" ? selected : undefined);
  const iconPx = size === "sm" ? 14 : 16;
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

  function closeOverlay() {
    setOpen(false);
    setDraft(null);
    triggerRef.current?.focus();
  }

  function openOverlay() {
    setDraft(isRange && isRangeValue(selected) ? selected : null);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setDraft(null);
        triggerRef.current?.focus();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        setDraft(null);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const root = panelRef.current;
    if (!root) return undefined;

    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    const firstFocusable = getFocusable()[0];
    (firstFocusable ?? root).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && root.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function commitSingle(iso: string) {
    if (!isControlled) setUncontrolled(iso);
    if (props.mode !== "range") props.onValueChange?.(iso);
    closeOverlay();
  }

  function commitRange(range: DatePickerRange) {
    if (!isControlled) setUncontrolled(range);
    if (props.mode === "range") props.onValueChange?.(range);
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
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        className={`${controlStyles.control} ${size === "sm" ? controlStyles.controlSm : controlStyles.controlMd} ${error ? controlStyles.controlError : ""} ${styles.trigger}`}
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
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label={isRange ? "Choose dates" : "Choose date"}
          tabIndex={-1}
        >
          {isRange ? (
            <span className={styles.srOnly} aria-live="polite">
              {rangeStatus}
            </span>
          ) : null}
          <Calendar
            size={size === "sm" ? "sm" : "md"}
            value={isRange ? undefined : typeof selected === "string" ? selected : undefined}
            start={picking?.start}
            end={picking?.end}
            onValueChange={isRange ? onRangeDay : commitSingle}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      ) : null}
    </div>
  );
}
