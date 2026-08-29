"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar } from "@/ui/Calendar";
import { LucideByName } from "@/ui/Button/lucideName";
import controlStyles from "../shared/controls.module.css";
import type { DatePickerProps } from "./DatePicker.types";
import styles from "./DatePicker.module.css";

export type { DatePickerProps, DatePickerSize } from "./DatePicker.types";

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

export function DatePicker({
  id,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  placeholder = "Pick a date",
  disabled = false,
  error = false,
  minDate,
  maxDate,
  name,
}: DatePickerProps) {
  const fallbackId = useId();
  const triggerId = id || fallbackId;
  const panelId = `${triggerId}-calendar`;
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = isControlled ? value : uncontrolled;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const display = formatDisplay(selected);
  const iconPx = size === "sm" ? 14 : 16;

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
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

  function commit(iso: string) {
    if (!isControlled) setUncontrolled(iso);
    onValueChange?.(iso);
    setOpen(false);
    triggerRef.current?.focus();
  }

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
        className={`${controlStyles.control} ${size === "sm" ? controlStyles.controlSm : controlStyles.controlMd} ${error ? controlStyles.controlError : ""} ${styles.trigger}`}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
      >
        <LucideByName name="CalendarDays" size={iconPx} className={styles.icon} />
        <span className={display ? styles.value : styles.placeholder}>{display || placeholder}</span>
      </button>
      {name ? <input type="hidden" name={name} value={selected ?? ""} /> : null}
      {open ? (
        <div id={panelId} className={styles.panel} role="dialog" aria-label="Choose date">
          <Calendar
            size={size === "sm" ? "sm" : "md"}
            value={selected}
            onValueChange={commit}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      ) : null}
    </div>
  );
}
