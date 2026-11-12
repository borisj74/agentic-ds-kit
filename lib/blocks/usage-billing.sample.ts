import type { UsageBillingAllowance, UsageBillingInvoice, UsageBillingPlan, UsageListItem } from "agentic-ds-kit";

/** Sample account for the UsageBilling docs: a Pro workspace late in its billing period. */
export const USAGE_PLAN: UsageBillingPlan = {
  name: "Pro",
  price: "$49",
  priceNote: "per month · billed monthly · 5 seats",
  nextCharge: "$49.00 on 1 Dec",
  paymentMethod: "Visa ending 4242",
  upgradeTo: "Team",
};

const DAILY = [210, 260, 240, 310, 290, 180, 150, 330, 360, 340, 410, 390, 220, 190];

export const USAGE_ALLOWANCE: UsageBillingAllowance = {
  title: "AI credits · Pro plan",
  used: 8120,
  limit: 10000,
  unit: "credits",
  periodStart: "Nov 1",
  resetLabel: "resets Dec 1",
  categories: [
    { id: "agents", label: "Agent runs", value: 4870 },
    { id: "chat", label: "Chat", value: 2140 },
    { id: "search", label: "Search and embeddings", value: 1110 },
  ],
  daily: DAILY,
  dailyLabels: DAILY.map((_, i) => `Nov ${i + 1}`),
  warnAt: 0.8,
  paceNote: "At this pace you reach the limit around Nov 20, 11 days before it resets.",
};

export const USAGE_LIMITS: UsageListItem[] = [
  { id: "seats", label: "Seats", used: 5, limit: 5, note: "Add seats on Team" },
  { id: "projects", label: "Projects", used: 14, limit: 25 },
  { id: "storage", label: "File storage", used: 42.5, limit: 50, unit: "GB" },
  { id: "runs", label: "Concurrent agent runs", used: 2, limit: 5 },
];

export const USAGE_INVOICES: UsageBillingInvoice[] = [
  { id: "inv-0117", number: "INV-2026-0117", date: "1 Nov 2026", amount: "$49.00", status: "open" },
  { id: "inv-0102", number: "INV-2026-0102", date: "1 Oct 2026", amount: "$49.00", status: "paid" },
  { id: "inv-0088", number: "INV-2026-0088", date: "1 Sep 2026", amount: "$63.40", status: "paid" },
  { id: "inv-0071", number: "INV-2026-0071", date: "1 Aug 2026", amount: "$49.00", status: "paid" },
  { id: "inv-0056", number: "INV-2026-0056", date: "1 Jul 2026", amount: "$29.00", status: "paid" },
  { id: "inv-0040", number: "INV-2026-0040", date: "1 Jun 2026", amount: "$29.00", status: "paid" },
];
