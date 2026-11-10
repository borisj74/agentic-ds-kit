import type { ComponentPropsWithoutRef, Ref } from "react";

export type SetupTaskStatus = "todo" | "current" | "done" | "skipped";

export interface SetupTask {
  id: string;
  label: string;
  /** Second line, e.g. "CSV or connect your CRM · 5 min". */
  description?: string;
  status: SetupTaskStatus;
  /** Button label for todo and current tasks. Default "Continue" (current) or "Start" (todo). */
  actionLabel?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type SetupGuideOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface SetupGuideProps extends Omit<ComponentPropsWithoutRef<"section">, SetupGuideOwnedKeys> {
  /** e.g. "Get Northwind ready" */
  title: string;
  description?: string;
  tasks: SetupTask[];
  /** Start or continue a task (todo and current rows). */
  onTaskAction?: (id: string) => void;
  /** Undo a skipped task. Shown as "Skipped · Undo". */
  onUndoSkip?: (id: string) => void;
  /** Go to dashboard, the one solid primary once every task is done or skipped. */
  onComplete?: () => void;
  completeLabel?: string;
  /** Dismiss the guide (text button in the header). */
  onDismiss?: () => void;
  /** Note under the list, e.g. "Skipped tasks don't count toward progress; undo any time." Shown when a task is skipped. */
  skippedNote?: string;
  /** Empty state (no tasks for this plan). */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
