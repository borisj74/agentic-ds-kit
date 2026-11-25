/**
 * Demo data for DashboardPattern: a made-up subscription business (Northwind's billing home).
 * Replace it with your own. Every number on the screen comes from here, so the KPIs, the chart
 * titles, Needs attention, the overdue invoices and the sample chat answer always agree.
 */
import type { ChatMessage } from "../../ui/Chat";
import type { BadgeTone } from "../../ui/Badge";
import type { ListViewItem } from "../../ui/ListView";

export type DashboardPeriod = "30d" | "3m" | "12m";
export type DashboardGranularity = "daily" | "weekly" | "monthly";
export type DashboardMetricId = "mrr" | "collected" | "overdue" | "failed";

export const PERIODS: { value: DashboardPeriod; label: string; short: string }[] = [
  { value: "30d", label: "Last 30 days", short: "last 30 days" },
  { value: "3m", label: "Last 3 months", short: "last 3 months" },
  { value: "12m", label: "Last 12 months", short: "last 12 months" },
];

export const GRANULARITIES: { value: DashboardGranularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

/** Granularities that make sense for a period: no single-point monthly view of 30 days, no 365 daily points. */
export function granularitiesFor(period: DashboardPeriod): DashboardGranularity[] {
  if (period === "30d") return ["daily", "weekly"];
  if (period === "12m") return ["weekly", "monthly"];
  return ["daily", "weekly", "monthly"];
}

/** Today in the demo. Fixed so screenshots and tests do not drift. */
const END = new Date(Date.UTC(2026, 10, 20));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;

/** Axis labels, oldest first, for a period and granularity. */
export function labelsFor(period: DashboardPeriod, granularity: DashboardGranularity): string[] {
  const days = period === "30d" ? 30 : period === "3m" ? 91 : 364;
  if (granularity === "monthly") {
    const count = period === "3m" ? 3 : 12;
    return Array.from({ length: count }, (_, i) => MONTHS[(END.getUTCMonth() - (count - 1 - i) + 12) % 12]);
  }
  const step = granularity === "weekly" ? 7 : 1;
  const count = Math.round(days / step);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(END);
    d.setUTCDate(END.getUTCDate() - (count - 1 - i) * step);
    return dayLabel(d);
  });
}

/** prev = start of the previous period, start = start of this period, end = today. */
type Span = { prev: number; start: number; end: number };

const SPANS: Record<DashboardPeriod, { mrr: Span; subscribers: Span; churn: Span }> = {
  "30d": { mrr: { prev: 384100, start: 398200, end: 412600 }, subscribers: { prev: 3371, start: 3412, end: 3486 }, churn: { prev: 2.6, start: 2.4, end: 2.1 } },
  "3m": { mrr: { prev: 338200, start: 371900, end: 412600 }, subscribers: { prev: 3190, start: 3298, end: 3486 }, churn: { prev: 2.9, start: 2.6, end: 2.1 } },
  "12m": { mrr: { prev: 214900, start: 286400, end: 412600 }, subscribers: { prev: 2410, start: 2905, end: 3486 }, churn: { prev: 3.4, start: 3.0, end: 2.1 } },
};

/**
 * A smooth path from `from` to `to` over `count` points with a small repeatable wobble that is zero
 * at both ends, so the first and last values are exact.
 */
function path(from: number, to: number, count: number, wobble: number, seed: number): number[] {
  if (count === 1) return [to];
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const ease = t * t * (3 - 2 * t) * 0.35 + t * 0.65;
    const bump = Math.sin(t * Math.PI) * Math.sin((i + seed) * 1.7) * wobble;
    return from + (to - from) * ease + bump * Math.abs(to - from || from * 0.05);
  });
}

const round = (value: number, step: number) => Math.round(value / step) * step;

export interface MetricSeries {
  current: number[];
  previous: number[];
}

/** MRR for a period and granularity (one point per label). The plan stack and top plans build on it. */
function mrrSeriesFor(period: DashboardPeriod, granularity: DashboardGranularity): MetricSeries {
  const n = labelsFor(period, granularity).length;
  const span = SPANS[period].mrr;
  return {
    current: path(span.start, span.end, n, 0.06, 1).map((v) => round(v, 100)),
    previous: path(span.prev, span.start, n, 0.06, 4).map((v) => round(v, 100)),
  };
}

/**
 * The four KPIs' headline numbers. Collected is the trailing 30 days of payments, Overdue the
 * open overdue balance, Failed payments the amount still waiting on a retry. Fixed for every
 * period: they are today's numbers, and the period only changes how far back the chart reaches.
 */
const KPI = {
  collected: { start: 241800, end: 286400, prevStart: 228600, goal: 300000 },
  overdue: { start: 36200, end: 48920, prevStart: 31400, limit: 40000, count: 14 },
  failed: { start: 3900, end: 1670, prevStart: 2600, limit: 2500, count: 3 },
};

/** Every KPI's series for a period and granularity, oldest first, ending at today's number. */
export function seriesFor(period: DashboardPeriod, granularity: DashboardGranularity): Record<DashboardMetricId, MetricSeries> {
  const n = labelsFor(period, granularity).length;
  return {
    mrr: mrrSeriesFor(period, granularity),
    collected: {
      current: path(KPI.collected.start, KPI.collected.end, n, 0.08, 2).map((v) => round(v, 100)),
      previous: path(KPI.collected.prevStart, KPI.collected.start, n, 0.08, 5).map((v) => round(v, 100)),
    },
    overdue: {
      current: path(KPI.overdue.start, KPI.overdue.end, n, 0.12, 3).map((v) => round(v, 10)),
      previous: path(KPI.overdue.prevStart, KPI.overdue.start, n, 0.12, 6).map((v) => round(v, 10)),
    },
    failed: {
      current: path(KPI.failed.start, KPI.failed.end, n, 0.2, 7).map((v) => round(v, 10)),
      previous: path(KPI.failed.prevStart, KPI.failed.start, n, 0.2, 8).map((v) => round(v, 10)),
    },
  };
}

export const money = (value: number) => {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
};
export const moneyFull = (value: number) => `${value < 0 ? "-" : ""}$${Math.round(Math.abs(value)).toLocaleString("en-US")}`;
export const count = (value: number) => Math.round(value).toLocaleString("en-US");
export const percent = (value: number) => `${value.toFixed(1)}%`;
const signed = (text: string, value: number) => (value > 0 ? `+${text}` : text);

export interface DashboardMetric {
  id: DashboardMetricId;
  label: string;
  /** Shown on the tile. */
  value: string;
  /** Delta Badge text, e.g. +3.4%. */
  delta: string;
  /** Badge tone: good change success, bad change danger, none neutral. */
  deltaTone: BadgeTone;
  /** Small trend on the tile, oldest first. */
  sparkline: number[];
  /** Main chart: this period, and the previous period dashed when compare is on. */
  series: MetricSeries;
  /** Dashed reference on the main chart, and which side counts as past it. */
  reference: { value: number; label: string; highlight: "above" | "below" };
  /** Axis and tooltip format. */
  format: (value: number) => string;
  /** The question the main chart answers when this metric is picked. */
  question: string;
}

const last = (values: number[]) => values[values.length - 1] ?? 0;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** What each KPI's change compares to, per period (the Scorecard hint). */
export function hintFor(id: DashboardMetricId, period: DashboardPeriod): string {
  switch (id) {
    case "mrr":
      return period === "30d" ? "vs Oct 21" : period === "3m" ? "vs Aug–Oct" : "vs Nov 2025";
    case "collected":
      return "vs Oct, same day";
    case "overdue":
      return "vs Oct 31";
    case "failed":
      return "vs Oct";
  }
}

/** The four KPI tiles for a period and granularity: MRR, Collected, Overdue and Failed payments. */
export function metricsFor(period: DashboardPeriod, granularity: DashboardGranularity): DashboardMetric[] {
  const s = seriesFor(period, granularity);
  const span = SPANS[period];
  const mrrDelta = ((span.mrr.end - span.mrr.start) / span.mrr.start) * 100;
  const mrrTarget = 420000;
  return [
    {
      id: "mrr",
      label: "MRR",
      value: money(span.mrr.end),
      delta: signed(`${mrrDelta.toFixed(1)}%`, mrrDelta),
      deltaTone: mrrDelta >= 0 ? "success" : "danger",
      sparkline: s.mrr.current,
      series: s.mrr,
      reference: { value: mrrTarget, label: `Target ${money(mrrTarget)}`, highlight: "above" },
      format: money,
      question: "Is recurring revenue on track for the target?",
    },
    {
      id: "collected",
      label: "Collected in November",
      value: money(KPI.collected.end),
      delta: "+4.2%",
      deltaTone: "success",
      sparkline: s.collected.current,
      series: s.collected,
      reference: { value: KPI.collected.goal, label: `Goal ${money(KPI.collected.goal)}`, highlight: "above" },
      format: money,
      question: "Are payments coming in as fast as last month?",
    },
    {
      id: "overdue",
      label: `Overdue · ${KPI.overdue.count} invoices`,
      value: money(KPI.overdue.end),
      delta: "+$6.1k",
      // More overdue is bad.
      deltaTone: "danger",
      sparkline: s.overdue.current,
      series: s.overdue,
      reference: { value: KPI.overdue.limit, label: `Limit ${money(KPI.overdue.limit)}`, highlight: "above" },
      format: money,
      question: "How much is past its due date?",
    },
    {
      id: "failed",
      label: `Failed payments · ${KPI.failed.count}`,
      value: money(KPI.failed.end),
      delta: "2 fewer",
      // Fewer failed payments is good.
      deltaTone: "success",
      sparkline: s.failed.current,
      series: s.failed,
      reference: { value: KPI.failed.limit, label: `Limit ${money(KPI.failed.limit)}`, highlight: "above" },
      format: money,
      question: "How much is waiting on a payment retry?",
    },
  ];
}

export const MOVEMENT_KEYS = [
  { key: "new", label: "New" },
  { key: "expansion", label: "Expansion" },
  { key: "contraction", label: "Contraction" },
  { key: "churned", label: "Churn" },
] as const;

export interface MovementRow {
  label: string;
  new: number;
  expansion: number;
  contraction: number;
  churned: number;
  net: number;
  [key: string]: string | number;
}

/**
 * MRR movements per bucket: weeks for 30 days, months otherwise. The nets add up to this period's
 * net new MRR, and each bucket's movements add up to its net.
 */
export function movementsFor(period: DashboardPeriod): MovementRow[] {
  const span = SPANS[period];
  const total = span.mrr.end - span.mrr.start;
  const buckets = period === "30d" ? labelsFor("30d", "weekly").slice(-4) : labelsFor(period, "monthly");
  const weights = buckets.map((_, i) => 1 + Math.sin(i * 2.1 + 0.4) * 0.25);
  const weightSum = sum(weights);
  let left = total;
  return buckets.map((label, i) => {
    const net = i === buckets.length - 1 ? left : round((total * weights[i]) / weightSum, 100);
    left -= net;
    const wiggle = Math.sin(i * 1.3) * 0.12;
    const expansion = round(net * (0.68 - wiggle / 2), 100);
    const contraction = -round(net * 0.33, 100);
    const churned = -round(net * (1.22 + wiggle), 100);
    const added = net - expansion - contraction - churned;
    return { label, new: added, expansion, contraction, churned, net };
  });
}

/** Totals of each movement over the period. */
export function movementTotals(period: DashboardPeriod) {
  const rows = movementsFor(period);
  return {
    new: sum(rows.map((r) => r.new)),
    expansion: sum(rows.map((r) => r.expansion)),
    contraction: sum(rows.map((r) => r.contraction)),
    churned: sum(rows.map((r) => r.churned)),
    net: sum(rows.map((r) => r.net)),
  };
}

export const PLANS = ["Starter", "Growth", "Scale", "Enterprise"] as const;

/** MRR by plan over the main chart's labels; the four add up to MRR. Scale gains share over time. */
export function planSeriesFor(period: DashboardPeriod, granularity: DashboardGranularity) {
  const mrr = mrrSeriesFor(period, granularity).current;
  return PLANS.map((plan, p) => ({
    label: plan,
    data: mrr.map((total, i) => {
      const t = mrr.length > 1 ? i / (mrr.length - 1) : 1;
      const shares = [0.16 - 0.03 * t, 0.34 - 0.01 * t, 0.28 + 0.03 * t, 0.22 + 0.01 * t];
      return round(total * shares[p], 100);
    }),
  }));
}

/** Top plans by MRR today. */
export function topPlansFor(period: DashboardPeriod, granularity: DashboardGranularity) {
  return planSeriesFor(period, granularity).map((plan) => ({ label: plan.label, value: last(plan.data) }));
}

/** Share of each signup month's accounts still paying, by months since signup. */
export const RETENTION = (() => {
  const rows = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const columns = ["M0", "M1", "M2", "M3", "M4", "M5"];
  const data: { row: string; column: string; value: number }[] = [];
  rows.forEach((row, r) => {
    const age = rows.length - 1 - r;
    columns.forEach((column, c) => {
      if (c > age) return;
      const value = c === 0 ? 100 : Math.round(100 * Math.pow(0.93 + r * 0.006, c) - c * 0.6);
      data.push({ row, column, value });
    });
  });
  return { rows, columns, data };
})();

export interface OverdueInvoice {
  id: string;
  customer: string;
  invoice: string;
  /** Due date as shown, e.g. Nov 1. */
  due: string;
  /** Sort key for Due: the day of November. */
  dueDay: number;
  daysLate: number;
  amount: number;
}

/** The overdue balance in total. The table shows its oldest invoices. */
export const OVERDUE = { count: KPI.overdue.count, total: KPI.overdue.end };

/** The oldest overdue invoices, oldest first. */
export const OVERDUE_INVOICES: OverdueInvoice[] = [
  { id: "inv-1821", customer: "Pinecrest Clinics", invoice: "INV-1821", due: "Nov 1", dueDay: 1, daysLate: 20, amount: 14700 },
  { id: "inv-1842", customer: "Northwind Traders", invoice: "INV-1842", due: "Nov 4", dueDay: 4, daysLate: 17, amount: 2418 },
  { id: "inv-1838", customer: "Kettle Analytics", invoice: "INV-1838", due: "Nov 8", dueDay: 8, daysLate: 13, amount: 6540 },
  { id: "inv-1850", customer: "Brightline Studio", invoice: "INV-1850", due: "Nov 12", dueDay: 12, daysLate: 9, amount: 1920 },
  { id: "inv-1853", customer: "Hollis & Grey", invoice: "INV-1853", due: "Nov 15", dueDay: 15, daysLate: 6, amount: 2160 },
];

/** Amounts to the cent, as invoices show them. */
export const cents = (value: number) =>
  `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Needs attention: payments and cards that need a person today. The icon and the reason carry the status. */
export const NEEDS_ATTENTION: ListViewItem[] = [
  { id: "f1", primary: "Ostrava Bikes", secondary: "Declined twice", icon: "CircleX", value: cents(890), group: "failed" },
  { id: "f2", primary: "Lumen Yoga", secondary: "Bank asked to verify", icon: "CircleX", value: cents(470), group: "failed" },
  { id: "f3", primary: "Fernway Tours", secondary: "Insufficient funds", icon: "CircleX", value: cents(310), group: "failed" },
  { id: "e1", primary: "Marlow Dental", secondary: "Expires Nov 30", icon: "Clock", value: cents(1450), group: "expiring" },
  { id: "e2", primary: "Quarry Coffee", secondary: "Expires Dec 4", icon: "Clock", value: cents(260), group: "expiring" },
];

export const NEEDS_ATTENTION_GROUPS = [
  { id: "failed", label: "Failed payments · 3" },
  { id: "expiring", label: "Cards expiring · 2" },
];

/** On a phone the expiring cards fold into one row; failed payments stay as rows because each needs a decision. */
export const NEEDS_ATTENTION_FOLDED: ListViewItem[] = [
  ...NEEDS_ATTENTION.filter((item) => item.group === "failed").map((item) => ({ ...item, group: undefined })),
  { id: "expiring", primary: "2 cards expiring", secondary: "Marlow Dental, Quarry Coffee", icon: "Clock", value: cents(1450 + 260) },
];

/** Work panel: what changed since Monday, newest first. */
export const CHANGES: ListViewItem[] = [
  { id: "c1", primary: "Growth added 18 subscribers", secondary: "Most came from the annual offer", dot: "success", meta: "2h ago" },
  { id: "c2", primary: "Three payments failed on Growth", secondary: "Retries run on Friday", dot: "warning", meta: "Yesterday" },
  { id: "c3", primary: "Kettle Analytics asked to cancel", secondary: "$2,180 MRR, renews Dec 1", dot: "danger", meta: "Tue" },
  { id: "c4", primary: "Starter price change went live", secondary: "New signups only", dot: "neutral", meta: "Mon" },
];

/** The insight line's numbers for a period. */
export function insightFor(period: DashboardPeriod) {
  const span = SPANS[period];
  const totals = movementTotals(period);
  return {
    periodLabel: PERIODS.find((p) => p.value === period)?.short ?? "",
    netNew: money(span.mrr.end - span.mrr.start),
    driver: money(totals.new),
    churnFrom: percent(span.churn.start),
    churnTo: percent(span.churn.end),
  };
}

/** Three suggested questions for the empty chat. */
export const SUGGESTIONS = ["What drove MRR this period?", "Which invoices are overdue?", "How is retention trending?"];

/** The answer to a suggested question, built from the same numbers the dashboard shows. */
export function answerFor(question: string, period: DashboardPeriod): string {
  const span = SPANS[period];
  const totals = movementTotals(period);
  const i = insightFor(period);
  if (question === SUGGESTIONS[0]) {
    return `MRR went from ${money(span.mrr.start)} to ${money(span.mrr.end)} over the ${i.periodLabel}, so net new MRR was ${i.netNew}. New subscriptions brought in ${money(totals.new)} and expansion ${money(totals.expansion)}, while churn took ${money(Math.abs(totals.churned))} and contraction ${money(Math.abs(totals.contraction))}.`;
  }
  if (question === SUGGESTIONS[1]) {
    const top = OVERDUE_INVOICES[0];
    return `${OVERDUE.count} invoices are overdue, ${cents(OVERDUE.total)} in all. The oldest is ${top.invoice} for ${top.customer}, ${cents(top.amount)} and ${top.daysLate} days late. Three failed payments retry on Friday.`;
  }
  if (question === SUGGESTIONS[2]) {
    return `Churn fell from ${i.churnFrom} to ${i.churnTo}. In the cohort table, accounts that signed up in June keep ${RETENTION.data.find((d) => d.row === "Jun" && d.column === "Month 5")?.value}% after five months.`;
  }
  return "This example only answers the suggested questions. In your app, send the message and the card's context to your assistant.";
}

/** One finished exchange for the "chat open" screen. */
export function sampleExchange(period: DashboardPeriod): ChatMessage[] {
  return [
    { id: "q1", role: "user", content: SUGGESTIONS[0], timestamp: "09:42" },
    { id: "a1", role: "assistant", content: answerFor(SUGGESTIONS[0], period), timestamp: "09:42" },
  ];
}
