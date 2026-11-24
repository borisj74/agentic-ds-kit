import type { ActivityEvent } from "../ActivityFeed/ActivityFeed.types";
import type { BadgeTone } from "../Badge/Badge.types";
import type { ListViewItem } from "../ListView/ListView.types";
import { AGENT_STATUS_WORD, toAgentStatus, type AgentStatus } from "../shared/agentStatus";
import type { AgentOverviewAgent, AgentOverviewEvent, AgentOverviewFilter } from "./AgentOverview.types";

/** Pure helpers behind AgentOverview: what each area shows. No React here. */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const AGENT_OVERVIEW_FILTERS: AgentOverviewFilter[] = ["all", "needs-you", "running", "failed"];

export const FILTER_LABEL: Record<AgentOverviewFilter, string> = {
  all: "All",
  running: "Running",
  "needs-you": "Needs you",
  failed: "Failed",
};

/** The approve / reject choices for a waiting event that has no exact action. */
export const DECISION_APPROVE = "approve";
export const DECISION_REJECT = "reject";

/** Row action ids (ListView primaryAction). */
export const ACTION_REVIEW = "review";
export const ACTION_ASK = "ask";

/** Events that were active after `since`: open ones, or ones that ended after it. */
export function eventsSince(events: AgentOverviewEvent[], since: number, now: number): AgentOverviewEvent[] {
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

/** "07:30": 24-hour clock in the viewer's zone. */
export function formatClock(at: number): string {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
}

/** The agent's status: its own, else from its latest event, else queued. */
export function statusOf(agent: AgentOverviewAgent, events: AgentOverviewEvent[]): AgentStatus {
  if (agent.status) return toAgentStatus(agent.status);
  let latest: AgentOverviewEvent | undefined;
  for (const event of events) {
    if (event.agentId !== agent.id) continue;
    if (!latest || event.start >= latest.start) latest = event;
  }
  return latest ? toAgentStatus(latest.status) : "queued";
}

export function matchesFilter(status: AgentStatus, filter: AgentOverviewFilter): boolean {
  return filter === "all" || status === filter;
}

/** Counts shown in the filter's segment labels (and so in their accessible names). */
export function filterCounts(agents: AgentOverviewAgent[], events: AgentOverviewEvent[]): Record<AgentOverviewFilter, number> {
  const statuses = agents.map((agent) => statusOf(agent, events));
  const count = (filter: AgentOverviewFilter) => statuses.filter((status) => matchesFilter(status, filter)).length;
  return { all: agents.length, running: count("running"), "needs-you": count("needs-you"), failed: count("failed") };
}

/** Open waiting events, oldest first. The first is the Needs you card; the rest are counted. */
export function requestsFor(events: AgentOverviewEvent[]): AgentOverviewEvent[] {
  return events.filter((event) => event.status === "waiting" && event.end === undefined).sort((a, b) => a.start - b.start);
}

/** "$1.00 spent" when every agent has a dollar cost; else undefined. */
export function totalSpent(agents: AgentOverviewAgent[]): string | undefined {
  if (!agents.length) return undefined;
  let cents = 0;
  for (const agent of agents) {
    const match = agent.cost?.trim().match(/^\$(\d[\d,]*(?:\.\d+)?)$/);
    if (!match) return undefined;
    cents += Math.round(Number(match[1].replace(/,/g, "")) * 100);
  }
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent`;
}

/** Lead line: "Since 07:30 · 4 agents, $1.00 spent". */
export function leadLine(agents: AgentOverviewAgent[], since: number): string {
  const count = `${agents.length} ${agents.length === 1 ? "agent" : "agents"}`;
  const spent = totalSpent(agents);
  return `Since ${formatClock(since)} · ${spent ? `${count}, ${spent}` : count}`;
}

/** What a row says after the status word when the agent has no `now` line. */
function fallbackNow(status: AgentStatus, openRequestAgent: boolean): string | undefined {
  if (status === "needs-you") return openRequestAgent ? "Waiting on you · request above" : "Waiting on you";
  return undefined;
}

export interface AgentOverviewRow {
  item: Omit<ListViewItem, "icon">;
  status: AgentStatus;
}

/**
 * All agents rows as ListView items: the status icon, the name, the status word with one fact,
 * the cost, and one action from the status (Review for failed, Ask for running, none otherwise;
 * a waiting agent points to the Needs you card instead of repeating Approve).
 */
export function rowsFor(
  agents: AgentOverviewAgent[],
  events: AgentOverviewEvent[],
  filter: AgentOverviewFilter,
  openRequestAgentId: string | undefined,
  handlers: { review: boolean; ask: boolean },
): AgentOverviewRow[] {
  return agents
    .map((agent) => ({ agent, status: statusOf(agent, events) }))
    .filter(({ status }) => matchesFilter(status, filter))
    .map(({ agent, status }) => {
      const subs = agent.subAgents?.length;
      const fact = agent.now ?? fallbackNow(status, agent.id === openRequestAgentId);
      const parts = [AGENT_STATUS_WORD[status], fact, subs ? `${subs} sub-${subs === 1 ? "agent" : "agents"}` : undefined];
      const action =
        status === "failed" && handlers.review
          ? { id: ACTION_REVIEW, label: "Review", actionLabel: `Review ${agent.name}` }
          : status === "running" && handlers.ask
            ? { id: ACTION_ASK, label: "Ask", actionLabel: `Ask ${agent.name}`, icon: "MessageCircle" }
            : undefined;
      return {
        status,
        item: {
          id: agent.id,
          primary: agent.name,
          secondary: parts.filter(Boolean).join(" · "),
          meta: agent.cost,
          primaryAction: action,
        },
      };
    });
}

const RAIL_VERB: Record<AgentStatus, string> = {
  queued: "queued",
  running: "is running",
  "needs-you": "asks:",
  paused: "paused",
  done: "finished",
  failed: "failed on",
};

const RAIL_TONE: Record<AgentStatus, BadgeTone> = {
  queued: "neutral",
  running: "info",
  "needs-you": "warning",
  paused: "neutral",
  done: "success",
  failed: "danger",
};

/** The Since rail: events since the last visit as ActivityFeed history rows, newest first. */
export function railFor(agents: AgentOverviewAgent[], events: AgentOverviewEvent[], since: number, now: number): ActivityEvent[] {
  const name = new Map(agents.map((agent) => [agent.id, agent.name]));
  return eventsSince(events, since, now)
    .slice()
    .sort((a, b) => (b.end ?? b.start) - (a.end ?? a.start))
    .map((event): ActivityEvent => {
      const status = toAgentStatus(event.status);
      const object = status === "needs-you" ? (event.ask ?? event.title) : event.title;
      return {
        id: event.id,
        type: "run",
        actor: { id: event.agentId, name: name.get(event.agentId) ?? event.agentId },
        verb: RAIL_VERB[status],
        object,
        at: event.end ?? event.start,
        detail: event.summary?.[0],
        status: { label: AGENT_STATUS_WORD[status], tone: RAIL_TONE[status] },
      };
    });
}

/** Lanes for the Timeline view: under a filter, only agents with that status keep a lane. */
export function lanesFor(
  agents: AgentOverviewAgent[],
  events: AgentOverviewEvent[],
  filter: AgentOverviewFilter,
): { agents: AgentOverviewAgent[]; tasks: AgentOverviewEvent[] } {
  if (filter === "all") return { agents, tasks: events };
  const kept = agents.filter((agent) => matchesFilter(statusOf(agent, events), filter));
  const ids = new Set(kept.map((agent) => agent.id));
  return { agents: kept, tasks: events.filter((event) => ids.has(event.agentId)) };
}
