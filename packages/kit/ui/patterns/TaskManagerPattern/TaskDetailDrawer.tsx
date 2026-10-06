"use client";

import { Avatar } from "../../Avatar";
import { Badge } from "../../Badge";
import { Button } from "../../Button";
import { Drawer } from "../../Drawer";
import { Progress } from "../../Progress";
import { STATUS_TONE, type ManagedTask } from "./task-data";
import styles from "./TaskManagerPattern.module.css";

export function TaskDetailDrawer({
  task,
  onClose,
  onComplete,
}: {
  task: ManagedTask | null;
  onClose: () => void;
  onComplete: (id: string) => void;
}) {
  const done = task?.status === "done";
  const blocked = task?.status === "blocked";

  return (
    <Drawer
      open={Boolean(task)}
      title={task?.title ?? "Task"}
      description={task ? `${task.owner} · Due ${task.dueLabel}` : undefined}
      onClose={onClose}
      footer={
        task ? (
          <>
            {done ? null : (
              <Button variant="primary" block onClick={() => onComplete(task.id)}>
                {blocked ? "Assign owner" : "Mark done"}
              </Button>
            )}
            <Button variant="secondary" block onClick={onClose}>
              Close
            </Button>
          </>
        ) : null
      }
    >
      {task ? (
        <div className={styles.detail}>
          <div className={styles.detailRow}>
            <Avatar name={task.owner} size="md" />
            <div className={styles.meta}>
              <p className={styles.label}>Owner</p>
              <p className={styles.value}>{task.owner}</p>
            </div>
            <Badge tone={STATUS_TONE[task.status]}>{done ? "Done" : blocked ? "Blocked" : "Open"}</Badge>
          </div>
          <p className={styles.summary}>{task.summary}</p>
          <Progress value={task.progress} size="sm" label="Progress" showValue />
        </div>
      ) : null}
    </Drawer>
  );
}
