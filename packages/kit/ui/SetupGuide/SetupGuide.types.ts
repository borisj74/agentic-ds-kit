import type { ComponentPropsWithoutRef, Ref } from "react";
import type { IntegrationItem } from "../IntegrationPicker/IntegrationPicker.types";

export type SetupTaskStatus = "todo" | "current" | "done" | "skipped" | "blocked";

export interface SetupTask {
  id: string;
  label: string;
  /** Second line, e.g. "CSV or connect your CRM · 5 min". */
  description?: string;
  status: SetupTaskStatus;
  /** Button label for todo and current tasks. Default "Continue" (current) or "Start" (todo). */
  actionLabel?: string;
  /** Task ids this one waits for. A blocked task whose dependencies are all done shows as To do. */
  dependsOn?: string[];
  /** Why a blocked task waits, e.g. "Unlocks when payments are connected". Default names the dependsOn tasks. */
  blockedReason?: string;
  /** Providers for this task, shown as compact tiles under the row while it is current. The row then has no button of its own. */
  integrations?: IntegrationItem[];
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
  /** Connect a provider tile under the current task. */
  onIntegrationConnect?: (integrationId: string, taskId: string) => void;
  /** The provider whose connection is in progress: its tile reads Connecting…, with no button. */
  connectingId?: string;
  /** Undo a skipped task: a ghost "Undo skip" Button on the row. */
  onUndoSkip?: (id: string) => void;
  /** Go to dashboard, the one solid primary once every task is done or skipped. */
  onComplete?: () => void;
  completeLabel?: string;
  /** Dismiss the guide (ghost Button in the header). */
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
