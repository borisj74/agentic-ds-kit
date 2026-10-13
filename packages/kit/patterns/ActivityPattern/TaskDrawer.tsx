"use client";

import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Drawer } from "../../ui/Drawer";
import { Progress } from "../../ui/Progress";
import type { TaskInsight } from "./activity-data";
import "./TaskDrawer.css";

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
        <div className="activity-task-drawer__stack">
          <div className="activity-task-drawer__row">
            <Avatar name={task.owner} src={task.ownerSrc} size="md" />
            <div className="activity-task-drawer__meta">
              <p className="activity-task-drawer__label">Owner</p>
              <p className="activity-task-drawer__value">{task.owner}</p>
            </div>
            <Badge tone={task.statusTone}>{task.status}</Badge>
          </div>
          <p className="activity-task-drawer__summary">{task.summary}</p>
          <Progress value={task.progress} size="sm" label="Progress" showValue />
        </div>
      ) : null}
    </Drawer>
  );
}
