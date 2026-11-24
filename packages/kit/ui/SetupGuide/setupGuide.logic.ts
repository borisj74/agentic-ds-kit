import type { SetupTask, SetupTaskStatus } from "./SetupGuide.types";

/** Pure helpers behind SetupGuide. No React here. */

/** A blocked task whose dependsOn tasks are all done is no longer blocked: it shows as To do. */
export function effectiveStatus(task: SetupTask, tasks: SetupTask[]): SetupTaskStatus {
  if (task.status !== "blocked" || !task.dependsOn?.length) return task.status;
  const open = task.dependsOn.some((id) => tasks.find((other) => other.id === id)?.status !== "done");
  return open ? "blocked" : "todo";
}

/** The status word every row shows next to its icon. */
export function statusWord(status: SetupTaskStatus): string {
  return status === "done" ? "Done" : status === "current" ? "Current" : status === "blocked" ? "Blocked" : status === "skipped" ? "Skipped" : "To do";
}

/** Why a blocked task waits: blockedReason, else "Unlocks after <dependency labels>". */
export function blockedReason(task: SetupTask, tasks: SetupTask[]): string | undefined {
  if (task.blockedReason) return task.blockedReason;
  const labels = (task.dependsOn ?? []).map((id) => tasks.find((other) => other.id === id)?.label).filter(Boolean);
  return labels.length ? `Unlocks after ${labels.join(", ")}` : task.description;
}

/** "1 of 4 done · 1 skipped". */
export function progressLabel(done: number, total: number, skipped: number): string {
  return `${done} of ${total} done${skipped ? ` · ${skipped} skipped` : ""}`;
}
