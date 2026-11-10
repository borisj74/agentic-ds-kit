import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ApprovalCardAction, ApprovalCardRisk } from "../ApprovalCard/ApprovalCard.types";
import type { KitIcon } from "../Button/lucideName";

export type AgentMonitorStatus = "idle" | "running" | "waiting" | "paused" | "done" | "failed";
export type AgentMonitorStepStatus = "done" | "running" | "waiting" | "failed";

export interface AgentMonitorStep {
  id: string;
  /** Tool name, e.g. "read_file". Shown in mono in the detail panel. */
  tool: string;
  status: AgentMonitorStepStatus;
  /** Lucide icon for the strip. Default derived from the tool name. */
  icon?: KitIcon;
  /** What it acted on, e.g. "src/billing/invoice.ts · 142 lines". */
  target?: string;
  duration?: string;
  tokens?: string;
  cost?: string;
  /** When it started in the run, e.g. "0:21". */
  started?: string;
  /** Relative width in the strip, e.g. its duration in seconds. Default 1. */
  weight?: number;
}

export interface AgentMonitorPendingAction {
  title: string;
  description?: string;
  risk?: ApprovalCardRisk;
  action: ApprovalCardAction;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentMonitorOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentMonitorProps extends Omit<ComponentPropsWithoutRef<"section">, AgentMonitorOwnedKeys> {
  /** Agent or task name, e.g. "Refactor billing service". */
  name: string;
  /** Line under the name, e.g. "claude-code · acme-demo". */
  meta?: string;
  status?: AgentMonitorStatus;
  /** Headline over the clock, e.g. "Editing src/billing/invoice.ts" or "All 6 steps done · tests green". */
  headline?: string;
  /** Small note on the headline row, e.g. "step 6". */
  headlineNote?: string;
  /** Run clock, e.g. "02:14". */
  elapsed?: string;
  /** Cost so far, e.g. "$0.42". */
  cost?: string;
  steps?: AgentMonitorStep[];
  /** Axis under the strip, e.g. ["0:00", "1:00", "2:14"]. */
  axis?: string[];
  selectedStepId?: string | null;
  onSelectStep?: (id: string | null) => void;
  /** Waiting: the exact action the agent wants to take. Renders a kit ApprovalCard. */
  pendingAction?: AgentMonitorPendingAction;
  onApprove?: () => void;
  onDeny?: () => void;
  /** Failed: why, e.g. "3 tests failed in invoice.test.ts · exit code 1". */
  error?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  onViewDiff?: () => void;
  onOpenTrail?: () => void;
  loading?: boolean;
  ref?: Ref<HTMLElement>;
}
