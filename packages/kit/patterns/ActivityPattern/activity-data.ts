/** Demo data for ActivityPattern. Replace with your own: metrics, tasks, and feed events. */
import type { BadgeTone } from "../../ui/Badge";
import type { DataTableRow } from "../../ui/DataTable";
import type { InsightCardTone } from "../../ui/InsightCard";

export const ACTIVITY_METRICS = [
  { label: "Today", value: "6", delta: "+2", trend: "up" as const, hint: "vs yesterday", size: "lg" as const, badge: "Live", badgeTone: "success" as const },
  { label: "Comments", value: "5", delta: "+1", trend: "up" as const, hint: "this sprint", size: "lg" as const, badge: "Sprint", badgeTone: "info" as const },
  { label: "Status changes", value: "4", delta: "0", trend: "flat" as const, hint: "this sprint", size: "lg" as const, badge: "Ship", badgeTone: "brand" as const },
  { label: "Mentions", value: "2", delta: "+2", trend: "up" as const, hint: "need reply", size: "lg" as const, badge: "At risk", badgeTone: "danger" as const },
];

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
    status: "Ready",
    statusTone: "success",
    due: "Today",
    summary: "Charts are current. Needs a one-line takeaway on the at-risk tag.",
    progress: 88,
  },
];

export const EVENT_ROWS: DataTableRow[] = [
  {
    id: "comment-launch",
    actor: { type: "avatar", label: "Maya Chen", name: "Maya Chen" },
    event: { type: "file", label: "Commented on Launch brief" },
    type: { type: "badge", label: "Comment", tone: "info" },
    when: "2h ago",
  },
  {
    id: "blocked-qa",
    actor: { type: "avatar", label: "Unassigned", name: "Unassigned" },
    event: { type: "file", label: "QA checklist marked Blocked" },
    type: { type: "badge", label: "Status", tone: "danger" },
    when: "4h ago",
  },
  {
    id: "macros-update",
    actor: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera" },
    event: { type: "file", label: "Updated Support macros" },
    type: { type: "badge", label: "Edit", tone: "neutral" },
    when: "5h ago",
  },
  {
    id: "ready-notes",
    actor: { type: "avatar", label: "Jordan Lee", name: "Jordan Lee" },
    event: { type: "file", label: "Moved Release notes to Ready" },
    type: { type: "badge", label: "Status", tone: "success" },
    when: "Yesterday",
  },
  {
    id: "mention-launch",
    actor: { type: "avatar", label: "Maya Chen", name: "Maya Chen" },
    event: { type: "file", label: "Mentioned you in Launch brief" },
    type: { type: "badge", label: "Mention", tone: "brand" },
    when: "Yesterday",
  },
  {
    id: "macros-comment",
    actor: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera" },
    event: { type: "file", label: "Replied on Support macros" },
    type: { type: "badge", label: "Comment", tone: "info" },
    when: "Mon",
  },
];
