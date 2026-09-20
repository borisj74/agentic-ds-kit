"use client";

import { useState } from "react";
import { Calendar } from "agentic-ds-kit";
import type { CalendarEvent, CalendarSource } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const ANCHOR = "2026-09-20";

const CALENDARS: CalendarSource[] = [
  { id: "meetings", name: "Meetings", tone: "brand" },
  { id: "shifts", name: "Shifts", tone: "success" },
  { id: "pto", name: "PTO", tone: "warning" },
  { id: "holidays", name: "Holidays", tone: "danger" },
  { id: "personal", name: "Personal", tone: "info" },
];

const EVENTS: CalendarEvent[] = [
  { id: "standup", title: "Standup", start: "2026-09-16T09:00", end: "2026-09-16T09:30", calendar: "meetings" },
  { id: "review", title: "Design review", start: "2026-09-16T13:00", end: "2026-09-16T14:30", calendar: "meetings" },
  { id: "billing", title: "Billing run", start: "2026-09-16T08:00", end: "2026-09-16T09:00", calendar: "meetings", tone: "accent" },
  { id: "oncall", title: "On-call", start: "2026-09-16T18:00", end: "2026-09-17T06:00", calendar: "shifts" },
  { id: "1:1", title: "1:1 with Maya", start: "2026-09-16T16:00", end: "2026-09-16T16:30", calendar: "meetings" },
  { id: "pto-maya", title: "PTO — Maya", start: "2026-09-17", end: "2026-09-19", allDay: true, calendar: "pto" },
  { id: "shift-am", title: "Morning shift", start: "2026-09-18T07:00", end: "2026-09-18T15:00", calendar: "shifts" },
  { id: "dentist", title: "Dentist", start: "2026-09-20T10:00", calendar: "personal" },
  { id: "planning", title: "Sprint planning", start: "2026-09-21T10:00", end: "2026-09-21T11:30", calendar: "meetings" },
  { id: "holiday", title: "Team holiday", start: "2026-09-07", allDay: true, calendar: "holidays" },
];

const SNIPPET = `<Calendar
  label="Team calendar"
  calendars={calendars}
  defaultEvents={events}
  onEventsChange={setEvents}
  defaultView="month"
  weekStart="sunday"
/>`;

const FILL = { maxWidth: "56rem" } as const;

export function CalendarDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [events, setEvents] = useState<CalendarEvent[]>(EVENTS);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Calendar</h1>
        <p className={styles.lede}>
          A full calendar of events by month, week, day, or list. Browse dates, filter calendars, add,
          edit, or delete events. Not a date field — use DatePicker for that.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="calendar-master">
        <div className={styles.masterHeader}>
          <h2 id="calendar-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Month around today. Click a day to add an event, an event to edit it, or +N more to open
            the day.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Calendar
                    label="Team calendar"
                    calendars={CALENDARS}
                    events={events}
                    onEventsChange={setEvents}
                    defaultView="month"
                    defaultDate={ANCHOR}
                    weekStart="sunday"
                  />
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Calendar for schedules: shifts, PTO, billing runs, meetings. Pass events and, if
                  they belong to calendars, calendars. The toolbar has a month picker, New event,
                  previous and next, Today, Calendars, and a Month / Week / Day / List switch. Month
                  shows up to 3 events a day, then +N more. Week and Day show all-day events on top
                  and timed events on an hourly grid. List shows the week’s events by day. Dates are
                  local ISO: 2024-10-09 all-day, 2024-10-09T08:30 timed. Tones are brand, success,
                  warning, danger, info, and accent. Do not pick a date in a form with this — use
                  DatePicker. Do not put a primary Button in the toolbar; Save in the event form is
                  the primary.
                </p>
              </div>
              <CodeBlock code={SNIPPET} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Month</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Calendar
                    label="Team calendar"
                    calendars={CALENDARS}
                    defaultEvents={EVENTS}
                    defaultView="month"
                    defaultDate={ANCHOR}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The month around the focused date. Click a day to add an event, an event to edit
                  it, or +N more to open the day.
                </p>
              </div>
              <CodeBlock
                code={'<Calendar label="Team calendar" calendars={calendars} defaultEvents={events} defaultView="month" />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Week</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Calendar
                    label="Team calendar"
                    calendars={CALENDARS}
                    defaultEvents={EVENTS}
                    defaultView="week"
                    defaultDate={ANCHOR}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  All-day events on top, timed events on the hourly grid, side by side when they
                  overlap, with a line at the current time.
                </p>
              </div>
              <CodeBlock
                code={'<Calendar label="Team calendar" calendars={calendars} defaultEvents={events} defaultView="week" />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Day</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Calendar
                    label="Team calendar"
                    calendars={CALENDARS}
                    defaultEvents={EVENTS}
                    defaultView="day"
                    defaultDate={ANCHOR}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>One day at full width.</p>
              </div>
              <CodeBlock
                code={'<Calendar label="Team calendar" calendars={calendars} defaultEvents={events} defaultView="day" />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>List</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Calendar
                    label="Team calendar"
                    calendars={CALENDARS}
                    defaultEvents={EVENTS}
                    defaultView="list"
                    defaultDate={ANCHOR}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>The week’s events by day, for reading at a glance. An empty week uses kit Empty.</p>
              </div>
              <CodeBlock
                code={'<Calendar label="Team calendar" calendars={calendars} defaultEvents={events} defaultView="list" />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Read only, week starts Monday</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={FILL}>
                  <Calendar
                    label="Holidays"
                    calendars={CALENDARS}
                    defaultEvents={EVENTS}
                    defaultDate={ANCHOR}
                    weekStart="monday"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  No New event and no editing; weeks run Monday to Sunday. Clicks still fire
                  onEventClick.
                </p>
              </div>
              <CodeBlock
                code={'<Calendar label="Holidays" calendars={calendars} defaultEvents={events} weekStart="monday" readOnly />'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
