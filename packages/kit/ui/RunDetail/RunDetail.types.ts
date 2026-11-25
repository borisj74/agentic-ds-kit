import type { ComponentPropsWithoutRef, Ref } from "react";
import type { AgentMonitorPendingAction, AgentMonitorStatus, AgentMonitorStep } from "../AgentMonitor/AgentMonitor.types";
import type { AgentTreeNode } from "../AgentTree/AgentTree.types";
import type { ChatMessage } from "../Chat/Chat.types";
import type { TraceSpan } from "../TraceWaterfall/TraceWaterfall.types";

/** A step's status. "pending" steps are planned: they show in the trail, not in the time strip. */
export type RunDetailStepStatus = "done" | "running" | "waiting" | "failed" | "pending";

/**
 * One step of the run. AgentMonitor step fields (tool, target, duration, tokens, cost, started,
 * icon) plus who ran it and what the tool was called with.
 */
export interface RunDetailStep extends Omit<AgentMonitorStep, "status"> {
  status: RunDetailStepStatus;
  /** The agent in `agents` (AgentTree node id) that ran the step. */
  agentId: string;
  /** Trail label, e.g. "Read the invoice model". Default: the tool name. */
  label?: string;
  /** Live timer for the running or waiting step, e.g. "0:18". */
  timer?: string;
  /** Tool arguments: an object shows as pretty JSON, a string as is. */
  args?: unknown;
  /** Result lines. */
  result?: string | string[];
  /** Note on the result header, e.g. "3 of 3". */
  resultMeta?: string;
  /** Failed: error lines. */
  error?: string | string[];
  /** Failed: "Attempt 1 of 3" beside Retry on its ToolCallCard. */
  attempt?: { n: number; max: number };
}

/** Which tool calls show: the selected step's, or every started step's. */
export type RunDetailCalls = "selected" | "all";

/** The run as a whole: what AgentMonitor shows on top. */
export interface RunDetailRun {
  /** Task name, e.g. "Refactor billing service". */
  name: string;
  /** e.g. "claude-code · acme-demo". */
  meta?: string;
  status: AgentMonitorStatus;
  /** Over the clock, e.g. "Editing src/billing/invoice.ts". */
  headline?: string;
  headlineNote?: string;
  /** Run clock, e.g. "02:14". */
  elapsed?: string;
  /** Cost so far, e.g. "$0.42". */
  cost?: string;
  /** Axis under the step strip, e.g. ["0:00", "1:00", "2:14"]. */
  axis?: string[];
  /** Waiting: the exact action to approve (a kit ApprovalCard). */
  pendingAction?: AgentMonitorPendingAction;
  /** Failed: why. */
  error?: string;
  /** Small tag on the trail title, e.g. a branch. */
  tag?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type RunDetailOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface RunDetailProps extends Omit<ComponentPropsWithoutRef<"section">, RunDetailOwnedKeys> {
  run: RunDetailRun;
  steps: RunDetailStep[];
  /** Who started whom: the orchestrator and its sub-agents (AgentTree root). Leave it out for one agent: no AgentTree. */
  agents?: AgentTreeNode;
  /**
   * "selected" (default): one ToolCallCard, the selected step's. "all": every started step's
   * ToolCallCard in step order, the failed one open; the monitor is the one-row bar, the trail
   * and trace sit beside the calls, and Retry shows only on the ToolCallCard.
   */
  calls?: RunDetailCalls;
  /** TraceWaterfall spans. Renders TraceWaterfall compact in place of the monitor's step strip; hidden on one column below 40rem. */
  trace?: TraceSpan[];
  /** Controlled selected step. null = none. */
  selectedStepId?: string | null;
  /** Uncontrolled starting step. Default none. */
  defaultSelectedStepId?: string | null;
  onSelectStep?: (stepId: string | null) => void;
  /** Approve the pending action (from the ApprovalCard or the waiting agent in the tree). */
  onApprove?: () => void;
  onDeny?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  /** Paused runs: Cancel run. */
  onCancel?: () => void;
  /** Running runs: Stop run in the monitor, confirmed once in a kit AlertDialog. */
  onStop?: () => void;
  /** Retry a failed step (from the run, the tree or the tool call). */
  onRetry?: (stepId: string) => void;
  /** Ask panel: the conversation with the agent on this run (kit Chat). Shows with messages or onSend. */
  messages?: ChatMessage[];
  /** (text) => void. One box to ask or steer the agent; replaces LiveSession's chat and steering. */
  onSend?: (text: string) => void;
  /** The agent is answering: the Ask panel shows the kit thinking state. */
  thinking?: boolean;
  /** Block heading. Default "Run detail". */
  title?: string;
  ref?: Ref<HTMLElement>;
}
