"use client";

import { useId, useMemo, useState } from "react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { CommentThread } from "../CommentThread";
import { Drawer } from "../Drawer";
import { Field } from "../Field";
import { Select } from "../Select";
import { TaskBoard } from "../TaskBoard";
import { cx } from "../shared/cx";
import { UNASSIGNED, cardsFor, columnOf, taskMeta, workBoardHandlers } from "./workBoard.logic";
import type { WorkBoardProps } from "./WorkBoard.types";
import styles from "./WorkBoard.module.css";

export type {
  WorkBoardProps,
  WorkBoardColumn,
  WorkBoardTask,
  WorkBoardPerson,
  WorkBoardTaskPatch,
} from "./WorkBoard.types";

/**
 * Block: a task board with detail. TaskBoard columns (drag or keyboard moves); a card opens a
 * Drawer with the task, Status and Assignee Fields, and its CommentThread.
 */
export function WorkBoard(props: WorkBoardProps) {
  const {
    columns,
    tasks,
    people,
    currentUserId,
    title = "Work board",
    boardTitle,
    note,
    openTaskId: openProp,
    defaultOpenTaskId = null,
    onOpenTaskChange,
    onMove,
    onUpdate,
    onComment,
    onEditComment,
    onDeleteComment,
    onAdd,
    onNewTask,
    loading,
    error,
    onRetry,
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const statusId = useId();
  const assigneeId = useId();
  const [innerOpen, setInnerOpen] = useState<string | null>(defaultOpenTaskId);
  const openId = openProp === undefined ? innerOpen : openProp;
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const cards = useMemo(() => cardsFor(tasks, people), [tasks, people]);
  const handlers = workBoardHandlers(columns, { onMove, onUpdate, onComment });
  const task = openId ? tasks.find((item) => item.id === openId) : undefined;
  const column = task ? columnOf(columns, task.id) : undefined;
  const assignee = task?.assigneeId ? people.find((person) => person.id === task.assigneeId) : undefined;
  const comments = task?.comments ?? [];
  const replyingTo = replyTo ? comments.find((comment) => comment.id === replyTo) : undefined;
  const total = tasks.length;
  const done = columns.length ? columns[columns.length - 1].cardIds.length : 0;

  function open(id: string | null) {
    if (openProp === undefined) setInnerOpen(id);
    setReplyTo(null);
    onOpenTaskChange?.(id);
  }

  return (
    <section {...rest} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.lead}>
          {total === 1 ? "1 task" : `${total} tasks`}
          {columns.length ? ` · ${done} in ${columns[columns.length - 1].label}` : ""}
        </p>
      </header>

      <TaskBoard
        title={boardTitle ?? title}
        note={note}
        columns={columns}
        cards={cards}
        onMove={onMove}
        onAdd={onAdd}
        onNewTask={onNewTask}
        onCardClick={(id) => open(id)}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />

      <Drawer
        open={Boolean(task)}
        size="lg"
        title={task?.title ?? title}
        description={task ? taskMeta(task, column) : undefined}
        onClose={() => open(null)}
      >
        {task ? (
          <div className={styles.detail}>
            {task.description ? <p className={styles.description}>{task.description}</p> : null}
            {task.tags?.length ? (
              <ul className={styles.tags} aria-label="Tags">
                {task.tags.map((tag) => (
                  <li key={tag}>
                    <Badge size="sm" tone="neutral" appearance="soft">
                      {tag}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className={styles.fields}>
              <Field label="Status" htmlFor={statusId}>
                <Select
                  id={statusId}
                  options={columns.map((item) => ({ value: item.id, label: item.label }))}
                  value={column?.id ?? ""}
                  placeholder="No status"
                  onChange={(value) => handlers.status(task.id, String(value))}
                />
              </Field>
              <Field label="Assignee" htmlFor={assigneeId}>
                <div className={styles.assignee}>
                  {assignee ? (
                    <Avatar size="sm" name={assignee.name} initials={assignee.initials} src={assignee.avatarSrc} />
                  ) : null}
                  <Select
                    id={assigneeId}
                    className={styles.assigneeSelect}
                    options={[
                      { value: UNASSIGNED, label: "Unassigned" },
                      ...people.map((person) => ({ value: person.id, label: person.name })),
                    ]}
                    value={task.assigneeId ?? UNASSIGNED}
                    onChange={(value) => handlers.assignee(task.id, String(value))}
                  />
                </div>
              </Field>
            </div>

            <div className={styles.thread}>
              {replyingTo ? (
                <p className={styles.replying}>
                  Replying to {replyingTo.author.name}
                  <Button size="sm" appearance="ghost" mode="neutral" onClick={() => setReplyTo(null)}>
                    Cancel reply
                  </Button>
                </p>
              ) : null}
              <CommentThread
                className={styles.comments}
                title="Comments"
                label={`Comments on ${task.title}`}
                comments={comments}
                currentUserId={currentUserId}
                value={drafts[task.id] ?? ""}
                onValueChange={(value) => setDrafts((all) => ({ ...all, [task.id]: value }))}
                onSubmit={() => {
                  if (handlers.post(task.id, drafts[task.id] ?? "", replyTo ?? undefined)) {
                    setDrafts((all) => ({ ...all, [task.id]: "" }));
                    setReplyTo(null);
                  }
                }}
                onReply={onComment ? (id) => setReplyTo(id) : undefined}
                onEdit={onEditComment ? (id, body) => onEditComment(task.id, id, body) : undefined}
                onDelete={onDeleteComment ? (id) => onDeleteComment(task.id, id) : undefined}
                emptyDescription="Ask a question or leave an update for whoever picks this up."
              />
            </div>
          </div>
        ) : (
          <span />
        )}
      </Drawer>
    </section>
  );
}
