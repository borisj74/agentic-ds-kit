"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import { Tabs } from "../Tabs";
import { Tooltip } from "../Tooltip";
import { CalendarsDrawer, EventDrawer } from "./CalendarDrawers";
import { CalendarViews } from "./CalendarViews";
import type { CalendarEvent, CalendarProps, CalendarView } from "./Calendar.types";
import {
  addDays,
  addMinutes,
  addMonths,
  ALL_VIEWS,
  dayOf,
  draftFrom,
  longDate,
  monthTitle,
  parseStamp,
  PLACEHOLDER_DAY,
  placeEvent,
  rangeTitle,
  toISO,
  toStamp,
  VIEW_LABELS,
  weekOf,
  type EventDraft,
  type PlacedEvent,
} from "./calendarModel";
import styles from "./Calendar.module.css";

export type {
  CalendarEvent,
  CalendarProps,
  CalendarSource,
  CalendarTone,
  CalendarView,
  CalendarWeekStart,
} from "./Calendar.types";

const subscribeNow = (tick: () => void) => {
  const timer = window.setInterval(tick, 30000);
  return () => window.clearInterval(timer);
};

const useNow = () => {
  const minute = useSyncExternalStore(subscribeNow, () => Math.floor(Date.now() / 60000), () => null);
  return minute === null ? null : new Date(minute * 60000);
};

export function Calendar({
  label = "Calendar",
  events: eventsProp,
  defaultEvents,
  onEventsChange,
  onEventClick,
  calendars = [],
  view: viewProp,
  defaultView = "month",
  onViewChange,
  views = ALL_VIEWS,
  date: dateProp,
  defaultDate,
  onDateChange,
  weekStart = "sunday",
  startHour = 7,
  readOnly = false,
}: CalendarProps) {
  const titleId = useId();
  const formId = useId();
  const now = useNow();
  const [viewState, setViewState] = useState<CalendarView>(defaultView);
  const [dateState, setDateState] = useState<string | null>(defaultDate ?? null);
  const [eventsState, setEventsState] = useState<CalendarEvent[]>(defaultEvents ?? []);
  const [hidden, setHidden] = useState(() => new Set(calendars.filter((calendar) => calendar.hidden).map((calendar) => calendar.id)));
  const [panel, setPanel] = useState<"calendars" | "event" | null>(null);
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [errors, setErrors] = useState<{ title?: string; end?: string }>({});
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const focusDay = useRef(false);

  const offered = views.length ? views : ALL_VIEWS;
  const view = offered.includes(viewProp ?? viewState) ? (viewProp ?? viewState) : offered[0];
  const date = dateProp ?? dateState ?? (now ? toISO(now) : "");
  const events = eventsProp ?? eventsState;
  const pending = !date;
  const focus = parseStamp(date) ?? PLACEHOLDER_DAY;
  const today = now ? dayOf(now) : null;

  const setView = (next: CalendarView) => {
    if (viewProp === undefined) setViewState(next);
    onViewChange?.(next);
  };
  const setDate = (next: Date) => {
    const iso = toISO(next);
    if (dateProp === undefined) setDateState(iso);
    onDateChange?.(iso);
  };
  const commit = (next: CalendarEvent[]) => {
    if (eventsProp === undefined) setEventsState(next);
    onEventsChange?.(next);
  };

  const placed = events
    .filter((event) => !event.calendar || !hidden.has(event.calendar))
    .map((event) => placeEvent(event, calendars))
    .filter((item): item is PlacedEvent => Boolean(item));

  const week = weekOf(focus, weekStart);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(week, index));
  const title = view === "month" ? monthTitle(focus) : view === "day" ? longDate(focus) : rangeTitle(weekDays[0], weekDays[6]);
  const unit = view === "month" ? "month" : view === "day" ? "day" : "week";
  const step = (delta: number) => setDate(view === "month" ? addMonths(focus, delta) : addDays(focus, delta * (view === "day" ? 1 : 7)));
  const openDay = (day: Date) => {
    setDate(day);
    if (offered.includes("day")) setView("day");
  };

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = (node.scrollHeight / 24) * Math.max(Math.min(startHour, 23) - 0.25, 0);
  }, [view, startHour]);

  useLayoutEffect(() => {
    if (!focusDay.current) return;
    focusDay.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${date}"]`)?.focus();
  }, [date]);

  const openCreate = (day: Date, hour?: number, allDay = false) => {
    if (readOnly) return;
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(hour ?? 9), ((hour ?? 9) % 1) * 60);
    const end = addMinutes(start, 60);
    const firstShown = calendars.find((calendar) => !hidden.has(calendar.id)) ?? calendars[0];
    setDraft({
      title: "",
      calendar: firstShown?.id ?? "",
      allDay,
      note: "",
      startDate: toISO(start),
      startTime: toStamp(start).slice(11),
      endDate: toISO(end),
      endTime: toStamp(end).slice(11),
    });
    setErrors({});
    setPanel("event");
  };

  const openEvent = (item: PlacedEvent) => {
    onEventClick?.(item.ev);
    if (readOnly) return;
    setDraft(draftFrom(item));
    setErrors({});
    setPanel("event");
  };

  const closePanel = () => setPanel(null);
  const edit = (patch: Partial<EventDraft>) => setDraft((current) => (current ? { ...current, ...patch } : current));

  const save = () => {
    if (!draft) return;
    const start = draft.allDay ? parseStamp(draft.startDate) : parseStamp(`${draft.startDate}T${draft.startTime}`);
    const end = draft.allDay ? parseStamp(draft.endDate) : parseStamp(`${draft.endDate}T${draft.endTime}`);
    const next: { title?: string; end?: string } = {};
    if (!draft.title.trim()) next.title = "Enter an event name.";
    if (!start || !end || (draft.allDay ? end < start : end <= start)) next.end = "End must be after the start.";
    setErrors(next);
    if (next.title || next.end || !start || !end) return;
    const event: CalendarEvent = {
      id: draft.id ?? `event-${Date.now().toString(36)}`,
      title: draft.title.trim(),
      start: draft.allDay ? toISO(start) : toStamp(start),
      end: draft.allDay ? toISO(end) : toStamp(end),
      ...(draft.allDay ? { allDay: true } : {}),
      ...(draft.calendar ? { calendar: draft.calendar } : {}),
      ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
    };
    const previous = draft.id ? events.find((item) => item.id === draft.id) : undefined;
    if (previous?.tone) event.tone = previous.tone;
    commit(draft.id ? events.map((item) => (item.id === draft.id ? event : item)) : [...events, event]);
    closePanel();
  };

  const remove = () => {
    if (!draft?.id) return;
    commit(events.filter((item) => item.id !== draft.id));
    closePanel();
  };

  const setStartDate = (value: string) => edit({ startDate: value, ...(draft && value > draft.endDate ? { endDate: value } : {}) });
  const setStartTime = (value: string) => {
    if (!draft) return;
    const start = parseStamp(`${draft.startDate}T${value}`);
    const end = parseStamp(`${draft.endDate}T${draft.endTime}`);
    edit(
      start && end && end <= start
        ? { startTime: value, endDate: toISO(addMinutes(start, 60)), endTime: toStamp(addMinutes(start, 60)).slice(11) }
        : { startTime: value },
    );
  };

  const onMonthKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).dataset.date === undefined) return;
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      Home: () => weekOf(focus, weekStart),
      End: () => addDays(weekOf(focus, weekStart), 6),
      PageUp: () => addMonths(focus, -1),
      PageDown: () => addMonths(focus, 1),
    };
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (readOnly) openDay(focus);
      else openCreate(focus);
      return;
    }
    if (!moves[event.key]) return;
    event.preventDefault();
    focusDay.current = true;
    setDate(moves[event.key]());
  };

  const year = focus.getFullYear();
  const months = Array.from({ length: 12 }, (_, month) => new Date(year, month, 1));

  const iconButton = (name: string, icon: string, onClick: () => void) => (
    <Tooltip content={name}>
      <Button variant="tertiary" size="sm" iconStart={icon} ariaLabel={name} onClick={onClick} />
    </Tooltip>
  );

  return (
    <div
      className={`${styles.calendar} ${pending ? styles.pending : ""}`}
      role="region"
      aria-label={label}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 id={titleId} className={styles.title} aria-live="polite">
            {title}
          </h2>
          <Tooltip content="Choose month">
          <DropdownMenu
            ariaLabel="Choose month"
            trigger=""
            variant="tertiary"
            size="sm"
            iconEnd="ChevronDown"
            groups={[
              {
                items: months.map((month) => ({
                  id: toISO(month),
                  label: monthTitle(month),
                  selected: month.getMonth() === focus.getMonth(),
                })),
              },
            ]}
            onSelect={(id) => {
              const next = parseStamp(id);
              if (next) setDate(addMonths(focus, next.getMonth() - focus.getMonth()));
            }}
          />
          </Tooltip>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.tools}>
            {readOnly ? null : iconButton("New event", "Plus", () => openCreate(focus))}
            {iconButton(`Previous ${unit}`, "ChevronLeft", () => step(-1))}
            {iconButton(`Next ${unit}`, "ChevronRight", () => step(1))}
            <Button variant="secondary" size="sm" onClick={() => today && setDate(today)}>
              Today
            </Button>
            {calendars.length > 0 ? (
              <Button variant="secondary" size="sm" onClick={() => setPanel("calendars")}>
                Calendars
              </Button>
            ) : null}
          </div>
          {offered.length > 1 ? (
            <Tabs
              size="sm"
              variant="line"
              ariaLabel="Calendar view"
              value={view}
              onChange={(id) => setView(id as CalendarView)}
              items={offered.map((item) => ({ id: item, label: VIEW_LABELS[item] }))}
            />
          ) : null}
        </div>
      </div>
      <div className={styles.body}>
        <CalendarViews
          view={view}
          views={offered}
          date={date}
          focus={focus}
          today={today}
          now={now}
          weekStart={weekStart}
          readOnly={readOnly}
          placed={placed}
          gridRef={gridRef}
          scrollRef={scrollRef}
          setDate={setDate}
          openDay={openDay}
          openCreate={openCreate}
          openEvent={openEvent}
          onMonthKey={onMonthKey}
        />
      </div>
      <CalendarsDrawer
        open={panel === "calendars"}
        calendars={calendars}
        hidden={hidden}
        onClose={closePanel}
        onToggle={(id, shown) => {
          setHidden((current) => {
            const next = new Set(current);
            if (shown) next.delete(id);
            else next.add(id);
            return next;
          });
        }}
      />
      <EventDrawer
        open={panel === "event"}
        formId={formId}
        draft={draft}
        errors={errors}
        calendars={calendars}
        isEdit={Boolean(draft?.id)}
        onClose={closePanel}
        onEdit={edit}
        onSave={save}
        onRemove={remove}
        onStartDate={setStartDate}
        onStartTime={setStartTime}
      />
    </div>
  );
}
