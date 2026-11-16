import type { AgentFleetAgent, AgentFleetSubAgentStatus, PermissionScope, SideNavGroup } from "agentic-ds-kit";

/**
 * Example data for the landing page hero: the Command screen of a made-up "northwind" workspace,
 * with several agents at work and one standing-access request. Fake names and numbers.
 */

export const COMMAND_NAV: SideNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "home", label: "Home", icon: "House" },
      { id: "invoices", label: "Invoices", icon: "FileText" },
      { id: "customers", label: "Customers", icon: "Users" },
      { id: "agents", label: "Agents", icon: "Bot" },
      { id: "usage", label: "Usage", icon: "ChartBar" },
      { id: "integrations", label: "Integrations", icon: "LayoutGrid" },
      { id: "settings", label: "Settings", icon: "Settings" },
    ],
  },
  {
    label: "Agents",
    items: [
      { id: "command", label: "Command", icon: "Activity", active: true },
      { id: "inbox", label: "Inbox", icon: "Inbox" },
      { id: "chat", label: "Chat", icon: "MessageSquare" },
      { id: "runs", label: "Runs", icon: "Timer" },
    ],
  },
];

/**
 * The three fleet cards. The billing card's third sub-agent finishes during the loop, so its
 * statuses come from `billingSubs`.
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
    {
      id: "flaky",
      name: "Flaky test hunt",
      status: "failed",
      cost: "$0.71",
      elapsed: "9m 15s",
      subAgents: [
        { id: "collect", name: "collect-runs", status: "done" },
        { id: "bisect", name: "bisect-commits", status: "done" },
        { id: "repro", name: "repro-checkout", status: "failed" },
        { id: "rerun", name: "rerun-suite", status: "running" },
        { id: "report", name: "write-report", status: "queued" },
      ],
    },
  ];
}

export const COMMAND_PERMISSION_DESCRIPTION =
  "Billing agent wants standing access, not a one-off action. It applies to every run until you revoke it or it expires.";

export const COMMAND_PERMISSION_WARNING =
  "Standing access. Every future run can send email without asking again. Revoke any time in Settings → Agents.";

export const COMMAND_PERMISSION_SCOPES: PermissionScope[] = [
  {
    id: "docs",
    resource: "~/northwind/invoices/docs",
    access: "read",
    icon: "Folder",
    reason: "Read the weekly invoice notes before writing the digest.",
    expiry: "Expires in 7 days",
  },
  {
    id: "mail",
    resource: "Send email as finance@northwind.example",
    access: "write",
    icon: "Mail",
    reason: "Post the weekly invoice digest to finance.",
    expiry: "No expiry",
  },
];
