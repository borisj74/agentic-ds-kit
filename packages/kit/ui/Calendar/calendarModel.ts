import type { CalendarEvent, CalendarSource, CalendarTone, CalendarView, CalendarWeekStart } from "./Calendar.types";

export const TONES: CalendarTone[] = ["brand", "success", "warning", "danger", "info", "accent"];
export const VIEW_LABELS: Record<CalendarView, string> = {
  month: "Month",
  week: "Week",
  day: "Day",
  list: "List",
};
export const ALL_VIEWS: CalendarView[] = ["month", "week", "day", "list"];
export const MONTH_LINES = 3;
export const PLACEHOLDER_DAY = new Date(2000, 0, 1);

export const pad = (n: number) => String(n).padStart(2, "0");

export const toISO = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const toStamp = (date: Date) => `${toISO(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

export function parseStamp(value?: string): Date | null {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value) : null;
  return match
    ? new Date(+match[1], +match[2] - 1, +match[3], +(match[4] ?? 0), +(match[5] ?? 0))
    : null;
}

export const addDays = (date: Date, n: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
export const addMinutes = (date: Date, n: number) => new Date(date.getTime() + n * 60000);

export function addMonths(date: Date, n: number) {
  const last = new Date(date.getFullYear(), date.getMonth() + n + 1, 0).getDate();
  return new Date(date.getFullYear(), date.getMonth() + n, Math.min(date.getDate(), last));
}

export const dayOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const sameDay = (a: Date, b: Date) => toISO(a) === toISO(b);
export const hoursOf = (date: Date) => date.getHours() + date.getMinutes() / 60;

export function weekOf(date: Date, start: CalendarWeekStart) {
  return addDays(dayOf(date), -((date.getDay() - (start === "monday" ? 1 : 0) + 7) % 7));
}

export const fmt = (date: Date, options: Intl.DateTimeFormatOptions) => date.toLocaleString("en-US", options);
export const timeText = (date: Date) => fmt(date, { hour: "numeric", minute: "2-digit" });
export const hourText = (hour: number) => `${hour % 12 || 12}${hour < 12 ? "am" : "pm"}`;
export const shortTime = (date: Date) =>
  `${date.getHours() % 12 || 12}${date.getMinutes() ? `:${pad(date.getMinutes())}` : ""}${date.getHours() < 12 ? "am" : "pm"}`;
export const longDate = (date: Date) => fmt(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
export const monthTitle = (date: Date) => fmt(date, { month: "long", year: "numeric" });

export function rangeTitle(start: Date, end: Date) {
  if (start.getFullYear() !== end.getFullYear()) {
    return `${fmt(start, { month: "short", day: "numeric", year: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric" })}, ${end.getFullYear()}`;
  }
  return `${fmt(start, { month: "short", day: "numeric" })} – ${end.getDate()}, ${end.getFullYear()}`;
}

export interface PlacedEvent {
  ev: CalendarEvent;
  start: Date;
  end: Date;
  tone: CalendarTone;
  source?: string;
}

export function placeEvent(event: CalendarEvent, calendars: CalendarSource[]): PlacedEvent | null {
  const start = parseStamp(event.start);
  if (!start) return null;
  const index = calendars.findIndex((calendar) => calendar.id === event.calendar);
  const source = index >= 0 ? calendars[index] : undefined;
  const tone = event.tone ?? source?.tone ?? (index >= 0 ? TONES[index % TONES.length] : "info");
  const parsedEnd = parseStamp(event.end);
  if (event.allDay) {
    const last = parsedEnd && parsedEnd >= start ? dayOf(parsedEnd) : dayOf(start);
    return { ev: event, start: dayOf(start), end: addDays(last, 1), tone, source: source?.name };
  }
  return {
    ev: event,
    start,
    end: parsedEnd && parsedEnd > start ? parsedEnd : addMinutes(start, 60),
    tone,
    source: source?.name,
  };
}

export const coversDay = (placed: PlacedEvent, day: Date) => placed.start < addDays(day, 1) && placed.end > day;

export const byStart = (a: PlacedEvent, b: PlacedEvent) =>
  Number(!!b.ev.allDay) - Number(!!a.ev.allDay) || +a.start - +b.start || +b.end - +a.end;

export function whenText(placed: PlacedEvent) {
  if (placed.ev.allDay) {
    const last = addDays(placed.end, -1);
    return sameDay(placed.start, last)
      ? `All day, ${fmt(placed.start, { month: "short", day: "numeric" })}`
      : `All day, ${fmt(placed.start, { month: "short", day: "numeric" })} to ${fmt(last, { month: "short", day: "numeric" })}`;
  }
  const endLabel = sameDay(placed.start, placed.end)
    ? timeText(placed.end)
    : `${fmt(placed.end, { month: "short", day: "numeric" })}, ${timeText(placed.end)}`;
  return `${fmt(placed.start, { month: "short", day: "numeric" })}, ${timeText(placed.start)} to ${endLabel}`;
}

export const eventName = (placed: PlacedEvent) =>
  [placed.ev.title, whenText(placed), placed.source].filter(Boolean).join(", ");

export function toneClass(tone: CalendarTone) {
  return `tone${tone[0].toUpperCase()}${tone.slice(1)}` as
    | "toneBrand"
    | "toneSuccess"
    | "toneWarning"
    | "toneDanger"
    | "toneInfo"
    | "toneAccent";
}

export interface LaidEvent {
  placed: PlacedEvent;
  top: number;
  len: number;
  col: number;
  cols: number;
}

export function layoutDay(items: PlacedEvent[], day: Date): LaidEvent[] {
  const start = dayOf(day);
  const end = addDays(start, 1);
  const out: LaidEvent[] = [];
  let cluster: LaidEvent[] = [];
  let colEnds: number[] = [];
  let clusterEnd = -1;

  const close = () => {
    cluster.forEach((item) => {
      item.cols = colEnds.length;
    });
    cluster = [];
    colEnds = [];
  };

  for (const placed of [...items].sort(byStart)) {
    const top = Math.max((+placed.start - +start) / 3600000, 0);
    const bottom = Math.min((+placed.end - +start) / 3600000, (+end - +start) / 3600000);
    if (top >= clusterEnd) close();
    let col = colEnds.findIndex((edge) => edge <= top);
    if (col < 0) {
      col = colEnds.length;
      colEnds.push(bottom);
    } else {
      colEnds[col] = bottom;
    }
    clusterEnd = Math.max(clusterEnd, bottom);
    const item = { placed, top, len: Math.max(bottom - top, 0.5), col, cols: 1 };
    cluster.push(item);
    out.push(item);
  }
  close();
  return out;
}

export const TIMES = Array.from({ length: 48 }, (_, index) => {
  const date = new Date(2000, 0, 1, Math.floor(index / 2), (index % 2) * 30);
  return { value: `${pad(date.getHours())}:${pad(date.getMinutes())}`, label: timeText(date) };
});

export function timeOptions(value: string) {
  if (TIMES.some((time) => time.value === value) || !parseStamp(`2000-01-01T${value}`)) return TIMES;
  const extra = parseStamp(`2000-01-01T${value}`);
  if (!extra) return TIMES;
  return [...TIMES, { value, label: timeText(extra) }].sort((a, b) => a.value.localeCompare(b.value));
}

export interface EventDraft {
  id?: string;
  title: string;
  calendar: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  note: string;
}

export function draftFrom(placed: PlacedEvent): EventDraft {
  const last = placed.ev.allDay ? addDays(placed.end, -1) : placed.end;
  return {
    id: placed.ev.id,
    title: placed.ev.title,
    calendar: placed.ev.calendar ?? "",
    allDay: !!placed.ev.allDay,
    note: placed.ev.note ?? "",
    startDate: toISO(placed.start),
    startTime: toStamp(placed.start).slice(11),
    endDate: toISO(last),
    endTime: placed.ev.allDay ? toStamp(addMinutes(placed.start, 60)).slice(11) : toStamp(placed.end).slice(11),
  };
}
