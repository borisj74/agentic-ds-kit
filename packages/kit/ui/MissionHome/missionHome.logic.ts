import type { AgentInboxItem } from "../AgentInbox/AgentInbox.types";
import type { AgentLanesTaskStatus } from "../AgentLanes/AgentLanes.types";
import type { MissionHomeAgent, MissionHomeEvent, MissionHomeFilter } from "./MissionHome.types";

/** Pure helpers behind MissionHome: what each area shows for a filter. No React here. */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const MISSION_HOME_FILTERS: MissionHomeFilter[] = ["all", "running", "needs-you", "failed"];

export const FILTER_LABEL: Record<MissionHomeFilter, string> = {
  all: "All",
  running: "Running",
  "needs-you": "Needs you",
  failed: "Failed",
};

const FILTER_STATUS: Record<Exclude<MissionHomeFilter, "all">, AgentLanesTaskStatus> = {
  running: "running",
  "needs-you": "waiting",
  failed: "failed",
};

/** The approve / reject choices for a waiting event that has no exact action. */
export const DECISION_APPROVE = "approve";
export const DECISION_REJECT = "reject";

/** Does an event pass the filter? */
export function matchesFilter(event: MissionHomeEvent, filter: MissionHomeFilter): boolean {
  return filter === "all" || event.status === FILTER_STATUS[filter];
}

/** Events that were active after `since`: open ones, or ones that ended after it. */
export function eventsSince(events: MissionHomeEvent[], since: number, now: number): MissionHomeEvent[] {
  return events.filter((event) => (event.end ?? now) >= since);
}

/** "2h 15m", "40m", "just now". */
export function formatAgo(ms: number): string {
  if (ms < MINUTE) return "just now";
  const hours = Math.floor(ms / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

/** Summary counts since the last visit. Needs you is what is waiting now. */
export function summaryCounts(events: MissionHomeEvent[], since: number, now: number) {
  const recent = eventsSince(events, since, now);
  return {
    done: recent.filter((event) => event.status === "done").length,
    needsYou: recent.filter((event) => event.status === "waiting").length,
    failed: recent.filter((event) => event.status === "failed").length,
  };
}

/** Counts shown in the filter's segment labels (and so in their accessible names). */
export function filterCounts(events: MissionHomeEvent[], since: number, now: number): Record<MissionHomeFilter, number> {
  const recent = eventsSince(events, since, now);
  return {
    all: recent.length,
    running: recent.filter((event) => matchesFilter(event, "running")).length,
    "needs-you": recent.filter((event) => matchesFilter(event, "needs-you")).length,
    failed: recent.filter((event) => matchesFilter(event, "failed")).length,
  };
}

/** Lanes area: under a filter, only agents with a matching event keep a lane. */
export function lanesFor(
  agents: MissionHomeAgent[],
  events: MissionHomeEvent[],
  filter: MissionHomeFilter,
): { agents: MissionHomeAgent[]; tasks: MissionHomeEvent[] } {
  if (filter === "all") return { agents, tasks: events };
  const tasks = events.filter((event) => matchesFilter(event, filter));
  const busy = new Set(tasks.map((task) => task.agentId));
  return { agents: agents.filter((agent) => busy.has(agent.id)), tasks };
}

/**
 * Inbox area: waiting and failed events since the last visit, as AgentInbox items. A waiting
 * event with an action is an approval (ApprovalCard); without one it is an Approve / Reject
 * question (DecisionCard). A failed event is a failure with its summary lines and Retry run.
 */
export function inboxItemsFor(
  agents: MissionHomeAgent[],
  events: MissionHomeEvent[],
  filter: MissionHomeFilter,
  since: number,
  now: number,
): AgentInboxItem[] {
  if (filter === "running") return [];
  const name = new Map(agents.map((agent) => [agent.id, agent.name]));
  return eventsSince(events, since, now)
    .filter((event) => (event.status === "waiting" || event.status === "failed") && matchesFilter(event, filter))
    .sort((a, b) => (b.end ?? now) - (a.end ?? now) || b.start - a.start)
    .map((event): AgentInboxItem => {
      const agentName = name.get(event.agentId) ?? event.agentId;
      const time = formatAgo(now - (event.end ?? event.start));
      if (event.status === "failed") {
        return {
          id: event.id,
          agentName,
          type: "failure",
          preview: event.title,
          time,
          detail: { heading: `${event.title} failed`, meta: agentName, lines: event.summary },
        };
      }
      const ask = event.ask ?? event.title;
      if (event.action) {
        return {
          id: event.id,
          agentName,
          type: "approval",
          preview: ask,
          time,
          approval: { title: ask, description: event.title === ask ? undefined : event.title, risk: event.risk, action: event.action },
        };
      }
      return {
        id: event.id,
        agentName,
        type: "question",
        preview: ask,
        time,
        question: {
          question: ask,
          meta: event.title === ask ? undefined : event.title,
          options: [
            { id: DECISION_APPROVE, label: "Approve" },
            { id: DECISION_REJECT, label: "Reject" },
          ],
        },
      };
    });
}

/** Activity bar: matching events per time slice from `since` to `now`, by when they started. */
export function activityFor(
  events: MissionHomeEvent[],
  filter: MissionHomeFilter,
  since: number,
  now: number,
  slices = 12,
): { label: string; value: number }[] {
  const width = Math.max(MINUTE, (now - since) / slices);
  // Labels round to 5 minutes so the axis reads "1h 30m ago", not "1h 29m ago".
  const step = 5 * MINUTE;
  const out = Array.from({ length: slices }, (_, index) => {
    const ago = Math.round((now - (since + width * index)) / step) * step;
    return { label: ago < MINUTE ? "now" : `${formatAgo(ago)} ago`, value: 0 };
  });
  for (const event of eventsSince(events, since, now)) {
    if (!matchesFilter(event, filter)) continue;
    const slot = Math.min(slices - 1, Math.max(0, Math.floor((event.start - since) / width)));
    out[slot].value += 1;
  }
  return out;
}

/** Inbox callbacks mapped onto the block's onApprove / onReject / onRetry. */
export function inboxHandlers(handlers: {
  onApprove?: (eventId: string) => void;
  onReject?: (eventId: string) => void;
  onRetry?: (eventId: string) => void;
}) {
  return {
    onApprove: (id: string) => handlers.onApprove?.(id),
    onDeny: (id: string) => handlers.onReject?.(id),
    onAnswer: (id: string, value: string) => {
      if (value === DECISION_APPROVE) handlers.onApprove?.(id);
      else if (value === DECISION_REJECT) handlers.onReject?.(id);
    },
    onRetryItem: (id: string) => handlers.onRetry?.(id),
  };
}
