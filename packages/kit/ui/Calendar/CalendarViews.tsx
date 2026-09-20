import type { CSSProperties, KeyboardEvent, MouseEvent, RefObject } from "react";
import { Empty } from "../Empty";
import { Button } from "../Button";
import type { CalendarView, CalendarWeekStart } from "./Calendar.types";
import {
  addDays,
  coversDay,
  eventName,
  fmt,
  hoursOf,
  layoutDay,
  longDate,
  MONTH_LINES,
  sameDay,
  shortTime,
  timeText,
  toISO,
  toneClass,
  weekOf,
  type PlacedEvent,
} from "./calendarModel";
import styles from "./Calendar.module.css";

export interface CalendarViewsProps {
  view: CalendarView;
  views: CalendarView[];
  date: string;
  focus: Date;
  today: Date | null;
  now: Date | null;
  weekStart: CalendarWeekStart;
  readOnly: boolean;
  placed: PlacedEvent[];
  gridRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  setDate: (date: Date) => void;
  openDay: (date: Date) => void;
  openCreate: (day: Date, hour?: number, allDay?: boolean) => void;
  openEvent: (placed: PlacedEvent) => void;
  onMonthKey: (event: KeyboardEvent<HTMLDivElement>) => void;
}

function eventsOn(placed: PlacedEvent[], day: Date) {
  return placed.filter((item) => coversDay(item, day)).sort((a, b) => {
    return Number(!!b.ev.allDay) - Number(!!a.ev.allDay) || +a.start - +b.start || +b.end - +a.end;
  });
}

function EventChip({
  placed,
  day,
  kind,
  onOpen,
}: {
  placed: PlacedEvent;
  day: Date;
  kind: "pill" | "item";
  onOpen: (placed: PlacedEvent) => void;
}) {
  const starts = sameDay(placed.start, day);
  const last = placed.ev.allDay ? addDays(placed.end, -1) : placed.end;
  const ends = sameDay(last, day) || (!placed.ev.allDay && +placed.end === +addDays(day, 1));
  return (
    <button
      type="button"
      className={[
        kind === "pill" ? styles.pill : styles.item,
        styles[toneClass(placed.tone)],
        !starts ? styles.continues : "",
        !ends ? styles.carries : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={eventName(placed)}
      onClick={() => onOpen(placed)}
    >
      {kind === "item" ? <span className={styles.dot} aria-hidden /> : null}
      {kind === "item" ? <span className={styles.itemTime}>{starts ? shortTime(placed.start) : "…"}</span> : null}
      <span className={styles.chipTitle}>{placed.ev.title}</span>
    </button>
  );
}

function MonthView(props: CalendarViewsProps) {
  const first = new Date(props.focus.getFullYear(), props.focus.getMonth(), 1);
  const start = weekOf(first, props.weekStart);
  const weeks = Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)),
  );

  return (
    <div
      ref={props.gridRef}
      className={styles.month}
      role="grid"
      aria-label="Month"
      onKeyDown={props.onMonthKey}
    >
      <div role="row" className={styles.weekdays}>
        {weeks[0].map((day) => (
          <div key={toISO(day)} role="columnheader" className={styles.weekday}>
            {fmt(day, { weekday: "short" })}
          </div>
        ))}
      </div>
      {weeks.map((row) => (
        <div key={toISO(row[0])} role="row" className={styles.monthRow}>
          {row.map((day) => {
            const iso = toISO(day);
            const list = eventsOn(props.placed, day);
            const shown = list.length > MONTH_LINES ? list.slice(0, MONTH_LINES - 1) : list;
            const more = list.length - shown.length;
            const isToday = Boolean(props.today && sameDay(day, props.today));
            const pick = (event: MouseEvent<HTMLDivElement>) => {
              if ((event.target as HTMLElement).closest("button")) return;
              props.setDate(day);
              props.openCreate(day);
            };
            return (
              <div
                key={iso}
                role="gridcell"
                tabIndex={iso === props.date ? 0 : -1}
                data-date={iso}
                aria-label={`${longDate(day)}, ${list.length ? `${list.length} event${list.length === 1 ? "" : "s"}` : "no events"}`}
                className={[
                  styles.day,
                  day.getMonth() !== props.focus.getMonth() ? styles.outside : "",
                  iso === props.date ? styles.selected : "",
                  props.readOnly ? "" : styles.canAdd,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={pick}
              >
                <button
                  type="button"
                  className={`${styles.dayNumber} ${isToday ? styles.today : ""}`}
                  onClick={() => props.openDay(day)}
                >
                  {day.getDate()}
                </button>
                <div className={styles.dayEvents}>
                  {shown.map((item) => (
                    <EventChip
                      key={item.ev.id}
                      placed={item}
                      day={day}
                      kind={item.ev.allDay ? "pill" : "item"}
                      onOpen={props.openEvent}
                    />
                  ))}
                  {more > 0 ? (
                    <button
                      type="button"
                      className={styles.more}
                      aria-label={`${more} more on ${longDate(day)}`}
                      onClick={() => props.openDay(day)}
                    >
                      +{more} more
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function TimeView(props: CalendarViewsProps & { days: Date[] }) {
  const grid = { "--days": props.days.length } as CSSProperties;
  const slot = (day: Date) => (event: MouseEvent<HTMLDivElement>) => {
    if (props.readOnly || (event.target as HTMLElement).closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    props.openCreate(day, Math.floor(((event.clientY - rect.top) / rect.height) * 48) / 2);
  };

  return (
    <div className={styles.time} style={grid}>
      <div className={`${styles.timeRow} ${styles.timeHead}`}>
        <div className={styles.gutter} />
        {props.days.map((day) => {
          const isToday = Boolean(props.today && sameDay(day, props.today));
          const text = props.days.length === 1 ? fmt(day, { weekday: "long" }) : `${fmt(day, { weekday: "short" })} ${day.getDate()}`;
          return (
            <div key={toISO(day)} className={styles.colHead}>
              {props.days.length > 1 && props.views.includes("day") ? (
                <button
                  type="button"
                  className={`${styles.colHeadButton} ${isToday ? styles.today : ""}`}
                  onClick={() => props.openDay(day)}
                >
                  {text}
                </button>
              ) : (
                <span className={isToday ? styles.todayText : undefined}>{text}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className={`${styles.timeRow} ${styles.allDay}`}>
        <div className={styles.allDayLabel}>all-day</div>
        {props.days.map((day) => (
          <div
            key={toISO(day)}
            className={`${styles.allDayCell} ${props.readOnly ? "" : styles.canAdd}`}
            onClick={(event) => {
              if (!(event.target as HTMLElement).closest("button")) props.openCreate(day, undefined, true);
            }}
          >
            {eventsOn(props.placed, day)
              .filter((item) => item.ev.allDay)
              .map((item) => (
                <EventChip key={item.ev.id} placed={item} day={day} kind="pill" onOpen={props.openEvent} />
              ))}
          </div>
        ))}
      </div>
      <div ref={props.scrollRef} className={styles.scroll}>
        <div className={styles.timeRow}>
          <div className={styles.hours}>
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className={styles.hour}>
                {hour > 0 ? `${hour % 12 || 12}${hour < 12 ? "am" : "pm"}` : ""}
              </div>
            ))}
          </div>
          {props.days.map((day) => (
            <div
              key={toISO(day)}
              className={`${styles.col} ${props.readOnly ? "" : styles.canAdd}`}
              onClick={slot(day)}
            >
              {layoutDay(
                eventsOn(props.placed, day).filter((item) => !item.ev.allDay),
                day,
              ).map(({ placed, top, len, col, cols }) => (
                <button
                  key={placed.ev.id}
                  type="button"
                  aria-label={eventName(placed)}
                  className={[styles.block, styles[toneClass(placed.tone)], len < 0.75 ? styles.blockShort : ""]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    top: `calc(var(--calendar-hour) * ${top})`,
                    height: `calc(var(--calendar-hour) * ${len} - var(--border-width-medium))`,
                    left: `${(col / cols) * 100}%`,
                    width: `${100 / cols}%`,
                  }}
                  onClick={() => props.openEvent(placed)}
                >
                  <span className={styles.blockTime}>
                    {sameDay(placed.start, day) ? shortTime(placed.start) : "…"} –{" "}
                    {sameDay(placed.end, day) ? shortTime(placed.end) : "…"}
                  </span>
                  <span className={styles.blockTitle}>{placed.ev.title}</span>
                </button>
              ))}
              {props.now && sameDay(day, props.now) ? (
                <div className={styles.now} style={{ top: `calc(var(--calendar-hour) * ${hoursOf(props.now)})` }} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListView(props: CalendarViewsProps & { weekDays: Date[] }) {
  const groups = props.weekDays.map((day) => ({ day, list: eventsOn(props.placed, day) })).filter((group) => group.list.length);
  if (!groups.length) {
    return (
      <div className={styles.listEmpty}>
        <Empty
          title="No events this week"
          description="Nothing is scheduled in this week."
          icon="CalendarDays"
          actions={
            props.readOnly ? undefined : (
              <Button variant="secondary" size="sm" onClick={() => props.openCreate(props.focus)}>
                New event
              </Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {groups.map(({ day, list }) => (
        <section key={toISO(day)}>
          <h3 className={styles.listDay}>{fmt(day, { weekday: "long", month: "long", day: "numeric" })}</h3>
          <ul className={styles.listItems}>
            {list.map((placed) => (
              <li key={placed.ev.id}>
                <button type="button" className={styles.listRow} aria-label={eventName(placed)} onClick={() => props.openEvent(placed)}>
                  <span className={`${styles.swatch} ${styles[toneClass(placed.tone)]}`} aria-hidden />
                  <span className={styles.listTime}>
                    {placed.ev.allDay
                      ? "All day"
                      : `${sameDay(placed.start, day) ? timeText(placed.start) : "…"} – ${sameDay(placed.end, day) ? timeText(placed.end) : "…"}`}
                  </span>
                  <span className={styles.listTitle}>{placed.ev.title}</span>
                  {placed.source ? <span className={styles.listSource}>{placed.source}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function CalendarViews(props: CalendarViewsProps) {
  const week = weekOf(props.focus, props.weekStart);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(week, index));
  if (props.view === "month") return <MonthView {...props} />;
  if (props.view === "list") return <ListView {...props} weekDays={weekDays} />;
  return <TimeView {...props} days={props.view === "day" ? [props.focus] : weekDays} />;
}
