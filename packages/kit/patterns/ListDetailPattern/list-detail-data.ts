/** Demo data for ListDetailPattern. Replace with your own records. */
import type { BadgeTone } from "../../ui/Badge";

export interface ListDetailItem {
  id: string;
  name: string;
  owner: string;
  status: string;
  statusTone: BadgeTone;
  updated: string;
  body: string;
}

export const PROJECTS: ListDetailItem[] = [
  {
    id: "launch-brief",
    name: "Launch brief",
    owner: "Maya Chen",
    status: "In review",
    statusTone: "warning",
    updated: "2h ago",
    body: "Two notes on positioning. Close them before the freeze so copy can lock.",
  },
  {
    id: "qa-checklist",
    name: "QA checklist",
    owner: "Unassigned",
    status: "Blocked",
    statusTone: "danger",
    updated: "4h ago",
    body: "No owner for 2 days. Assign someone before Thursday's review.",
  },
  {
    id: "release-notes",
    name: "Release notes",
    owner: "Jordan Lee",
    status: "Ready",
    statusTone: "success",
    updated: "Yesterday",
    body: "Changelog is drafted. Confirm the known-issues list before we tag.",
  },
  {
    id: "support-macros",
    name: "Support macros",
    owner: "Alex Rivera",
    status: "In progress",
    statusTone: "info",
    updated: "5h ago",
    body: "Refund and delay macros are drafted. Escalation paths still need a pass.",
  },
];
