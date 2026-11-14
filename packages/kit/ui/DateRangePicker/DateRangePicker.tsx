"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "../Button";
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
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";

export type { DateRange, DateRangePreset, DateRangePickerProps, DateRangePickerSize } from "./DateRangePicker.types";
export { defaultDateRangePresets } from "./dateRange";

/** Below --grid-breakpoint-sm (40rem) the panel shows one month; media queries cannot read var(). */
const NARROW = "(width < 40rem)";

function subscribeNarrow(onChange: () => void) {
  const media = window.matchMedia(NARROW);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function monthOf(iso?: string): string {
  const match = iso ? /^(\d{4})-(\d{2})/.exec(iso) : null;
  if (match) return `${match[1]}-${match[2]}-01`;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

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
  const labels = useKitLabels();
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
  const [view, setView] = useState(() => monthOf(selected?.start));
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);
  const matched = presetFor(resolvedPresets, selected);
  const display = matched?.label ?? formatRangeLabel(selected);
  const iconPx = size === "sm" ? 14 : 16;

  // Closing without Apply (Cancel, Escape, a click outside) leaves the value as it was.
  const close = useCallback((reason: "escape" | "outside") => {
    setOpen(false);
    setDraft(null);
    setHoverDate(null);
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

  function apply() {
    if (!draft?.start || !draft.end) return;
    if (!isControlled) setUncontrolled(draft);
    onValueChange?.(draft);
    setDraft(null);
    setHoverDate(null);
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Picks stay pending until Apply: a day or a preset only changes the draft.
  function onDay(iso: string) {
    setDraft(nextRange(draft ?? undefined, iso));
  }

  function onPreset(start: string, end: string) {
    setDraft({ start, end });
    setView(monthOf(start));
  }

  const rangeStatus = !draft?.start
    ? "Pick a start date"
    : draft.end
      ? `${formatRangeLabel(draft)}`
      : "Pick an end date";
  const draftPreset = presetFor(resolvedPresets, draft ?? undefined);
  const gridProps = {
    size: size === "sm" ? ("sm" as const) : ("md" as const),
    start: draft?.start,
    end: draft?.end,
    onValueChange: onDay,
    disabled,
    minDate,
    maxDate,
    bare: true,
    hoverDate,
    onHoverDateChange: setHoverDate,
  };
  const hidden = selected?.start ? (selected.end ? `${selected.start}/${selected.end}` : selected.start) : "";

  return (
    <div {...nisthaAttr("daterangepicker")} ref={rootRef} className={cx(styles.root, className)}>
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
            setView(monthOf(selected?.start));
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
          aria-label={labels.chooseDates}
          tabIndex={-1}
        >
          <span className={styles.srOnly} aria-live="polite">
            {rangeStatus}
          </span>
          <div className={styles.body}>
            {resolvedPresets.length > 0 ? (
              <div className={styles.presets} role="group" aria-label={labels.presets}>
                {resolvedPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={styles.preset}
                    aria-pressed={draftPreset?.id === preset.id}
                    onClick={() => onPreset(preset.start, preset.end)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className={styles.months}>
              <MonthGrid {...gridProps} view={view} onViewChange={setView} nav={narrow ? "both" : "prev"} />
              {narrow ? null : (
                <MonthGrid
                  {...gridProps}
                  view={shiftMonth(view, 1)}
                  onViewChange={(month) => setView(shiftMonth(month, -1))}
                  nav="next"
                />
              )}
            </div>
          </div>
          <div className={styles.footer}>
            <p className={styles.status}>{rangeStatus}</p>
            <div className={styles.actions}>
              <Button size="sm" appearance="outline" mode="neutral" onClick={() => close("escape")}>
                Cancel
              </Button>
              <Button size="sm" appearance="solid" mode="primary" disabled={!draft?.end} onClick={apply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
