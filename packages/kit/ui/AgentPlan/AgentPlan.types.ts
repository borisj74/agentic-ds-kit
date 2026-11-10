import type { ComponentPropsWithoutRef, Ref } from "react";

export type AgentPlanStatus = "drafting" | "draft" | "accepted" | "running" | "complete" | "failed";

export interface AgentPlanStep {
  id: string;
  label: string;
  /** Tool the step calls, e.g. "edit_file". Shown in mono. */
  tool?: string;
  /** What the tool acts on, e.g. "invoice.ts, tax.ts". */
  target?: string;
  /** Free-text instruction for the agent. Edited in the step form. */
  note?: string;
  /** The run pauses here for the person's OK. */
  needsApproval?: boolean;
  /** Failure detail for the current step when status is failed, e.g. "3 tests failed · exit code 1". */
  error?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentPlanOwnedKeys = "children" | "title" | "aria-labelledby" | "onChange" | "onKeyDown";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentPlanProps extends Omit<ComponentPropsWithoutRef<"section">, AgentPlanOwnedKeys> {
  title: string;
  steps: AgentPlanStep[];
  status?: AgentPlanStatus;
  /** The step that runs now (running) or stopped (failed). */
  currentStepId?: string;
  /** Line under the summary. Default: derived, e.g. "5 steps · 2 need approval". */
  summary?: string;
  /** Mono note at the start of the footer, e.g. "accepted 14:02" or "3 of 5 · 1m 48s". */
  footerNote?: string;
  /** Under a current step that needs approval. */
  waitingLabel?: string;
  /** Draft only: per-step Edit and Remove, plus Add step. Needs onChange. Default true. */
  editable?: boolean;
  onChange?: (steps: AgentPlanStep[]) => void;
  /** Draft: the solid primary. ⌘/Ctrl+Enter inside the card. */
  onAccept?: () => void;
  /** Accepted: starts the run. ⌘/Ctrl+Enter inside the card. */
  onRun?: () => void;
  /** Accepted: back to draft. */
  onEdit?: () => void;
  onSkipStep?: (stepId: string) => void;
  onStop?: () => void;
  onRetryStep?: (stepId: string) => void;
  /** Complete: open the Agent Trail of the run. */
  onViewTrail?: () => void;
  /** Empty: ask the agent for a plan. */
  onDraft?: () => void;
  /** One-line summary row. Pair with onCollapsedChange to let people open it. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  ref?: Ref<HTMLElement>;
}
