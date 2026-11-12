import type { ActivityActor, ActivityEvent, ActivityEventType, ActivityFeedFilters } from "./ActivityFeed.types";

export const ACTIVITY_TYPES: ActivityEventType[] = ["comment", "change", "run", "member", "billing"];

/** Badge text, one event. */
export const TYPE_LABEL: Record<ActivityEventType, string> = {
  comment: "Comment",
  change: "Change",
  run: "Agent run",
  member: "Member",
  billing: "Billing",
};

/** Filter option text, many events. */
export const TYPE_PLURAL: Record<ActivityEventType, string> = {
  comment: "Comments",
  change: "Changes",
  run: "Agent runs",
  member: "Members",
  billing: "Billing",
};

export const NO_FILTERS: ActivityFeedFilters = { types: [], people: [] };

const DAY = 86_400_000;

export function timeOf(event: ActivityEvent): number {
  return typeof event.at === "number" ? event.at : Date.parse(event.at);
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function isFiltered(filters: ActivityFeedFilters): boolean {
  return filters.types.length > 0 || filters.people.length > 0;
}

export function matches(event: ActivityEvent, filters: ActivityFeedFilters): boolean {
  if (filters.types.length && !filters.types.includes(event.type)) return false;
  if (filters.people.length && !filters.people.includes(event.actor.id)) return false;
  return true;
}

/** Newest first, filtered. Ties keep their given order. */
export function visibleEvents(events: ActivityEvent[], filters: ActivityFeedFilters): ActivityEvent[] {
  return events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => matches(event, filters))
    .sort((a, b) => timeOf(b.event) - timeOf(a.event) || a.index - b.index)
    .map(({ event }) => event);
}

/** Calendar day of an instant in a time zone, as YYYY-MM-DD (en-CA formats that way). */
export function dayKey(time: number, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(time);
}

/** Today, Yesterday, else a short date like Mon 9 Nov (with the year when it isn't this year). */
export function dayLabel(time: number, now: number, locale = "en-GB", timeZone?: string): string {
  const key = dayKey(time, timeZone);
  if (key === dayKey(now, timeZone)) return "Today";
  if (key === dayKey(now - DAY, timeZone)) return "Yesterday";
  const sameYear = key.slice(0, 4) === dayKey(now, timeZone).slice(0, 4);
  // Weekday and date apart, so no locale comma lands between them: "Mon 9 Nov".
  const weekday = new Intl.DateTimeFormat(locale, { timeZone, weekday: "short" }).format(time);
  const date = new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  }).format(time);
  return `${weekday} ${date}`;
}

export function timeLabel(time: number, locale = "en-GB", timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, { timeZone, hour: "2-digit", minute: "2-digit" }).format(time);
}

export interface ActivityDay {
  key: string;
  label: string;
  events: ActivityEvent[];
}

/** Sorted events in day groups, newest day first. */
export function groupByDay(events: ActivityEvent[], now: number, locale?: string, timeZone?: string): ActivityDay[] {
  const days: ActivityDay[] = [];
  for (const event of events) {
    const time = timeOf(event);
    const key = dayKey(time, timeZone);
    const last = days[days.length - 1];
    if (last && last.key === key) last.events.push(event);
    else days.push({ key, label: dayLabel(time, now, locale, timeZone), events: [event] });
  }
  return days;
}

/**
 * What a screen reader hears for one event, as one sentence:
 * "Relay, an agent, finished a run on Weekly churn report: Failed. Today at 09:12."
 */
export function eventSentence(event: ActivityEvent, now: number, locale?: string, timeZone?: string): string {
  const time = timeOf(event);
  const who = event.actor.kind === "agent" ? `${event.actor.name}, an agent,` : event.actor.name;
  const status = event.status ? `: ${event.status.label}` : "";
  const detail = event.detail ? ` ${/[.!?]$/.test(event.detail) ? event.detail : `${event.detail}.`}` : "";
  return `${who} ${event.verb} ${event.object}${status}.${detail} ${dayLabel(time, now, locale, timeZone)} at ${timeLabel(time, locale, timeZone)}.`;
}

/** Everyone who appears in the loaded events, people before agents, A–Z. */
export function actorsOf(events: ActivityEvent[]): ActivityActor[] {
  const byId = new Map<string, ActivityActor>();
  for (const event of events) if (!byId.has(event.actor.id)) byId.set(event.actor.id, event.actor);
  return [...byId.values()].sort(
    (a, b) => Number(a.kind === "agent") - Number(b.kind === "agent") || a.name.localeCompare(b.name),
  );
}

/** Loaded events per type, for the Type filter's options. */
export function typeCounts(events: ActivityEvent[]): Record<ActivityEventType, number> {
  const counts = { comment: 0, change: 0, run: 0, member: 0, billing: 0 };
  for (const event of events) counts[event.type] += 1;
  return counts;
}

/** The FilterButton's value (one picked) or count (more than one). */
export function chipState(picked: string[], labelOf: (id: string) => string): { value?: string; count?: number } {
  if (picked.length === 1) return { value: labelOf(picked[0]) };
  if (picked.length > 1) return { count: picked.length };
  return {};
}

export function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}

/** The line under the title. */
export function summaryLine(loaded: number, shown: number, filtered: boolean): string {
  if (!loaded) return "No activity yet";
  if (!filtered) return `${plural(loaded, "event")} across the workspace`;
  return `${shown} of ${plural(loaded, "event")} match the filters`;
}

/** The polite announcement after Load more: how many new events, and how many of them show. */
export function loadedMessage(added: number, addedShown: number, filtered: boolean, hasMore: boolean): string {
  const end = hasMore ? "" : " That's all the activity.";
  if (added <= 0) return `No more activity.`;
  const head = `${plural(added, "more event")} loaded`;
  if (!filtered || addedShown === added) return `${head}.${end}`;
  return `${head}, ${addedShown} ${addedShown === 1 ? "matches" : "match"} the filters.${end}`;
}
