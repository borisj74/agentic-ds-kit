import type { ComponentPropsWithoutRef, Ref } from "react";

export type AgentFleetStatus = "idle" | "running" | "waiting" | "done" | "failed";
export type AgentFleetSubAgentStatus = "queued" | "running" | "waiting" | "done" | "failed";

export interface AgentFleetSubAgent {
  id: string;
  name: string;
  status: AgentFleetSubAgentStatus;
  /** e.g. "1m 18s" */
  elapsed?: string;
  /** e.g. "$0.41" */
  cost?: string;
}

export interface AgentFleetAgent {
  id: string;
  name: string;
  status: AgentFleetStatus;
  /** Total cost, e.g. "$1.28". */
  cost: string;
  /** Total time, e.g. "6m 40s". */
  elapsed?: string;
  /** Line under the name when expanded, e.g. "Orchestrator · Opus 5.5". */
  meta?: string;
  subAgents: AgentFleetSubAgent[];
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentFleetOwnedKeys = "children";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentFleetProps extends Omit<ComponentPropsWithoutRef<"section">, AgentFleetOwnedKeys> {
  agents: AgentFleetAgent[];
  /** The agent shown open. The others shrink to a compact column. */
  expandedId?: string | null;
  /** Called with an id to open a card, or null to close it. Without it, cards do not open. */
  onExpandedChange?: (id: string | null) => void;
  /** Review a sub-agent that waits for the person. */
  onReview?: (agentId: string, subAgentId: string) => void;
  /** Fleet line under the cards, e.g. "Fleet · 3 agents · 12 sub-agents · $2.17". Default: derived. Pass "" to hide. */
  totals?: string;
  loading?: boolean;
  /** Empty fleet: action that starts an agent. */
  onStart?: () => void;
  /** Accessible name for the fleet region. */
  ariaLabel?: string;
  ref?: Ref<HTMLElement>;
}
