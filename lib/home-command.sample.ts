import type { AgentFleetAgent, AgentFleetSubAgentStatus, PermissionScope, SideNavItemData } from "agentic-ds-kit";

/**
 * Example data for the landing page hero: the Command screen of a made-up "northwind" workspace,
 * with several agents at work and one standing-access request. Fake names and numbers.
 */

/** A short rail: where you are and the few places an agent's work lives. */
export const COMMAND_NAV: SideNavItemData[] = [
  { id: "home", label: "Home", icon: "House" },
  { id: "command", label: "Command", icon: "Activity", active: true },
  { id: "inbox", label: "Inbox", icon: "Inbox", badge: "2" },
  { id: "runs", label: "Runs", icon: "Timer" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

/**
 * Two fleet cards: the billing agent, whose third sub-agent finishes during the loop, and a
 * finished docs sweep. (With a single agent AgentFleet switches to its focus layout.)
 */
export function commandFleet(testsDone: boolean): AgentFleetAgent[] {
  const billing: AgentFleetSubAgentStatus[] = ["done", "done", testsDone ? "done" : "running", "waiting"];
  return [
    {
      id: "billing",
      name: "Billing refactor",
      status: "running",
      cost: testsDone ? "$1.34" : "$1.28",
      elapsed: testsDone ? "6m 52s" : "6m 40s",
      subAgents: [
        { id: "scan", name: "scan-codebase", status: billing[0] },
        { id: "edit", name: "edit-invoice", status: billing[1] },
        { id: "tests", name: "write-tests", status: billing[2] },
        { id: "migrate", name: "migrate-db", status: billing[3] },
      ],
    },
    {
      id: "docs",
      name: "Docs sweep",
      status: "done",
      cost: "$0.18",
      elapsed: "4m 02s",
      subAgents: [
        { id: "crawl", name: "crawl-pages", status: "done" },
        { id: "diff", name: "diff-changes", status: "done" },
        { id: "summary", name: "write-summary", status: "done" },
      ],
    },
  ];
}

export const COMMAND_PERMISSION_DESCRIPTION = "Billing agent wants to send the weekly digest on every run, without asking again.";

export const COMMAND_PERMISSION_WARNING = "Standing access. Revoke any time in Settings.";

export const COMMAND_PERMISSION_SCOPES: PermissionScope[] = [
  {
    id: "mail",
    resource: "Send email as finance@northwind.example",
    access: "write",
    icon: "Mail",
    reason: "Post the weekly invoice digest to finance.",
    expiry: "No expiry",
  },
];
