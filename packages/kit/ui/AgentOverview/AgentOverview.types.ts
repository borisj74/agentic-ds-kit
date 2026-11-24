import type { ComponentPropsWithoutRef, Ref } from "react";
import type { AgentLanesAgent, AgentLanesTask } from "../AgentLanes/AgentLanes.types";
import type { ApprovalCardAction, ApprovalCardRisk } from "../ApprovalCard/ApprovalCard.types";
import type { AgentStatus, AgentStatusInput } from "../shared/agentStatus";

/** The one filter for the All agents list (and the Timeline view). */
export type AgentOverviewFilter = "all" | "running" | "needs-you" | "failed";

/** List: the All agents rows. Timeline: every agent on one time axis (AgentLanes), wide screens only. */
export type AgentOverviewView = "list" | "timeline";

/** A sub-agent an agent started (from AgentFleet). */
export interface AgentOverviewSubAgent {
  id: string;
  name: string;
  status: AgentStatusInput;
  elapsed?: string;
  cost?: string;
}

/**
 * An agent: one row in All agents, one lane in Timeline. AgentLanes agent fields plus what
 * AgentFleet showed per agent.
 */
export interface AgentOverviewAgent extends AgentLanesAgent {
  /** Default: from the agent's latest event, else queued. Older words (waiting, idle) map on. */
  status?: AgentStatusInput;
  /** One line on what it is doing now, e.g. "Step 3 of 5 · reminder 2 to 14 accounts". */
  now?: string;
  /** Cost so far, e.g. "$0.42". When every agent has one, the lead line adds the total spent. */
  cost?: string;
  /** Sub-agents it started; counted on its row. */
  subAgents?: AgentOverviewSubAgent[];
}

/**
 * A piece of agent work over time. Same shape as an AgentLanes task, plus what Needs you needs
 * for a waiting one: the exact action to approve (a kit ApprovalCard) and its risk.
 * A waiting event without `action` is asked as an Approve / Reject DecisionCard.
 */
export interface AgentOverviewEvent extends AgentLanesTask {
  action?: ApprovalCardAction;
  risk?: ApprovalCardRisk;
}

export type { AgentStatus };

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentOverviewOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentOverviewProps extends Omit<ComponentPropsWithoutRef<"section">, AgentOverviewOwnedKeys> {
  agents: AgentOverviewAgent[];
  events: AgentOverviewEvent[];
  /** Epoch ms of the person's last visit: the Since rail lists what happened after it. */
  since: number;
  /** Controlled clock (epoch ms). Without it the block ticks once a second. */
  now?: number;
  /** Controlled filter. */
  filter?: AgentOverviewFilter;
  /** Uncontrolled starting filter. Default "all". */
  defaultFilter?: AgentOverviewFilter;
  onFilterChange?: (filter: AgentOverviewFilter) => void;
  /** Controlled view. */
  view?: AgentOverviewView;
  /** Uncontrolled starting view. Default "list". */
  defaultView?: AgentOverviewView;
  onViewChange?: (view: AgentOverviewView) => void;
  /** A waiting event was approved (the Needs you card or its lane block). */
  onApprove?: (eventId: string) => void;
  /** A waiting event was denied. */
  onReject?: (eventId: string) => void;
  /** A failed event's retry. Kept for older apps; the row action for failed agents is Review. */
  onRetry?: (eventId: string) => void;
  /** Review on a failed agent's row. */
  onReview?: (agentId: string) => void;
  /** Ask on a running agent's row. */
  onAsk?: (agentId: string) => void;
  /** New task in the header: open TaskBrief. */
  onNewTask?: () => void;
  /** Block heading. Default "Agents". */
  title?: string;
  ref?: Ref<HTMLElement>;
}
