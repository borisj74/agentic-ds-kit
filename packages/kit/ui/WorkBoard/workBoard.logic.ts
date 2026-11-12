import type { TaskBoardCard } from "../TaskBoard/TaskBoard.types";
import type { WorkBoardColumn, WorkBoardPerson, WorkBoardTask } from "./WorkBoard.types";

/** Pure helpers behind WorkBoard. No React here. */

export const UNASSIGNED = "unassigned";

/** Board cards: tasks with their assignee resolved from `people`. */
export function cardsFor(tasks: WorkBoardTask[], people: WorkBoardPerson[]): TaskBoardCard[] {
  const byId = new Map(people.map((person) => [person.id, person]));
  return tasks.map((task) => {
    const person = task.assigneeId ? byId.get(task.assigneeId) : undefined;
    return {
      id: task.id,
      title: task.title,
      tags: task.tags,
      dueOn: task.dueOn,
      assignee: person ? { name: person.name, initials: person.initials, avatarSrc: person.avatarSrc } : undefined,
    };
  });
}

/** The column a task sits in (its status). */
export function columnOf(columns: WorkBoardColumn[], taskId: string): WorkBoardColumn | undefined {
  return columns.find((column) => column.cardIds.includes(taskId));
}

/**
 * Move a task to `index` in `toColumnId`, returning new columns. Pure, for apps (and the docs demo)
 * that keep the columns in state: call it from onMove.
 */
export function moveWorkBoardTask(
  columns: WorkBoardColumn[],
  taskId: string,
  toColumnId: string,
  index: number,
): WorkBoardColumn[] {
  const stripped = columns.map((column) => ({ ...column, cardIds: column.cardIds.filter((id) => id !== taskId) }));
  return stripped.map((column) => {
    if (column.id !== toColumnId) return column;
    const at = Math.max(0, Math.min(index, column.cardIds.length));
    return { ...column, cardIds: [...column.cardIds.slice(0, at), taskId, ...column.cardIds.slice(at)] };
  });
}

/** "Status: In review · due 14 Nov · 3 comments". */
export function taskMeta(task: WorkBoardTask, column?: WorkBoardColumn): string {
  const parts = [column ? `Status: ${column.label}` : undefined, task.dueOn ? `due ${task.dueOn}` : undefined];
  const count = task.comments?.length ?? 0;
  parts.push(count === 1 ? "1 comment" : `${count} comments`);
  return parts.filter(Boolean).join(" · ");
}

/**
 * The drawer's controls mapped onto the block's callbacks. Status moves the task to the end of the
 * chosen column; Assignee is an update; a post carries the comment being replied to, if any.
 */
export function workBoardHandlers(
  columns: WorkBoardColumn[],
  handlers: {
    onMove?: (taskId: string, toColumnId: string, index: number) => void;
    onUpdate?: (taskId: string, patch: { assigneeId?: string | null }) => void;
    onComment?: (taskId: string, body: string, parentId?: string) => void;
  },
) {
  return {
    status: (taskId: string, columnId: string) => {
      const current = columnOf(columns, taskId);
      if (current?.id === columnId) return;
      const target = columns.find((column) => column.id === columnId);
      if (!target) return;
      handlers.onMove?.(taskId, columnId, target.cardIds.length);
    },
    assignee: (taskId: string, value: string) =>
      handlers.onUpdate?.(taskId, { assigneeId: value === UNASSIGNED ? null : value }),
    post: (taskId: string, body: string, parentId?: string) => {
      const text = body.trim();
      if (!text) return false;
      handlers.onComment?.(taskId, text, parentId);
      return true;
    },
  };
}
