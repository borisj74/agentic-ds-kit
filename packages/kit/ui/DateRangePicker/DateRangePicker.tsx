"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MonthGrid } from "../DatePicker/MonthGrid";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import controlStyles from "../shared/controls.module.css";
import {
  defaultDateRangePresets,
  formatRangeLabel,
  nextRange,
  presetFor,
  type DateRange,
} from "./dateRange";
import type { DateRangePickerProps } from "./DateRangePicker.types";
import styles from "./DateRangePicker.module.css";

export type { DateRange, DateRangePreset, DateRangePickerProps, DateRangePickerSize } from "./DateRangePicker.types";
export { defaultDateRangePresets } from "./dateRange";

const FOCUSABLE =
  "a, button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

export function DateRangePicker({
  id,
  size = "md",
  value,
  defaultValue,
  onValueChange,
  presets,
  placeholder = "Pick dates",
  disabled = false,
  error = false,
  minDate,
  maxDate,
  name,
  describedBy,
  className,
  ref,
}: DateRangePickerProps) {
  const fallbackId = useId();
  const triggerId = id || fallbackId;
  const panelId = `${triggerId}-dialog`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const setTriggerRef = useMemo(() => mergeRefs(triggerRef, ref), [ref]);
  const [today] = useState(() => new Date());
  const resolvedPresets = presets ?? defaultDateRangePresets(today);
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<DateRange | undefined>(defaultValue);
  const selected = isControlled ? value : uncontrolled;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | null>(null);
  const picking = draft ?? selected;
  const matched = presetFor(resolvedPresets, selected);
  const display = matched?.label ?? formatRangeLabel(selected);
  const iconPx = size === "sm" ? 14 : 16;

  const close = useCallback((reason: "escape" | "outside") => {
    setOpen(false);
    setDraft(null);
    if (reason === "escape") triggerRef.current?.focus();
  }, []);

  useOverlayDismiss(open, rootRef, close);

  useEffect(() => {
    if (!open) return undefined;
    const root = panelRef.current;
    if (!root) return undefined;
    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    (getFocusable()[0] ?? root).focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !root) return;
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
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function commit(range: DateRange) {
    if (!isControlled) setUncontrolled(range);
    onValueChange?.(range);
    setDraft(null);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onDay(iso: string) {
    const next = nextRange(picking, iso);
    if (next.end) {
      commit(next);
      return;
    }
    setDraft(next);
  }

  const rangeStatus = !picking?.start
    ? "Pick a start date"
    : picking.end
      ? `${formatRangeLabel(picking)}`
      : "Pick an end date";
  const hidden = selected?.start ? (selected.end ? `${selected.start}/${selected.end}` : selected.start) : "";

  return (
    <div ref={rootRef} className={cx(styles.root, className)}>
      <button
        ref={setTriggerRef}
        id={triggerId}
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
        onClick={() => {
          if (disabled) return;
          if (open) close("escape");
          else {
            setDraft(selected ?? null);
            setOpen(true);
          }
        }}
      >
        <LucideByName name="CalendarDays" size={iconPx} className={styles.icon} />
        <span className={display ? styles.value : styles.placeholder}>{display || placeholder}</span>
      </button>
      {name ? <input type="hidden" name={name} value={hidden} /> : null}
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label="Choose dates"
          tabIndex={-1}
        >
          <span className={styles.srOnly} aria-live="polite">
            {rangeStatus}
          </span>
          {resolvedPresets.length > 0 ? (
            <div className={styles.presets} role="group" aria-label="Presets">
              {resolvedPresets.map((preset) => {
                const pressed = presetFor([preset], selected) !== undefined;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={styles.preset}
                    aria-pressed={pressed}
                    onClick={() => commit({ start: preset.start, end: preset.end })}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          ) : null}
          <MonthGrid
            size={size === "sm" ? "sm" : "md"}
            start={picking?.start}
            end={picking?.end}
            onValueChange={onDay}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      ) : null}
    </div>
  );
}
