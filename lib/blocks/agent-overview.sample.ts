import type { AgentOverviewAgent, AgentOverviewEvent } from "agentic-ds-kit";

const MINUTE = 60_000;

/** Sample agents for the AgentOverview docs: Northwind's billing agents during November close. */
export const AGENT_OVERVIEW_AGENTS: AgentOverviewAgent[] = [
  { id: "reconciler", name: "Invoice reconciler", model: "Sonnet 5.5", icon: "CreditCard", now: "Waiting on you · request above", cost: "$0.18" },
  { id: "tax", name: "Tax checker", model: "Haiku 5.5", icon: "ClipboardList", now: "Rate lookup timed out · 3 of 44 invoices", cost: "$0.31" },
  {
    id: "dunning",
    name: "Dunning agent",
    model: "Sonnet 5.5",
    icon: "Mail",
    now: "Step 3 of 5 · reminder 2 to 14 accounts",
    cost: "$0.42",
  },
  { id: "credits", name: "Credit note drafter", model: "Haiku 5.5", icon: "FileText", now: "6 credit notes drafted · $1,140.00", cost: "$0.09" },
];

/**
 * A fixed "now" for the sample (any date works: every time in it is relative). Fixed so the
 * server and the browser render the same block without a hydration mismatch.
 */
export const SAMPLE_NOW = Date.UTC(2026, 10, 28, 9, 42);

/** The time of the person's last visit in the sample: 2h 12m before now. */
export function sampleSince(now: number) {
  return now - 132 * MINUTE;
}

/** Events relative to `now`, so the sample looks live whenever the page is opened. */
export function agentOverviewEvents(now: number): AgentOverviewEvent[] {
  const at = (minutesAgo: number) => now - minutesAgo * MINUTE;
  return [
    {
      id: "dun-1",
      agentId: "dunning",
      title: "Reminder 1 sent to 14 accounts",
      status: "done",
      start: at(100),
      end: at(97),
      summary: ["$38,906.20 outstanding"],
    },
    { id: "cn-1", agentId: "credits", title: "6 credit notes drafted", status: "done", start: at(38), end: at(30), summary: ["$1,140.00"] },
    {
      id: "tax-1",
      agentId: "tax",
      title: "Tax rate lookup timed out",
      status: "failed",
      start: at(10),
      end: at(4),
      summary: ["3 WA invoices", "INV-1851, INV-1853, INV-1858"],
    },
    {
      id: "rec-1",
      agentId: "reconciler",
      title: "8 invoices matched to po_1Q8",
      status: "done",
      start: at(6),
      end: at(2),
      summary: ["$10,062.00 applied"],
    },
    {
      id: "rec-2",
      agentId: "reconciler",
      title: "Stripe payout po_1Q8 paid $12,480.00. The last $2,418.00 equals Northwind's INV-1842, which is past due.",
      status: "waiting",
      start: at(1),
      ask: "Apply $2,418.00 to INV-1842",
      risk: "medium",
      action: {
        kind: "command",
        command: "billing apply-payment po_1Q8 --invoice INV-1842 --amount 2418.00",
        note: "marks INV-1842 paid · stops dunning for Northwind · reversible for 30 days",
        target: "Northwind",
      },
    },
    { id: "dun-2", agentId: "dunning", title: "Reminder 2 to 14 accounts", status: "running", start: at(20), summary: ["step 3 of 5"] },
  ];
}
