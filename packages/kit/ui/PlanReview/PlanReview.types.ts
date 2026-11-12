import type { ComponentPropsWithoutRef, Ref } from "react";
import type { AgentPlanStep } from "../AgentPlan/AgentPlan.types";
import type { AutonomyStop } from "../AutonomyDial/AutonomyDial.types";
import type { ChangeItem } from "../ChangeSummary/ChangeSummary.types";

/** Where the review stands. Anything but pending locks the plan and shows the outcome. */
export type PlanReviewDecision = "pending" | "approved" | "changes-requested" | "rejected";

/** What Approve hands back: the autonomy stop chosen and the steps as approved. */
export interface PlanReviewApproval {
  autonomy: string;
  steps: AgentPlanStep[];
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type PlanReviewOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface PlanReviewProps extends Omit<ComponentPropsWithoutRef<"section">, PlanReviewOwnedKeys> {
  /** The plan's title, e.g. "Add rate limiting to the public API". Shown on the AgentPlan card. */
  planTitle: string;
  /** AgentPlan steps: { id, label, tool?, target?, note?, needsApproval? }[]. */
  steps: AgentPlanStep[];
  /** Step edits from the plan (Save step, Remove, Add step). Without it the steps are read-only. */
  onStepsChange?: (steps: AgentPlanStep[]) => void;
  /** Who proposed the plan, e.g. "Backend agent". Used in the lead line. */
  agent?: string;
  /** What the plan acts on, e.g. "acme/api". Shown in the lead and on the AutonomyDial. */
  target?: string;
  /** What the plan expects to change: ChangeSummary items (before → after, delta, sentiment). */
  changes?: ChangeItem[];
  /** ChangeSummary title. Default "What the plan changes". */
  changesTitle?: string;
  /** ChangeSummary period line, e.g. "Expected after the run". */
  changesPeriod?: string;
  /** Controlled autonomy stop id. */
  autonomy?: string;
  /** Uncontrolled starting autonomy. Default "risk". */
  defaultAutonomy?: string;
  onAutonomyChange?: (autonomy: string) => void;
  /** AutonomyDial stops. Default the kit's AUTONOMY_STOPS (ask · risk · tell · run). */
  autonomyOptions?: AutonomyStop[];
  /** Where the review stands. Default "pending". */
  decision?: PlanReviewDecision;
  /** One line under the outcome, e.g. "by you · 14:02". */
  decisionNote?: string;
  /** Approve plan: the view's one solid primary. Gets the chosen autonomy and the steps. */
  onApprove?: (approval: PlanReviewApproval) => void;
  /** Request changes: the note the person wrote for the agent. */
  onRequestChanges?: (note: string) => void;
  /** Reject the plan. */
  onReject?: () => void;
  /** Block heading. Default "Plan review". */
  title?: string;
  ref?: Ref<HTMLElement>;
}
