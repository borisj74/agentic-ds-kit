/** Demo data for DashboardPattern. Replace with your own metrics, chart series, and tasks. */
import type { DataTableRow } from "../../ui/DataTable";
import type { ChartDatum } from "../../ui/shared/chartMath";

export const SPRINT_METRICS = [
  { label: "Weekly users", value: "1.44k", delta: "+6.2%", trend: "up" as const, hint: "vs last week", size: "lg" as const, badge: "Live", badgeTone: "success" as const },
  { label: "Open tasks", value: "4", delta: "+1", trend: "up" as const, hint: "this sprint", size: "lg" as const, badge: "Sprint", badgeTone: "info" as const },
  { label: "Blocked", value: "1", delta: "0", trend: "flat" as const, hint: "need owner", size: "lg" as const, badge: "At risk", badgeTone: "danger" as const },
  { label: "Ready", value: "1", delta: "+1", trend: "up" as const, hint: "to ship", size: "lg" as const, badge: "Ship", badgeTone: "brand" as const },
];

export const WEEKLY_USERS: ChartDatum[] = [
  { label: "Mon", value: 1280 },
  { label: "Tue", value: 1410 },
  { label: "Wed", value: 1320 },
  { label: "Thu", value: 1480 },
  { label: "Fri", value: 1360 },
  { label: "Sat", value: 1440 },
  { label: "Sun", value: 1390 },
];

export const TASK_ROWS: DataTableRow[] = [
  {
    id: "launch-brief",
    task: { type: "file", label: "Launch brief" },
    owner: { type: "avatar", label: "Maya Chen", name: "Maya Chen" },
    status: { type: "badge", label: "In review", tone: "warning" },
  },
  {
    id: "qa-checklist",
    task: { type: "file", label: "QA checklist" },
    owner: { type: "avatar", label: "Unassigned", name: "Unassigned" },
    status: { type: "badge", label: "Blocked", tone: "danger" },
  },
  {
    id: "release-notes",
    task: { type: "file", label: "Release notes" },
    owner: { type: "avatar", label: "Jordan Lee", name: "Jordan Lee" },
    status: { type: "badge", label: "Ready", tone: "success" },
  },
  {
    id: "support-macros",
    task: { type: "file", label: "Support macros" },
    owner: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera" },
    status: { type: "badge", label: "In progress", tone: "info" },
  },
];
