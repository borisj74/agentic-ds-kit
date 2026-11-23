import type { ProgressStepsItem, ProgressStepsStatus } from "./ProgressSteps.types";

const STATUSES: readonly ProgressStepsStatus[] = ["complete", "current", "upcoming", "error"];

export function clampCurrent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function isStatus(value: ProgressStepsStatus | undefined): value is ProgressStepsStatus {
  return Boolean(value && STATUSES.includes(value));
}

export function resolveStatus(step: ProgressStepsItem, index: number, current: number): ProgressStepsStatus {
  if (isStatus(step.status)) return step.status;
  if (index < current) return "complete";
  if (index === current) return "current";
  return "upcoming";
}

/** True when the step shows as optional: an upcoming step flagged optional. */
export function isOptional(step: ProgressStepsItem, status: ProgressStepsStatus): boolean {
  return Boolean(step.optional) && status === "upcoming";
}

/** The visible status word. Screen readers hear the same word plus "step n of m". */
export function statusWord(status: ProgressStepsStatus, optional = false): string {
  if (status === "complete") return "Done";
  if (status === "current") return "Current";
  if (status === "error") return "Error";
  return optional ? "Optional" : "Upcoming";
}

export interface ProgressStepsSummary {
  /** 0-based index of the step the compact layout names, or -1 when every step is done. */
  index: number;
  /** "Step 2 of 4", or "All 4 steps done". */
  position: string;
  /** Label of the step the compact layout names. Empty when every step is done. */
  label: string;
  /** Bar value from 0 to 100. */
  value: number;
  /** Text under the bar: "Next is Add-ons, optional", "Last step", or "All steps done". */
  next: string;
}

/** What the compact (narrow) layout shows: where the user is, the bar value, and what comes next. */
export function summarize(
  steps: readonly ProgressStepsItem[],
  statuses: readonly ProgressStepsStatus[],
  current: number,
): ProgressStepsSummary {
  const total = steps.length;
  let index = statuses.indexOf("current");
  if (index < 0) index = statuses.indexOf("error");
  if (index < 0) index = current < total ? current : -1;

  if (index < 0) {
    return { index: -1, position: `All ${total} steps done`, label: "", value: 100, next: "All steps done" };
  }

  const nextStep = steps[index + 1];
  const next = nextStep
    ? `Next is ${nextStep.label}${nextStep.optional ? ", optional" : ""}`
    : "Last step";

  return {
    index,
    position: `Step ${index + 1} of ${total}`,
    label: steps[index].label,
    value: Math.round(((index + 1) / total) * 100),
    next,
  };
}
