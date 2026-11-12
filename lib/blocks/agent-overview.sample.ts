import type { AgentOverviewAgent, AgentOverviewEvent } from "agentic-ds-kit";

const MINUTE = 60_000;

/** Sample fleet for the AgentOverview docs: five agents over the last two hours. */
export const AGENT_OVERVIEW_AGENTS: AgentOverviewAgent[] = [
  { id: "planner", name: "Planner", model: "Opus 5.5", icon: "ListTree" },
  { id: "billing", name: "Billing refactor", model: "Sonnet 5.5", icon: "Code" },
  { id: "tests", name: "Test runner", model: "Haiku 5.5", icon: "FlaskConical" },
  { id: "migrations", name: "Migrations", model: "Sonnet 5.5", icon: "Database" },
  { id: "docs", name: "Docs writer", model: "Haiku 5.5", icon: "FileText" },
];

/** The time of the person's last visit in the sample. */
export function sampleSince(now: number) {
  return now - 2 * 60 * MINUTE;
}

/** Events relative to `now`, so the sample looks live whenever the page is opened. */
export function agentOverviewEvents(now: number): AgentOverviewEvent[] {
  const at = (minutesAgo: number) => now - minutesAgo * MINUTE;
  return [
    { id: "plan-1", agentId: "planner", title: "Split the invoicing epic", status: "done", start: at(112), end: at(96), handoffTo: "bill-1", summary: ["6 tasks", "2 for Billing refactor"] },
    { id: "bill-1", agentId: "billing", title: "Extract tax rules", status: "done", start: at(94), end: at(61), summary: ["14 files", "+412 −388"] },
    { id: "test-1", agentId: "tests", title: "Unit suite", status: "done", start: at(60), end: at(52) },
    { id: "plan-2", agentId: "planner", title: "Order the release", status: "done", start: at(48), end: at(40) },
    {
      id: "test-2",
      agentId: "tests",
      title: "Checkout E2E suite",
      status: "failed",
      start: at(26),
      end: at(19),
      summary: ["3 of 48 specs failed", "checkout › applies a coupon: timed out after 30s"],
    },
    { id: "bill-2", agentId: "billing", title: "Rewrite invoice totals", status: "running", start: at(27), summary: ["src/billing/totals.ts", "step 6 of 9"] },
    {
      id: "mig-1",
      agentId: "migrations",
      title: "Drop legacy invoice columns",
      status: "waiting",
      start: at(9),
      ask: "Run 0042_drop_legacy.sql on staging?",
      risk: "high",
      action: {
        kind: "command",
        command: "npm run db:migrate -- --env staging",
        note: "applies 2 migrations · drops 3 columns",
        target: "acme / staging",
      },
    },
    { id: "docs-1", agentId: "docs", title: "Changelog for 0.19", status: "done", start: at(70), end: at(58) },
    { id: "docs-2", agentId: "docs", title: "Publish changelog", status: "waiting", start: at(4), ask: "Publish the 0.19 changelog to the docs site?" },
    { id: "plan-3", agentId: "planner", title: "Draft the next sprint", status: "running", start: at(12) },
  ];
}
