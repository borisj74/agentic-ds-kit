"use client";

import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Drawer } from "../../ui/Drawer";
import { Progress } from "../../ui/Progress";
import type { TaskInsight } from "./activity-data";
import styles from "./TaskDrawer.module.css";

export function TaskDrawer({
  task,
  onClose,
}: {
  task: TaskInsight | null;
  onClose: () => void;
}) {
  const unassigned = task?.owner === "Unassigned";

  return (
    <Drawer
      open={Boolean(task)}
      title={task?.title ?? "Task"}
      description={task ? `${task.status} · Due ${task.due}` : undefined}
      onClose={onClose}
      footer={
        task ? (
          <>
            {unassigned ? (
              <Button variant="primary" block onClick={onClose}>
                Assign owner
              </Button>
            ) : null}
            <Button variant="secondary" block onClick={onClose}>
              Close
            </Button>
          </>
        ) : null
      }
    >
      {task ? (
        <div className={styles.stack}>
          <div className={styles.row}>
            <Avatar name={task.owner} src={task.ownerSrc} size="md" />
            <div className={styles.meta}>
              <p className={styles.label}>Owner</p>
              <p className={styles.value}>{task.owner}</p>
            </div>
            <Badge tone={task.statusTone}>{task.status}</Badge>
          </div>
          <p className={styles.summary}>{task.summary}</p>
          <Progress value={task.progress} size="sm" label="Progress" showValue />
        </div>
      ) : null}
    </Drawer>
  );
}
