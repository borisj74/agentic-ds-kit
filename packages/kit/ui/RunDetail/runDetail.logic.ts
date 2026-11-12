import type { AgentMonitorStep } from "../AgentMonitor/AgentMonitor.types";
import type { AgentTrailStep, AgentTrailStepStatus } from "../AgentTrail/AgentTrail.types";
import type { AgentTreeNode } from "../AgentTree/AgentTree.types";
import type { ToolCallStatus } from "../ToolCallCard/ToolCallCard.types";
import type { RunDetailStep, RunDetailStepStatus } from "./RunDetail.types";

/** Pure helpers behind RunDetail: one step list mapped onto each part. No React here. */

const TRAIL_STATUS: Record<RunDetailStepStatus, AgentTrailStepStatus> = {
  done: "done",
  running: "running",
  waiting: "approval",
  failed: "failed",
  pending: "pending",
};

const CALL_STATUS: Record<Exclude<RunDetailStepStatus, "pending">, ToolCallStatus> = {
  done: "done",
  running: "running",
  waiting: "running",
  failed: "error",
};

/** The time strip: what has started. Pending steps are not in it yet. */
export function monitorSteps(steps: RunDetailStep[]): AgentMonitorStep[] {
  return steps
    .filter((step) => step.status !== "pending")
    .map(({ id, tool, status, icon, target, duration, tokens, cost, started, weight }) => ({
      id,
      tool,
      status: status as AgentMonitorStep["status"],
      icon,
      target,
      duration,
      tokens,
      cost,
      started,
      weight,
    }));
}

/** The trail: every step, planned ones included. The sublabel is the tool and its target. */
export function trailSteps(steps: RunDetailStep[]): AgentTrailStep[] {
  return steps.map((step) => ({
    id: step.id,
    label: step.label ?? step.tool,
    status: TRAIL_STATUS[step.status],
    duration: step.duration,
    timer: step.timer,
    sublabel: [step.tool, step.target].filter(Boolean).join(" "),
  }));
}

/** ToolCallCard props for a step, or null for a pending one (no call yet). */
export function toolCallFor(step: RunDetailStep | undefined) {
  if (!step || step.status === "pending") return null;
  return {
    name: step.tool,
    summary: step.status === "waiting" ? "Waiting for your approval" : step.target,
    status: CALL_STATUS[step.status],
    duration: step.status === "running" || step.status === "waiting" ? step.timer ?? step.duration : step.duration,
    args: step.args,
    result: step.result,
    resultMeta: step.resultMeta,
    error: step.status === "failed" ? step.error : undefined,
  };
}

/** Every node id in the tree. */
function nodeIds(node: AgentTreeNode): string[] {
  return [node.id, ...(node.children ?? []).flatMap(nodeIds)];
}

/** Tree node to select: the agent that ran the step (if it is in the tree). */
export function agentForStep(steps: RunDetailStep[], stepId: string | null | undefined, root: AgentTreeNode): string | null {
  const step = stepId ? steps.find((item) => item.id === stepId) : undefined;
  if (!step) return null;
  return nodeIds(root).includes(step.agentId) ? step.agentId : null;
}

/**
 * Step to select for a tree node: that agent's open step (waiting, running, failed) if it has
 * one, else its latest started step, else its first planned step. Null when it has no steps.
 */
export function stepForAgent(steps: RunDetailStep[], agentId: string): string | null {
  const own = steps.filter((step) => step.agentId === agentId);
  const started = own.filter((step) => step.status !== "pending");
  const open = started.find((step) => step.status === "waiting" || step.status === "running" || step.status === "failed");
  return (open ?? started[started.length - 1] ?? own[0])?.id ?? null;
}

/** The step to retry from the run's own Retry: the last failed step. */
export function lastFailedStep(steps: RunDetailStep[]): string | null {
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    if (steps[index].status === "failed") return steps[index].id;
  }
  return null;
}

/** The step a tree node's Retry retries: that agent's last failed step. */
export function failedStepForAgent(steps: RunDetailStep[], agentId: string): string | null {
  return lastFailedStep(steps.filter((step) => step.agentId === agentId));
}

/** "3 of 7 steps done · 1 waiting" for the block's lead line. */
export function runSummary(steps: RunDetailStep[]): string {
  const done = steps.filter((step) => step.status === "done").length;
  const waiting = steps.filter((step) => step.status === "waiting").length;
  const failed = steps.filter((step) => step.status === "failed").length;
  const parts = [`${done} of ${steps.length} steps done`];
  if (waiting) parts.push(`${waiting} waiting for you`);
  if (failed) parts.push(`${failed} failed`);
  return parts.join(" · ");
}
