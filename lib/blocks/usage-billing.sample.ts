import type {
  UsageBillingAllowance,
  UsageBillingInvoice,
  UsageBillingPlan,
  UsageBillingUpcoming,
  UsageListItem,
} from "agentic-ds-kit";

/** Sample account for the UsageBilling docs: Northwind on Business, over its AI credit limit late in November. */
export const USAGE_PLAN: UsageBillingPlan = {
  name: "Business",
  price: "$702.00",
  priceNote: "a month · 18 seats × $39.00",
  nextCharge: "$901.92 on 1 Dec",
  paymentMethod: "Visa ending 4242",
  upgradeTo: "Scale",
  fit: "Scale covers this month with 13,760 credits spare, for $360.00 more a month",
};

const DAILY = [310, 360, 420, 390, 450, 280, 240, 470, 510, 490, 560, 530, 330, 300, 520, 580, 610, 590, 540, 620, 640];

export const USAGE_ALLOWANCE: UsageBillingAllowance = {
  title: "AI credits · Business plan",
  used: 11240,
  limit: 10000,
  unit: "credits",
  periodStart: "1 Nov",
  resetLabel: "resets 1 Dec",
  categories: [
    { id: "chat", label: "Chat", value: 6120 },
    { id: "agents", label: "Agents", value: 3880 },
    { id: "search", label: "Search", value: 1240 },
  ],
  daily: DAILY,
  dailyLabels: DAILY.map((_, i) => `${i + 1} Nov`),
  overage: { rateLabel: "$4.00 per 100 credits", amount: "$49.60" },
};

/** The next invoice, shown as an estimate until the period closes. */
export const USAGE_UPCOMING: UsageBillingUpcoming = {
  number: "INV-1886",
  to: "Northwind Traders",
  issuedOn: "1 Dec 2026",
  period: "1–30 Nov 2026",
  lines: [
    { id: "plan", description: "Business plan · Nov 2026", quantity: 18, unitPrice: "$39.00", amount: "$702.00" },
    { id: "overage", description: "AI credits over allowance", quantity: 1240, unitPrice: "$0.04", amount: "$49.60" },
  ],
  subtotal: "$751.60",
  taxLabel: "VAT 20%",
  tax: "$150.32",
  total: "$901.92",
  footnote: "Estimate as of 21 Nov, changes with usage until 30 Nov",
};

export const USAGE_LIMITS: UsageListItem[] = [
  { id: "api", label: "API calls", used: 84200, limit: 100000 },
  { id: "seats", label: "Seats", used: 18, limit: 20 },
  { id: "storage", label: "Storage", used: 32, limit: 50, unit: "GB" },
];

export const USAGE_INVOICES: UsageBillingInvoice[] = [
  { id: "inv-1842", number: "INV-1842", date: "1 Nov 2026", amount: "$889.68", status: "issued" },
  { id: "inv-1797", number: "INV-1797", date: "1 Oct 2026", amount: "$842.40", status: "paid" },
  { id: "inv-1751", number: "INV-1751", date: "1 Sep 2026", amount: "$842.40", status: "paid" },
  { id: "inv-1706", number: "INV-1706", date: "1 Aug 2026", amount: "$842.40", status: "paid" },
  { id: "inv-1660", number: "INV-1660", date: "1 Jul 2026", amount: "$795.60", status: "paid" },
];
