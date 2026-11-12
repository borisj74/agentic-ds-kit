import type { ComponentPropsWithoutRef, Ref } from "react";
import type { AgentLanesAgent, AgentLanesTask } from "../AgentLanes/AgentLanes.types";
import type { ApprovalCardAction, ApprovalCardRisk } from "../ApprovalCard/ApprovalCard.types";

/** The one filter for the whole block: summary activity, lanes and inbox. */
export type AgentOverviewFilter = "all" | "running" | "needs-you" | "failed";

/** An agent: one lane each. Same shape as AgentLanes. */
export type AgentOverviewAgent = AgentLanesAgent;

/**
 * A piece of agent work over time. Same shape as an AgentLanes task, plus what the inbox needs
 * for a waiting one: the exact action to approve (rendered as a kit ApprovalCard) and its risk.
 * A waiting event without `action` is asked as an Approve / Reject decision.
 */
export interface AgentOverviewEvent extends AgentLanesTask {
  action?: ApprovalCardAction;
  risk?: ApprovalCardRisk;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentOverviewOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentOverviewProps extends Omit<ComponentPropsWithoutRef<"section">, AgentOverviewOwnedKeys> {
  agents: AgentOverviewAgent[];
  events: AgentOverviewEvent[];
  /** Epoch ms of the person's last visit: the summary counts what happened after it. */
  since: number;
  /** Controlled clock (epoch ms). Without it the block ticks once a second. */
  now?: number;
  /** Controlled filter. */
  filter?: AgentOverviewFilter;
  /** Uncontrolled starting filter. Default "all". */
  defaultFilter?: AgentOverviewFilter;
  onFilterChange?: (filter: AgentOverviewFilter) => void;
  /** A waiting event was approved (from its lane block or its inbox card). */
  onApprove?: (eventId: string) => void;
  /** A waiting event was rejected. */
  onReject?: (eventId: string) => void;
  /** A failed event's Retry run. */
  onRetry?: (eventId: string) => void;
  /** Block heading. Default "Agent overview". */
  title?: string;
  ref?: Ref<HTMLElement>;
}
