import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export interface CommentThreadSummary {
  id: string;
  /** e.g. "Tax rate for UK customers" or "Line 2 · seat price" */
  title: string;
  /** Latest comment, one line. */
  preview: string;
  /** The record the thread is on, e.g. "INV-1842 · Northwind". Leads the open thread's meta line. */
  context?: string;
  /** Number of comments in the thread. */
  count: number;
  resolved?: boolean;
  /** Display time in one format with the thread, e.g. "Nov 20, 10:26". */
  updatedAt: string;
}

export type CommentsFilter = "open" | "resolved" | "all";

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type CommentsPanelOwnedKeys = "children" | "title" | "onSelect";

/** `ref`, `className` and other native attributes land on the root (inline panel, or the trigger wrapper). */
export interface CommentsPanelProps extends Omit<ComponentPropsWithoutRef<"div">, CommentsPanelOwnedKeys> {
  threads: CommentThreadSummary[];
  /** Drawer state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The thread shown in the panel; null shows the list. */
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  /** Resolve the selected thread. */
  onResolve?: (id: string) => void;
  /** Controlled filter. Default "open". */
  filter?: CommentsFilter;
  onFilterChange?: (filter: CommentsFilter) => void;
  /** The selected thread's content, usually a kit CommentThread (without a title). */
  children?: ReactNode;
  /** Shown under the list, e.g. a CommentThread composer for a page-level note. */
  composer?: ReactNode;
  /** Default "Comments". */
  label?: string;
  /** Empty state, e.g. "No comments on this invoice". */
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * true renders the panel in place instead of a kit Drawer (page sections, docs). "auto" docks it beside
   * the page from --grid-breakpoint-lg while open, and uses the Drawer below that.
   */
  inline?: boolean | "auto";
  /** Show the "Comments · N open" trigger button. Default true unless inline. */
  showTrigger?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLDivElement>;
}
