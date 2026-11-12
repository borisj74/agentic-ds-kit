import type { DataTableColumn, DataTableRow, KpiBoardMetric, KpiBoardRange } from "agentic-ds-kit";

/** Sample analytics for the KpiBoard docs: a B2B SaaS, four KPIs over three ranges. */
export const KPI_RANGES: KpiBoardRange[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

type Range = "7d" | "30d" | "90d";
type Datum = { label: string; value: number };

const RANGE_KEYS: Range[] = ["7d", "30d", "90d"];

const POINTS: Record<Range, string[]> = {
  "7d": ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"],
  "30d": Array.from({ length: 30 }, (_, i) =>
    new Date(Date.UTC(2026, 9, 14 + i)).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
  ),
  "90d": Array.from({ length: 13 }, (_, i) => `W${32 + i}`),
};

/** A steady trend with a weekly wave, so the lines look like real traffic, the same on every load. */
function wave(range: Range, base: number, growth: number, swing: number, digits = 0): Datum[] {
  const labels = POINTS[range];
  const step = 10 ** digits;
  return labels.map((label, i) => {
    const t = i / Math.max(1, labels.length - 1);
    const weekly = range === "90d" ? Math.sin(i * 1.3) * 0.4 : Math.sin((i / 7) * Math.PI * 2 + 0.8);
    return { label, value: Math.round((base * (1 + growth * t) + swing * weekly) * step) / step };
  });
}

const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const byNumber = (key: string) => (row: DataTableRow) => Number(String(row[key]).replace(/[^0-9.-]/g, ""));

/** Rough size of each range against 30 days. */
const SCALE: Record<Range, number> = { "7d": 0.24, "30d": 1, "90d": 2.9 };

const CUSTOMERS: [string, string, number, string][] = [
  ["Northwind Traders", "Enterprise", 9840, "+18%"],
  ["Globex", "Business", 7310, "+6%"],
  ["Initech", "Business", 5920, "−4%"],
  ["Umbrella Health", "Enterprise", 5400, "+31%"],
  ["Hooli", "Pro", 3180, "+2%"],
  ["Vandelay Imports", "Pro", 2760, "+9%"],
  ["Stark Logistics", "Pro", 1940, "−12%"],
];

const PAGES: [string, number, string][] = [
  ["/dashboard", 6120, "+8%"],
  ["/reports/revenue", 3480, "+21%"],
  ["/agents", 2960, "+44%"],
  ["/settings/billing", 1210, "−3%"],
  ["/integrations", 980, "+5%"],
  ["/docs/api", 760, "+12%"],
];

const CHANNELS: [string, number, string, string][] = [
  ["Organic search", 184, "5.8%", "+0.6 pt"],
  ["Partner referrals", 42, "9.1%", "+1.2 pt"],
  ["Paid search", 112, "3.2%", "−0.4 pt"],
  ["Product Hunt", 61, "4.4%", "+2.0 pt"],
  ["Newsletter", 38, "6.7%", "+0.1 pt"],
];

const CHURN: [string, number, string, string][] = [
  ["Pro · monthly", 14, "2.1%", "Price"],
  ["Starter", 9, "3.4%", "Switched tool"],
  ["Pro · annual", 3, "0.6%", "Team left"],
  ["Business", 2, "0.4%", "Budget"],
];

function rowsFor(range: Range): Record<string, DataTableRow[]> {
  const s = SCALE[range];
  const users = range === "7d" ? 0.4 : range === "90d" ? 1.8 : 1;
  return {
    revenue: CUSTOMERS.map(([name, plan, amount, change], i) => ({ id: `c${i}`, name, plan, amount: money(Math.round(amount * s)), change })),
    users: PAGES.map(([page, count, change], i) => ({ id: `p${i}`, page, users: Math.round(count * users), change })),
    conversion: CHANNELS.map(([channel, trials, rate, change], i) => ({ id: `t${i}`, channel, trials: Math.max(1, Math.round(trials * s)), rate, change })),
    churn: CHURN.map(([plan, accounts, rate, reason], i) => ({ id: `x${i}`, plan, accounts: Math.max(1, Math.round(accounts * s)), rate, reason })),
  };
}

const revenueColumns: DataTableColumn[] = [
  { key: "name", header: "Customer", wrap: true },
  { key: "plan", header: "Plan", width: "7rem" },
  { key: "amount", header: "Revenue", type: "number", sortable: true, sortValue: byNumber("amount"), width: "7rem" },
  { key: "change", header: "Change", type: "number", width: "5.5rem" },
];

export const KPI_METRICS: KpiBoardMetric[] = [
  {
    id: "revenue",
    label: "Revenue",
    values: {
      "7d": { value: "$11.6k", delta: "+3.8%", trend: "up" },
      "30d": { value: "$48.2k", delta: "+12.4%", trend: "up" },
      "90d": { value: "$139k", delta: "+27.1%", trend: "up" },
    },
    columns: revenueColumns,
    rowsTitle: "Top customers",
    rankBy: "amount",
  },
  {
    id: "users",
    label: "Active users",
    values: {
      "7d": { value: "4,912", delta: "+1.2%", trend: "up" },
      "30d": { value: "12.4k", delta: "+4.1%", trend: "up" },
      "90d": { value: "21.7k", delta: "+9.6%", trend: "up" },
    },
    columns: [
      { key: "page", header: "Page", wrap: true },
      { key: "users", header: "Users", type: "number", sortable: true, width: "6rem" },
      { key: "change", header: "Change", type: "number", width: "5.5rem" },
    ],
    rowsTitle: "Top pages",
    rankBy: "users",
  },
  {
    id: "conversion",
    label: "Trial to paid",
    values: {
      "7d": { value: "4.6%", delta: "−0.3 pt", trend: "down" },
      "30d": { value: "5.1%", delta: "+0.4 pt", trend: "up" },
      "90d": { value: "4.8%", delta: "No change", trend: "flat" },
    },
    columns: [
      { key: "channel", header: "Channel", wrap: true },
      { key: "trials", header: "Trials", type: "number", sortable: true, width: "5.5rem" },
      { key: "rate", header: "Rate", type: "number", width: "5rem" },
      { key: "change", header: "Change", type: "number", width: "5.5rem" },
    ],
    rowsTitle: "Top channels",
    rankBy: "trials",
  },
  {
    id: "churn",
    label: "Churn",
    values: {
      "7d": { value: "0.4%", delta: "+0.1 pt", trend: "up", deltaTone: "danger" },
      "30d": { value: "1.2%", delta: "−0.3 pt", trend: "down", deltaTone: "success" },
      "90d": { value: "3.9%", delta: "−0.8 pt", trend: "down", deltaTone: "success" },
    },
    columns: [
      { key: "plan", header: "Plan", wrap: true },
      { key: "accounts", header: "Accounts", type: "number", sortable: true, width: "6rem" },
      { key: "rate", header: "Rate", type: "number", width: "5rem" },
      { key: "reason", header: "Top reason", wrap: true },
    ],
    rowsTitle: "Churn by plan",
    rankBy: "accounts",
  },
];

const SERIES_MAKERS: Record<string, (range: Range) => Datum[]> = {
  revenue: (r) => wave(r, r === "90d" ? 9400 : 1480, 0.25, r === "90d" ? 600 : 160),
  users: (r) => wave(r, r === "90d" ? 4700 : 3900, 0.12, r === "90d" ? 220 : 640),
  conversion: (r) => wave(r, 4.7, 0.08, 0.35, 1),
  churn: (r) => wave(r, 1.3, -0.2, 0.15, 2),
};

function byRange<T>(make: (range: Range) => T): Record<string, T> {
  return Object.fromEntries(RANGE_KEYS.map((range) => [range, make(range)]));
}

/** series[metricId][range] */
export const KPI_SERIES: Record<string, Record<string, Datum[]>> = Object.fromEntries(
  Object.entries(SERIES_MAKERS).map(([id, make]) => [id, byRange(make)]),
);

/** rows[metricId][range] */
export const KPI_ROWS: Record<string, Record<string, DataTableRow[]>> = Object.fromEntries(
  KPI_METRICS.map((metric) => [metric.id, byRange((range) => rowsFor(range)[metric.id])]),
);
