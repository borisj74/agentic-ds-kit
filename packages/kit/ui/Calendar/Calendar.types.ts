export type CalendarView = "month" | "week" | "day" | "list";
export type CalendarWeekStart = "sunday" | "monday";
export type CalendarTone = "brand" | "success" | "warning" | "danger" | "info" | "accent";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  calendar?: string;
  tone?: CalendarTone;
  note?: string;
}

export interface CalendarSource {
  id: string;
  name: string;
  tone?: CalendarTone;
  hidden?: boolean;
}

export interface CalendarProps {
  label?: string;
  events?: CalendarEvent[];
  defaultEvents?: CalendarEvent[];
  onEventsChange?: (events: CalendarEvent[]) => void;
  onEventClick?: (event: CalendarEvent) => void;
  calendars?: CalendarSource[];
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  views?: CalendarView[];
  date?: string;
  defaultDate?: string;
  onDateChange?: (date: string) => void;
  weekStart?: CalendarWeekStart;
  startHour?: number;
  readOnly?: boolean;
}
