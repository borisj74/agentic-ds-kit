/**
 * Demo data for DashboardPattern: a made-up subscription business ("revenue overview"). Replace
 * it with your own. Every number on the screen comes from here, so the insight line, the tiles,
 * the charts and the sample chat answer always agree.
 */
import type { ChatMessage } from "../../ui/Chat";
import type { BadgeTone } from "../../ui/Badge";
import type { ListViewItem } from "../../ui/ListView";

export type DashboardPeriod = "30d" | "3m" | "12m";
export type DashboardGranularity = "daily" | "weekly" | "monthly";
export type DashboardMetricId = "mrr" | "netNew" | "subscribers" | "churn" | "arpa";

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

/** Every metric's series for a period and granularity. Net new MRR is the change per bucket. */
export function seriesFor(period: DashboardPeriod, granularity: DashboardGranularity): Record<DashboardMetricId, MetricSeries> {
  const n = labelsFor(period, granularity).length;
  const span = SPANS[period];
  // One extra point so net new (the change per bucket) has n values.
  const mrrNow = path(span.mrr.start, span.mrr.end, n + 1, 0.06, 1).map((v) => round(v, 100));
  const mrrPrev = path(span.mrr.prev, span.mrr.start, n + 1, 0.06, 4).map((v) => round(v, 100));
  const subsNow = path(span.subscribers.start, span.subscribers.end, n, 0.05, 2).map(Math.round);
  const subsPrev = path(span.subscribers.prev, span.subscribers.start, n, 0.05, 5).map(Math.round);
  const churnNow = path(span.churn.start, span.churn.end, n, 0.35, 3).map((v) => round(v, 0.05));
  const churnPrev = path(span.churn.prev, span.churn.start, n, 0.35, 6).map((v) => round(v, 0.05));
  const diff = (values: number[]) => values.slice(1).map((v, i) => v - values[i]);
  const mrr = { current: mrrNow.slice(1), previous: mrrPrev.slice(1) };
  return {
    mrr,
    netNew: { current: diff(mrrNow), previous: diff(mrrPrev) },
    subscribers: { current: subsNow, previous: subsPrev },
    churn: { current: churnNow, previous: churnPrev },
    arpa: {
      current: mrr.current.map((v, i) => Math.round(v / subsNow[i])),
      previous: mrr.previous.map((v, i) => Math.round(v / subsPrev[i])),
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

const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);
const last = (values: number[]) => values[values.length - 1] ?? 0;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** The five tiles for a period and granularity. */
export function metricsFor(period: DashboardPeriod, granularity: DashboardGranularity): DashboardMetric[] {
  const s = seriesFor(period, granularity);
  const span = SPANS[period];
  const pct = (now: number, before: number) => ((now - before) / before) * 100;
  const netNow = span.mrr.end - span.mrr.start;
  const netBefore = span.mrr.start - span.mrr.prev;
  const arpaNow = span.mrr.end / span.subscribers.end;
  const arpaBefore = span.mrr.start / span.subscribers.start;
  const churnDelta = span.churn.end - span.churn.start;
  const mrrDelta = pct(span.mrr.end, span.mrr.start);
  const netDelta = pct(netNow, netBefore);
  const subsDelta = pct(span.subscribers.end, span.subscribers.start);
  const arpaDelta = pct(arpaNow, arpaBefore);
  const tone = (good: boolean, value: number): BadgeTone => (Math.abs(value) < 0.05 ? "neutral" : good ? "success" : "danger");
  const mrrTarget = period === "12m" ? 400000 : period === "3m" ? 400000 : 405000;
  return [
    {
      id: "mrr",
      label: "MRR",
      value: money(span.mrr.end),
      delta: signed(`${mrrDelta.toFixed(1)}%`, mrrDelta),
      deltaTone: tone(mrrDelta > 0, mrrDelta),
      sparkline: s.mrr.current,
      series: s.mrr,
      reference: { value: mrrTarget, label: `Target ${money(mrrTarget)}`, highlight: "above" },
      format: money,
      question: "Is recurring revenue on track for the target?",
    },
    {
      id: "netNew",
      label: "Net new MRR",
      value: money(netNow),
      delta: signed(`${netDelta.toFixed(1)}%`, netDelta),
      deltaTone: tone(netDelta > 0, netDelta),
      sparkline: s.netNew.current,
      series: s.netNew,
      reference: { value: Math.round(avg(s.netNew.previous)), label: `Last period avg ${money(avg(s.netNew.previous))}`, highlight: "above" },
      format: money,
      question: "Are we adding more revenue each period than before?",
    },
    {
      id: "subscribers",
      label: "Subscribers",
      value: count(span.subscribers.end),
      delta: signed(`${subsDelta.toFixed(1)}%`, subsDelta),
      deltaTone: tone(subsDelta > 0, subsDelta),
      sparkline: s.subscribers.current,
      series: s.subscribers,
      reference: { value: 3450, label: "Target 3,450", highlight: "above" },
      format: count,
      question: "How many paying accounts do we have?",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: percent(span.churn.end),
      delta: `${churnDelta > 0 ? "+" : ""}${churnDelta.toFixed(1)} pt`,
      // Churn going down is good.
      deltaTone: tone(churnDelta < 0, churnDelta),
      sparkline: s.churn.current,
      series: s.churn,
      reference: { value: 2.5, label: "Ceiling 2.5%", highlight: "above" },
      format: percent,
      question: "Are fewer accounts leaving than before?",
    },
    {
      id: "arpa",
      label: "ARPA",
      value: moneyFull(arpaNow),
      delta: signed(`${arpaDelta.toFixed(1)}%`, arpaDelta),
      deltaTone: tone(arpaDelta > 0, arpaDelta),
      sparkline: s.arpa.current,
      series: s.arpa,
      reference: { value: Math.round(avg(s.arpa.previous)), label: `Last period avg ${moneyFull(avg(s.arpa.previous))}`, highlight: "above" },
      format: moneyFull,
      question: "Is each account paying more over time?",
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
  const mrr = seriesFor(period, granularity).mrr.current;
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

export type ChurnStatus = "pastDue" | "downgrade" | "atRisk";

export const STATUS: Record<ChurnStatus, { label: string; tone: BadgeTone }> = {
  pastDue: { label: "Past due", tone: "danger" },
  downgrade: { label: "Downgrade", tone: "warning" },
  atRisk: { label: "At risk", tone: "warning" },
};

export interface ChurnRisk {
  id: string;
  account: string;
  plan: (typeof PLANS)[number];
  mrr: number;
  change: number;
  chance: number;
  status: ChurnStatus;
  next: string;
}

export const CHURN_RISKS: ChurnRisk[] = [
  { id: "kettle", account: "Kettle Analytics", plan: "Scale", mrr: 2180, change: 0, chance: 81, status: "atRisk", next: "Call on Mon" },
  { id: "brightline", account: "Brightline Studio", plan: "Growth", mrr: 640, change: -160, chance: 74, status: "pastDue", next: "Retry on Fri" },
  { id: "pinecrest", account: "Pinecrest Clinics", plan: "Enterprise", mrr: 4900, change: -1200, chance: 58, status: "downgrade", next: "Offer sent" },
  { id: "hollis", account: "Hollis & Grey", plan: "Growth", mrr: 720, change: 0, chance: 46, status: "pastDue", next: "Retry on Sat" },
  { id: "northbeam", account: "Northbeam Labs", plan: "Starter", mrr: 190, change: -40, chance: 33, status: "downgrade", next: "On track" },
];

/** Rail: payments and cards that need a person. */
export const NEEDS_ATTENTION: ListViewItem[] = [
  { id: "f1", primary: "Brightline Studio", secondary: "Card declined twice", icon: "CreditCard", badge: "$640", badgeTone: "danger", group: "failed" },
  { id: "f2", primary: "Hollis & Grey", secondary: "Bank asked for verification", icon: "CreditCard", badge: "$720", badgeTone: "danger", group: "failed" },
  { id: "f3", primary: "Fernway Tours", secondary: "Insufficient funds", icon: "CreditCard", badge: "$310", badgeTone: "danger", group: "failed" },
  { id: "e1", primary: "Marlow Dental", secondary: "Card expires Nov 30", icon: "Clock", badge: "$1,450", badgeTone: "warning", group: "expiring" },
  { id: "e2", primary: "Quarry Coffee", secondary: "Card expires Dec 4", icon: "Clock", badge: "$260", badgeTone: "warning", group: "expiring" },
];

export const NEEDS_ATTENTION_GROUPS = [
  { id: "failed", label: "Failed payments" },
  { id: "expiring", label: "Cards expiring soon" },
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
export const SUGGESTIONS = ["What drove MRR this period?", "Which accounts might churn?", "How is retention trending?"];

/** The answer to a suggested question, built from the same numbers the dashboard shows. */
export function answerFor(question: string, period: DashboardPeriod): string {
  const span = SPANS[period];
  const totals = movementTotals(period);
  const i = insightFor(period);
  if (question === SUGGESTIONS[0]) {
    return `MRR went from ${money(span.mrr.start)} to ${money(span.mrr.end)} over the ${i.periodLabel}, so net new MRR was ${i.netNew}. New subscriptions brought in ${money(totals.new)} and expansion ${money(totals.expansion)}, while churn took ${money(Math.abs(totals.churned))} and contraction ${money(Math.abs(totals.contraction))}.`;
  }
  if (question === SUGGESTIONS[1]) {
    const top = CHURN_RISKS[0];
    return `${CHURN_RISKS.length} accounts are on the list. The biggest is ${top.account} (${moneyFull(top.mrr)} MRR, ${top.chance}% chance), with a call on Monday. Two are past due and retry this week.`;
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
