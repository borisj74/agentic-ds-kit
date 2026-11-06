export interface DateRange {
  start: string;
  end?: string;
}

export interface DateRangePreset {
  id: string;
  label: string;
  start: string;
  end: string;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today, Yesterday, Last 7 days, Last 30 days, This month, Last month. */
export function defaultDateRangePresets(today = new Date()): DateRangePreset[] {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const shift = (delta: number) => {
    const next = new Date(day);
    next.setDate(day.getDate() + delta);
    return toISODate(next);
  };
  const todayISO = toISODate(day);
  const monthStart = new Date(day.getFullYear(), day.getMonth(), 1);
  const monthEnd = new Date(day.getFullYear(), day.getMonth() + 1, 0);
  const lastMonthStart = new Date(day.getFullYear(), day.getMonth() - 1, 1);
  const lastMonthEnd = new Date(day.getFullYear(), day.getMonth(), 0);
  return [
    { id: "today", label: "Today", start: todayISO, end: todayISO },
    { id: "yesterday", label: "Yesterday", start: shift(-1), end: shift(-1) },
    { id: "last-7", label: "Last 7 days", start: shift(-6), end: todayISO },
    { id: "last-30", label: "Last 30 days", start: shift(-29), end: todayISO },
    { id: "this-month", label: "This month", start: toISODate(monthStart), end: toISODate(monthEnd) },
    { id: "last-month", label: "Last month", start: toISODate(lastMonthStart), end: toISODate(lastMonthEnd) },
  ];
}

export function formatDateLabel(iso?: string): string {
  if (!iso) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatRangeLabel(range?: DateRange): string {
  if (!range?.start) return "";
  const start = formatDateLabel(range.start);
  if (!range.end) return start;
  return `${start} – ${formatDateLabel(range.end)}`;
}

export function presetFor(presets: DateRangePreset[], range?: DateRange): DateRangePreset | undefined {
  if (!range?.start || !range.end) return undefined;
  return presets.find((preset) => preset.start === range.start && preset.end === range.end);
}

export function nextRange(current: DateRange | undefined, iso: string): DateRange {
  if (!current?.start || current.end) return { start: iso };
  return iso < current.start ? { start: iso, end: current.start } : { start: current.start, end: iso };
}
