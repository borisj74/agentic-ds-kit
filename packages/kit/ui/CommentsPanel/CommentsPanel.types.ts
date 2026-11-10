import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export interface CommentThreadSummary {
  id: string;
  /** e.g. "Tax rate for UK customers" or "Line 2 · seat price" */
  title: string;
  /** Latest comment, one line. */
  preview: string;
  /** Number of comments in the thread. */
  count: number;
  resolved?: boolean;
  /** Display time, e.g. "45m". */
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
  /** Render the panel in place instead of a kit Drawer (page sections, docs). */
  inline?: boolean;
  /** Show the "Comments · N open" trigger button. Default true unless inline. */
  showTrigger?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLDivElement>;
}
