import type { AgentPlanStep } from "../AgentPlan/AgentPlan.types";
import type { AutonomyStop } from "../AutonomyDial/AutonomyDial.types";
import type { PlanReviewDecision } from "./PlanReview.types";

/** Pure helpers behind PlanReview. No React here. */

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * How many steps will pause for the person's OK at an autonomy stop. "ask" pauses on every step,
 * "tell" and "run" on none; "risk" and any custom stop pause where the plan asks (needsApproval).
 */
export function pausesAt(steps: AgentPlanStep[], autonomy: string): number {
  if (autonomy === "ask") return steps.length;
  if (autonomy === "tell" || autonomy === "run") return 0;
  return steps.filter((step) => step.needsApproval).length;
}

/** The lead under the heading: who proposes what, on what. */
export function planLead(steps: AgentPlanStep[], agent?: string, target?: string): string {
  const who = agent ?? "The agent";
  const where = target ? ` on ${target}` : "";
  return `${who} proposes ${plural(steps.length, "step")}${where}. Nothing runs until you approve.`;
}

/** The line beside the decision buttons: what Approve will do at the chosen stop. */
export function approveHint(steps: AgentPlanStep[], autonomy: string, options: AutonomyStop[]): string {
  const stop = options.find((option) => option.id === autonomy);
  const pauses = pausesAt(steps, autonomy);
  const runs = `Runs ${plural(steps.length, "step")}`;
  const label = stop ? ` · ${stop.label}` : "";
  const waits = pauses === 0 ? "no stops for your OK" : `${plural(pauses, "stop")} for your OK`;
  return `${runs}${label} · ${waits}`;
}

export const DECISION_COPY: Record<Exclude<PlanReviewDecision, "pending">, { title: string; variant: "success" | "info" | "danger" }> = {
  approved: { title: "Plan approved", variant: "success" },
  "changes-requested": { title: "Changes requested", variant: "info" },
  rejected: { title: "Plan rejected", variant: "danger" },
};
