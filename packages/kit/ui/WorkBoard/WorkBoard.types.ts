import type { ComponentPropsWithoutRef, Ref } from "react";
import type { CommentAuthor, ThreadComment } from "../CommentThread/CommentThread.types";
import type { TaskBoardColumn } from "../TaskBoard/TaskBoard.types";

/** A board column; the column a task sits in is its status. Same shape as TaskBoard columns. */
export type WorkBoardColumn = TaskBoardColumn;

/** Someone a task can be assigned to, and a comment author. */
export type WorkBoardPerson = CommentAuthor;

/** A task: a TaskBoard card plus what its detail drawer shows. */
export interface WorkBoardTask {
  id: string;
  title: string;
  /** Longer copy for the drawer. */
  description?: string;
  /** Short labels, e.g. ["Billing"]. */
  tags?: string[];
  /** A `people` id, or none for unassigned. */
  assigneeId?: string;
  /** Display date, e.g. "14 Nov". */
  dueOn?: string;
  comments?: ThreadComment[];
}

/** What the drawer's Fields change. */
export interface WorkBoardTaskPatch {
  assigneeId?: string | null;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type WorkBoardOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface WorkBoardProps extends Omit<ComponentPropsWithoutRef<"section">, WorkBoardOwnedKeys> {
  columns: WorkBoardColumn[];
  tasks: WorkBoardTask[];
  people: WorkBoardPerson[];
  /** The signed-in person: their comments get Edit and Delete. */
  currentUserId?: string;
  /** Block heading. Default "Work board". */
  title?: string;
  /** Board name on the TaskBoard, e.g. "Billing Q4". Default: `title`. */
  boardTitle?: string;
  /** Muted note on the board, e.g. "example tasks". */
  note?: string;
  /** Controlled: the task whose drawer is open, or null. */
  openTaskId?: string | null;
  /** Uncontrolled starting drawer. Default none. */
  defaultOpenTaskId?: string | null;
  onOpenTaskChange?: (id: string | null) => void;
  /** A task moved: dragged or keyboard-moved on the board, or its Status changed in the drawer (to the end of that column). */
  onMove: (taskId: string, toColumnId: string, index: number) => void;
  /** The drawer's Assignee changed. */
  onUpdate?: (taskId: string, patch: WorkBoardTaskPatch) => void;
  /** A comment was posted on a task; `parentId` when it replies to one. */
  onComment?: (taskId: string, body: string, parentId?: string) => void;
  onEditComment?: (taskId: string, commentId: string, body: string) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  /** "Add card" under a column. */
  onAdd?: (columnId: string) => void;
  /** Header: New task. */
  onNewTask?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
