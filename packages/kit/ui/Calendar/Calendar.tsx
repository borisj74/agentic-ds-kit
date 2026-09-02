"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../Button";
import type { CalendarProps } from "./Calendar.types";
import styles from "./Calendar.module.css";

export type { CalendarProps, CalendarSize } from "./Calendar.types";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

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

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
}

function addMonths(date: Date, delta: number): Date {
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(date.getDate(), lastDay));
}

function monthFromISO(iso?: string): Date {
  const parsed = parseISODate(iso);
  const base = parsed ?? new Date();
  return startOfMonth(base);
}

function buildWeeks(view: Date): Date[][] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const start = new Date(view.getFullYear(), view.getMonth(), 1 - first.getDay());
  const weeks: Date[][] = [];
  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: Date[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      week.push(addDays(start, weekIndex * 7 + dayIndex));
    }
    weeks.push(week);
  }
  return weeks;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayIsDisabled(date: Date, minDate?: string, maxDate?: string, calendarDisabled?: boolean): boolean {
  if (calendarDisabled) return true;
  const iso = toISODate(date);
  if (minDate && iso < minDate) return true;
  if (maxDate && iso > maxDate) return true;
  return false;
}

function dayName(date: Date, isToday: boolean, isSelected: boolean): string {
  const label = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const extras = [label];
  if (isToday) extras.push("today");
  if (isSelected) extras.push("selected");
  return extras.join(", ");
}

export function Calendar({
  value,
  defaultValue,
  onValueChange,
  size = "md",
  disabled = false,
  minDate,
  maxDate,
}: CalendarProps) {
  const headingId = useId();
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const selectedISO = isControlled ? value : uncontrolledValue;
  const selectedDate = parseISODate(selectedISO);

  const [view, setView] = useState(() => monthFromISO(selectedISO ?? defaultValue));
  const [focusedISO, setFocusedISO] = useState(
    () => selectedISO ?? toISODate(new Date()),
  );
  const [seenValue, setSeenValue] = useState(value);

  if (isControlled && value !== seenValue) {
    setSeenValue(value);
    const next = parseISODate(value);
    if (next) {
      if (view.getFullYear() !== next.getFullYear() || view.getMonth() !== next.getMonth()) {
        setView(startOfMonth(next));
      }
      setFocusedISO(value);
    }
  }

  const dayRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const moveFocusRef = useRef(false);

  const today = new Date();
  const todayISO = toISODate(today);
  const weeks = buildWeeks(view);
  const monthLabel = view.toLocaleString("en-US", { month: "long", year: "numeric" });

  const lastPrev = new Date(view.getFullYear(), view.getMonth(), 0);
  const firstNext = new Date(view.getFullYear(), view.getMonth() + 1, 1);
  const prevDisabled = disabled || Boolean(minDate && toISODate(lastPrev) < minDate);
  const nextDisabled = disabled || Boolean(maxDate && toISODate(firstNext) > maxDate);

  useLayoutEffect(() => {
    if (!moveFocusRef.current) return;
    moveFocusRef.current = false;
    dayRefs.current.get(focusedISO)?.focus();
  }, [focusedISO, view]);

  function commit(date: Date) {
    if (dayIsDisabled(date, minDate, maxDate, disabled)) return;
    const iso = toISODate(date);
    if (!isControlled) setUncontrolledValue(iso);
    onValueChange?.(iso);
    setView(startOfMonth(date));
    setFocusedISO(iso);
  }

  function goMonth(delta: number) {
    const next = startOfMonth(addMonths(view, delta));
    const from = parseISODate(focusedISO) ?? view;
    const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    const day = Math.min(from.getDate(), last);
    setView(next);
    setFocusedISO(toISODate(new Date(next.getFullYear(), next.getMonth(), day)));
  }

  function moveTo(date: Date) {
    moveFocusRef.current = true;
    setFocusedISO(toISODate(date));
    setView(startOfMonth(date));
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = parseISODate(focusedISO) ?? today;
    let next: Date | null = null;

    switch (event.key) {
      case "ArrowLeft":
        next = addDays(current, -1);
        break;
      case "ArrowRight":
        next = addDays(current, 1);
        break;
      case "ArrowUp":
        next = addDays(current, -7);
        break;
      case "ArrowDown":
        next = addDays(current, 7);
        break;
      case "Home":
        next = addDays(current, -current.getDay());
        break;
      case "End":
        next = addDays(current, 6 - current.getDay());
        break;
      case "PageUp":
        next = addMonths(current, -1);
        break;
      case "PageDown":
        next = addMonths(current, 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(current);
        return;
      default:
        return;
    }

    event.preventDefault();
    if (next) moveTo(next);
  }

  return (
    <div
      className={`${styles.calendar} ${styles[size]}`}
      data-disabled={disabled || undefined}
    >
      <div className={styles.header}>
        <Button
          variant="tertiary"
          size="sm"
          iconStart="ChevronLeft"
          ariaLabel="Previous month"
          disabled={prevDisabled}
          onClick={() => goMonth(-1)}
        />
        <div className={styles.heading} id={headingId} role="heading" aria-level={2} aria-live="polite">
          {monthLabel}
        </div>
        <Button
          variant="tertiary"
          size="sm"
          iconStart="ChevronRight"
          ariaLabel="Next month"
          disabled={nextDisabled}
          onClick={() => goMonth(1)}
        />
      </div>
      <div
        className={styles.grid}
        role="grid"
        aria-labelledby={headingId}
        aria-disabled={disabled || undefined}
        onKeyDown={onGridKeyDown}
      >
        <div role="row" className={styles.weekdays}>
          {WEEKDAYS.map((label) => (
            <div key={label} role="columnheader" className={styles.weekday}>
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className={styles.row}>
            {week.map((date) => {
              const iso = toISODate(date);
              const outside = date.getMonth() !== view.getMonth();
              const isToday = iso === todayISO;
              const isSelected = Boolean(selectedDate && isSameDay(date, selectedDate));
              const isFocused = iso === focusedISO;
              const dayDisabled = dayIsDisabled(date, minDate, maxDate, disabled);

              return (
                <div
                  key={iso}
                  role="gridcell"
                  className={styles.cell}
                  aria-selected={isSelected || undefined}
                >
                  <button
                    ref={(node) => {
                      if (node) dayRefs.current.set(iso, node);
                      else dayRefs.current.delete(iso);
                    }}
                    type="button"
                    className={styles.day}
                    tabIndex={isFocused ? 0 : -1}
                    aria-label={dayName(date, isToday, isSelected)}
                    aria-disabled={dayDisabled || undefined}
                    data-outside={outside || undefined}
                    data-today={isToday || undefined}
                    data-selected={isSelected || undefined}
                    onClick={() => commit(date)}
                    onFocus={() => setFocusedISO(iso)}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
