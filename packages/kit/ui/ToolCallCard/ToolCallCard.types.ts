import type { ComponentPropsWithoutRef, Ref } from "react";

export type ToolCallStatus = "running" | "done" | "error";

/** One tool call in a group. */
export interface ToolCall {
  id: string;
  name: string;
  summary?: string;
  status: ToolCallStatus;
  /** e.g. "0.4s" */
  duration?: string;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type ToolCallCardOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface ToolCallCardProps extends Omit<ComponentPropsWithoutRef<"div">, ToolCallCardOwnedKeys> {
  /** Tool name, e.g. "search_files". Shown in mono. Ignored when `calls` is set. */
  name?: string;
  /** One line after the name: the query, the target or the outcome. */
  summary?: string;
  status?: ToolCallStatus;
  /** Elapsed or final time, e.g. "1.2s". While running and `startedAt` is set, the card ticks it live. */
  duration?: string;
  /** Epoch ms the call started. Running cards tick a live timer from it. */
  startedAt?: number;
  /** Arguments: an object is shown as pretty JSON, a string as is. */
  args?: unknown;
  /** Result lines. */
  result?: string | string[];
  /** Note on the result header, e.g. "3 of 3". */
  resultMeta?: string;
  /** Error lines (status error). Shown open. */
  error?: string | string[];
  onRetry?: () => void;
  /** "Attempt 1 of 3" next to Retry. */
  attempt?: { n: number; max: number };
  /** Group mode: several calls in one row that opens into a list. */
  calls?: ToolCall[];
  /** Group title. Default "Ran N tools". */
  groupTitle?: string;
  /** Controlled open state. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  ref?: Ref<HTMLDivElement>;
}
