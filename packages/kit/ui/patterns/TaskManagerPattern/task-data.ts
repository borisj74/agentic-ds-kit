import type { BadgeTone } from "../../Badge";

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "open" | "blocked" | "done";
export type TaskGroup = "today" | "upcoming" | "later" | "done";

export interface ManagedTask {
  id: string;
  title: string;
  owner: string;
  due: string;
  dueLabel: string;
  priority: TaskPriority;
  status: TaskStatus;
  group: TaskGroup;
  summary: string;
  progress: number;
}

export const TASK_GROUPS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "later", label: "Later" },
  { id: "done", label: "Done" },
] as const;

export const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const PRIORITY_TONE: Record<TaskPriority, BadgeTone> = {
  high: "danger",
  medium: "warning",
  low: "info",
};

export const STATUS_TONE: Record<TaskStatus, BadgeTone> = {
  open: "info",
  blocked: "danger",
  done: "success",
};

export const INITIAL_TASKS: ManagedTask[] = [
  {
    id: "launch-brief",
    title: "Close launch brief comments",
    owner: "Maya Chen",
    due: "2026-10-06",
    dueLabel: "Today",
    priority: "high",
    status: "open",
    group: "today",
    summary: "Two notes on positioning. Reply before the freeze so copy can lock.",
    progress: 72,
  },
  {
    id: "release-notes",
    title: "Confirm known-issues list",
    owner: "Jordan Lee",
    due: "2026-10-06",
    dueLabel: "Today",
    priority: "medium",
    status: "open",
    group: "today",
    summary: "Changelog is drafted. Confirm known issues before we tag Sprint 24.",
    progress: 90,
  },
  {
    id: "insights-share",
    title: "Send the insights digest",
    owner: "Iris Okafor",
    due: "2026-10-06",
    dueLabel: "Today",
    priority: "medium",
    status: "open",
    group: "today",
    summary: "Weekly digest is compiled. Needs a one-line takeaway on the at-risk tag.",
    progress: 88,
  },
  {
    id: "qa-checklist",
    title: "Assign an owner for QA checklist",
    owner: "Unassigned",
    due: "2026-10-08",
    dueLabel: "Thu",
    priority: "high",
    status: "blocked",
    group: "upcoming",
    summary: "Unassigned for 2 days. Legal sign-off and two device passes are still open.",
    progress: 35,
  },
  {
    id: "user-research",
    title: "Tag research themes",
    owner: "Iris Okafor",
    due: "2026-10-09",
    dueLabel: "Fri",
    priority: "low",
    status: "open",
    group: "upcoming",
    summary: "Eight interviews landed this week. Themes and clips still need a shared doc.",
    progress: 48,
  },
  {
    id: "invite-members",
    title: "Invite remaining seats",
    owner: "Unassigned",
    due: "2026-10-09",
    dueLabel: "Fri",
    priority: "medium",
    status: "open",
    group: "upcoming",
    summary: "Three seats unused. Send invites so review comments have owners.",
    progress: 10,
  },
  {
    id: "support-macros",
    title: "Draft escalation paths",
    owner: "Alex Rivera",
    due: "2026-10-13",
    dueLabel: "Mon",
    priority: "low",
    status: "open",
    group: "later",
    summary: "Refund and delay macros are drafted. Escalation paths are not.",
    progress: 55,
  },
  {
    id: "users-chart",
    title: "Refresh weekly users chart",
    owner: "Noah Williams",
    due: "2026-10-05",
    dueLabel: "Yesterday",
    priority: "low",
    status: "done",
    group: "done",
    summary: "Live series is current through Sunday. No follow-up.",
    progress: 100,
  },
];

export function badgeFor(task: ManagedTask): { badge: string; badgeTone: BadgeTone } {
  if (task.status === "done") return { badge: "Done", badgeTone: "success" };
  if (task.status === "blocked") return { badge: "Blocked", badgeTone: "danger" };
  return {
    badge: task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low",
    badgeTone: PRIORITY_TONE[task.priority],
  };
}
