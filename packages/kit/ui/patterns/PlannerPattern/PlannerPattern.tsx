"use client";

import { useState } from "react";
import { Calendar } from "../../Calendar";
import type { CalendarEvent, CalendarSource } from "../../Calendar";
import { PageHeader } from "../../PageHeader";
import type { PageHeaderProps } from "../../PageHeader";

const PLANNER_DATE = "2026-10-06";

const CALENDARS: CalendarSource[] = [
  { id: "meetings", name: "Meetings", tone: "brand" },
  { id: "reviews", name: "Reviews", tone: "info" },
  { id: "pto", name: "PTO", tone: "warning" },
  { id: "oncall", name: "On-call", tone: "danger" },
  { id: "shipping", name: "Shipping", tone: "success" },
];

const EVENTS: CalendarEvent[] = [
  { id: "standup", title: "Standup", start: "2026-10-06T09:00", end: "2026-10-06T09:30", calendar: "meetings" },
  { id: "brief", title: "Launch brief review", start: "2026-10-06T13:00", end: "2026-10-06T14:30", calendar: "reviews" },
  { id: "1on1", title: "1:1 with Maya", start: "2026-10-06T16:00", end: "2026-10-06T16:30", calendar: "meetings" },
  { id: "oncall", title: "On-call", start: "2026-10-06T18:00", end: "2026-10-07T06:00", calendar: "oncall" },
  { id: "planning", title: "Sprint planning", start: "2026-10-07T10:00", end: "2026-10-07T11:30", calendar: "meetings" },
  { id: "qa", title: "QA walkthrough", start: "2026-10-07T14:00", end: "2026-10-07T15:00", calendar: "reviews" },
  { id: "pto-maya", title: "PTO — Maya", start: "2026-10-08", end: "2026-10-09", allDay: true, calendar: "pto" },
  { id: "billing", title: "Billing run", start: "2026-10-09T08:00", end: "2026-10-09T09:00", calendar: "shipping" },
  { id: "readout", title: "Research readout", start: "2026-10-09T11:00", end: "2026-10-09T12:00", calendar: "reviews" },
  { id: "ship", title: "Tag Sprint 24", start: "2026-10-10T15:00", end: "2026-10-10T16:00", calendar: "shipping" },
  { id: "holiday", title: "Team offsite", start: "2026-10-13", allDay: true, calendar: "meetings", tone: "accent" },
];

export interface PlannerPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}

export function PlannerPattern({ breadcrumbs }: PlannerPatternProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(EVENTS);

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Planner"
          subtitle="Team calendar for Sprint 24 — meetings, reviews, PTO, and ship dates."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <Calendar
          label="Team planner"
          calendars={CALENDARS}
          events={events}
          onEventsChange={setEvents}
          defaultView="month"
          defaultDate={PLANNER_DATE}
          weekStart="monday"
        />
      </div>
    </div>
  );
}
