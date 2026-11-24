"use client";

import { useCallback, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "../Button";
import { Drawer } from "../Drawer";
import { Input } from "../Input";
import { MonthGrid } from "../DatePicker/MonthGrid";
import { OverlayHeader } from "../ModalCard/ModalCardParts";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import controlStyles from "../shared/controls.module.css";
import panelStyles from "../shared/pickerPanel.module.css";
import { isISODate, usePickerFocus } from "../shared/pickerPanel";
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

const CONTROL_SIZE = { sm: controlStyles.controlSm, md: controlStyles.controlMd, lg: controlStyles.controlLg } as const;
const ICON_PX = { sm: 14, md: 16, lg: 18 } as const;

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
  weekStart,
  isDateDisabled,
  name,
  describedBy,
  className,
  ref,
}: DateRangePickerProps) {
  const labels = useKitLabels();
  const fallbackId = useId();
  const triggerId = id || fallbackId;
  const panelId = `${triggerId}-dialog`;
  const titleId = `${triggerId}-dialog-title`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
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
  // The typed start and end in the footer; a valid, available day updates the pending range.
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);
  const matched = presetFor(resolvedPresets, selected);
  const display = matched?.label ?? formatRangeLabel(selected);
  const iconPx = ICON_PX[size];

  // Closing without Apply (Cancel, Escape, a click outside) leaves the value as it was.
  const close = useCallback((reason: "escape" | "outside") => {
    setOpen(false);
    setDraft(null);
    setHoverDate(null);
    if (reason === "escape") triggerRef.current?.focus();
  }, []);

  // Below 40rem the panel is a bottom sheet (kit Drawer, portaled); its panel is not "outside".
  useOverlayDismiss(open, rootRef, close, sheetRef);
  usePickerFocus(open && !narrow, panelRef);

  function setPending(next: DateRange | null) {
    setDraft(next);
    setStartText(next?.start ?? "");
    setEndText(next?.end ?? "");
  }

  function available(iso: string): boolean {
    if (!isISODate(iso)) return false;
    if (minDate && iso < minDate) return false;
    if (maxDate && iso > maxDate) return false;
    return !isDateDisabled?.(iso);
  }

  function onStartText(text: string) {
    setStartText(text);
    if (!available(text)) return;
    const end = draft?.end && draft.end >= text ? draft.end : undefined;
    setDraft({ start: text, end });
    if (!end) setEndText("");
    setView(monthOf(text));
  }

  function onEndText(text: string) {
    setEndText(text);
    if (!available(text) || !draft?.start || text < draft.start) return;
    setDraft({ start: draft.start, end: text });
  }

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
    setPending(nextRange(draft ?? undefined, iso));
  }

  function onPreset(start: string, end: string) {
    setPending({ start, end });
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
    weekStart,
    isDateDisabled,
    bare: true,
    hoverDate,
    onHoverDateChange: setHoverDate,
  };
  const presetGroup =
    resolvedPresets.length > 0 ? (
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
    ) : null;
  const typed = (
    <div className={styles.typed}>
      <Input
        id={`${triggerId}-start`}
        size="sm"
        className={styles.typedInput}
        ariaLabel={labels.startDate}
        placeholder="YYYY-MM-DD"
        value={startText}
        error={startText !== "" && !available(startText)}
        onChange={onStartText}
        disabled={disabled}
      />
      <span className={styles.to}>{labels.rangeTo}</span>
      <Input
        id={`${triggerId}-end`}
        size="sm"
        className={styles.typedInput}
        ariaLabel={labels.endDate}
        placeholder="YYYY-MM-DD"
        value={endText}
        error={endText !== "" && (!available(endText) || Boolean(draft?.start && endText < draft.start))}
        onChange={onEndText}
        disabled={disabled}
      />
    </div>
  );
  const actions = (
    <div className={styles.actions}>
      <Button size="sm" appearance="outline" mode="neutral" onClick={() => close("escape")}>
        Cancel
      </Button>
      <Button size="sm" appearance="solid" mode="primary" disabled={!draft?.end} onClick={apply}>
        Apply
      </Button>
    </div>
  );
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
          CONTROL_SIZE[size],
          error && controlStyles.controlError,
          styles.trigger,
        )}
        onClick={() => {
          if (disabled) return;
          if (open) close("escape");
          else {
            setPending(selected ?? null);
            setView(monthOf(selected?.start));
            setOpen(true);
          }
        }}
      >
        <LucideByName name="CalendarDays" size={iconPx} className={styles.icon} />
        <span className={display ? cx(styles.value, !matched && styles.mono) : styles.placeholder}>{display || placeholder}</span>
      </button>
      {name ? <input type="hidden" name={name} value={hidden} /> : null}
      {open && narrow ? (
        <Drawer
          ref={sheetRef}
          open
          side="bottom"
          id={panelId}
          aria-label={labels.chooseDates}
          title={labels.chooseDates}
          eyebrow={rangeStatus}
          onClose={() => close("escape")}
          footer={actions}
        >
          <span className={panelStyles.srOnly} aria-live="polite">
            {rangeStatus}
          </span>
          <div className={styles.sheetBody}>
            {presetGroup}
            <MonthGrid {...gridProps} view={view} onViewChange={setView} nav="both" />
            {typed}
          </div>
        </Drawer>
      ) : open ? (
        <div
          ref={panelRef}
          id={panelId}
          className={cx(panelStyles.panel, size === "sm" && panelStyles.sm)}
          role="dialog"
          aria-modal="true"
          aria-label={labels.chooseDates}
          tabIndex={-1}
        >
          <OverlayHeader
            className={panelStyles.header}
            icon="CalendarDays"
            eyebrow={rangeStatus}
            title={labels.chooseDates}
            titleId={titleId}
            descriptionId={`${titleId}-description`}
            onClose={() => close("escape")}
          />
          <span className={panelStyles.srOnly} aria-live="polite">
            {rangeStatus}
          </span>
          <div className={styles.body} data-part="body">
            {presetGroup}
            <div className={styles.months}>
              <MonthGrid {...gridProps} view={view} onViewChange={setView} nav="prev" />
              <MonthGrid
                {...gridProps}
                view={shiftMonth(view, 1)}
                onViewChange={(month) => setView(shiftMonth(month, -1))}
                nav="next"
              />
            </div>
          </div>
          <div className={styles.footer}>
            {typed}
            {actions}
          </div>
        </div>
      ) : null}
    </div>
  );
}
