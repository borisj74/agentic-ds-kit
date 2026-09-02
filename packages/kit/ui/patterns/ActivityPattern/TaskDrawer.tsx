"use client";

import { Avatar } from "../../Avatar";
import { Badge } from "../../Badge";
import type { BadgeTone } from "../../Badge";
import { Button } from "../../Button";
import { Drawer } from "../../Drawer";
import type { InsightCardTone } from "../../InsightCard";
import { Progress } from "../../Progress";
import styles from "./TaskDrawer.module.css";

export interface TaskInsight {
  id: string;
  title: string;
  description: string;
  tone: InsightCardTone;
  source: string;
  owner: string;
  ownerSrc?: string;
  status: string;
  statusTone: BadgeTone;
  due: string;
  summary: string;
  progress: number;
}

export const TASK_INSIGHTS: TaskInsight[] = [
  {
    id: "qa-checklist",
    title: "QA checklist is still blocked",
    description: "Unassigned for 2 days. Assign an owner before Thursday's review.",
    tone: "warning",
    source: "From Open tasks",
    owner: "Unassigned",
    status: "Blocked",
    statusTone: "danger",
    due: "Thursday",
    summary: "No owner. Legal sign-off and the last two device passes are still open.",
    progress: 35,
  },
  {
    id: "launch-brief",
    title: "Launch brief is waiting on review",
    description: "Maya left comments 2 hours ago. Close them before the freeze.",
    tone: "info",
    source: "From Open tasks",
    owner: "Maya Chen",
    ownerSrc: "/faces/maya-chen.jpg",
    status: "In review",
    statusTone: "warning",
    due: "Tomorrow",
    summary: "Copy is in review. Two comments on positioning still need a reply.",
    progress: 72,
  },
  {
    id: "release-notes",
    title: "Release notes are ready to ship",
    description: "Jordan marked this Ready. Confirm the changelog before tag.",
    tone: "opportunity",
    source: "From Open tasks",
    owner: "Jordan Lee",
    ownerSrc: "/faces/jordan-lee.jpg",
    status: "Ready",
    statusTone: "success",
    due: "Today",
    summary: "Draft is complete. Needs a final pass on the known-issues list.",
    progress: 90,
  },
  {
    id: "support-macros",
    title: "Support macros need a pass",
    description: "Alex updated the file 5 hours ago. Three replies are still in progress.",
    tone: "neutral",
    source: "From Open tasks",
    owner: "Alex Rivera",
    ownerSrc: "/faces/alex-rivera.jpg",
    status: "In progress",
    statusTone: "info",
    due: "Friday",
    summary: "Refund and delay macros are drafted. Escalation paths are not.",
    progress: 55,
  },
  {
    id: "user-research",
    title: "User research needs synthesis",
    description: "Eight interviews landed this week. Tag themes before Friday's readout.",
    tone: "info",
    source: "From Resources",
    owner: "Iris Okafor",
    ownerSrc: "/faces/iris-okafor.jpg",
    status: "In progress",
    statusTone: "info",
    due: "Friday",
    summary: "Notes are in. Themes and clips still need to land in the shared doc.",
    progress: 48,
  },
  {
    id: "at-risk-triage",
    title: "At-risk items need triage",
    description: "Five tagged At risk. Rank them before the freeze so owners can move.",
    tone: "danger",
    source: "From Tags",
    owner: "Noah Williams",
    ownerSrc: "/faces/noah-williams.jpg",
    status: "Blocked",
    statusTone: "danger",
    due: "Tomorrow",
    summary: "The list is stale. Two items already shipped and still carry the tag.",
    progress: 20,
  },
  {
    id: "invite-members",
    title: "Invite members is still open",
    description: "Three seats unused. Send invites so review comments have owners.",
    tone: "warning",
    source: "From Workspace",
    owner: "Unassigned",
    status: "Open",
    statusTone: "warning",
    due: "Friday",
    summary: "Seats are provisioned. Nobody has sent the invites for design and QA.",
    progress: 10,
  },
  {
    id: "insights-share",
    title: "Insights report is ready to share",
    description: "Weekly digest is compiled. Send it before standup so the team can act.",
    tone: "opportunity",
    source: "From Insights",
    owner: "Iris Okafor",
    ownerSrc: "/faces/iris-okafor.jpg",
    status: "Ready",
    statusTone: "success",
    due: "Today",
    summary: "Charts are current. Needs a one-line takeaway on the at-risk tag.",
    progress: 88,
  },
];

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
