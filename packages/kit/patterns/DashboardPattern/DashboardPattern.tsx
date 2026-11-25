"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BarList } from "../../ui/BarList";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Chat } from "../../ui/Chat";
import type { ChatMessage } from "../../ui/Chat";
import { ComboChart } from "../../ui/ComboChart";
import { Empty } from "../../ui/Empty";
import { Heatmap } from "../../ui/Heatmap";
import { InsightCard } from "../../ui/InsightCard";
import { LineChart } from "../../ui/LineChart";
import { ListView } from "../../ui/ListView";
import { PageHeader } from "../../ui/PageHeader";
import { Scoreboard } from "../../ui/Scoreboard";
import { SegmentedControl } from "../../ui/SegmentedControl";
import { DateRangePicker } from "../../ui/DateRangePicker";
import type { DateRange } from "../../ui/DateRangePicker";
import { Field } from "../../ui/Field";
import { Skeleton } from "../../ui/Skeleton";
import { Switch } from "../../ui/Switch";
import { Table } from "../../ui/Table";
import type { TableColumn } from "../../ui/Table";
import { Tabs } from "../../ui/Tabs";
import { AppShellPattern, useAppShell } from "../AppShellPattern";
import type { AppShellPatternProps } from "../AppShellPattern";
import {
  CHANGES,
  GRANULARITIES,
  MOVEMENT_KEYS,
  NEEDS_ATTENTION,
  NEEDS_ATTENTION_FOLDED,
  NEEDS_ATTENTION_GROUPS,
  OVERDUE,
  OVERDUE_INVOICES,
  PERIODS,
  RETENTION,
  SUGGESTIONS,
  answerFor,
  cents,
  granularitiesFor,
  hintFor,
  insightFor,
  metricsFor,
  money,
  moneyFull,
  movementsFor,
  planSeriesFor,
  topPlansFor,
  labelsFor,
  type DashboardGranularity,
  type DashboardMetric,
  type DashboardPeriod,
} from "./dashboard-data";
import { findingFor, shortName, trendFor } from "./metricText";
import "./DashboardPattern.css";

export { findingFor, trendFor } from "./metricText";

/** The demo's last day (dashboard-data END) and the three periods as DateRangePicker presets. */
const PERIOD_END = "2026-11-20";
const PERIOD_DAYS: Record<DashboardPeriod, number> = { "30d": 30, "3m": 91, "12m": 364 };

/** When the demo data last synced, for the subtitle, the card meta and the sources. */
const SYNCED_AT = "09:42";

function daysBefore(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - days + 1)).toISOString().slice(0, 10);
}

function rangeLabel(range: DateRange): string {
  const fmt = (iso: string) => {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  };
  return range.end ? `${fmt(range.start)} – ${fmt(range.end)}` : fmt(range.start);
}

const PERIOD_PRESETS = PERIODS.map(({ value, label }) => ({
  id: value,
  label,
  start: daysBefore(PERIOD_END, PERIOD_DAYS[value]),
  end: PERIOD_END,
}));

/** A custom range shows the demo data of the period closest to its length. */
function nearestPeriod(range: DateRange): DashboardPeriod {
  const [sy, sm, sd] = range.start.split("-").map(Number);
  const [ey, em, ed] = (range.end ?? range.start).split("-").map(Number);
  const days = Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000) + 1;
  if (days <= 60) return "30d";
  if (days <= 182) return "3m";
  return "12m";
}

export type { DashboardGranularity, DashboardMetric, DashboardMetricId, DashboardPeriod } from "./dashboard-data";

export type DashboardPanelTab = "ask" | "changes";

export interface DashboardPanelOptions {
  /** Open the work panel on first render. Default false. */
  defaultOpen?: boolean;
  /** Tab shown first. Default ask. */
  defaultTab?: DashboardPanelTab;
  /** Chat thread to start with, e.g. a finished exchange. */
  defaultMessages?: ChatMessage[];
  /** Context chip to start with, e.g. "MRR · Last 3 months". */
  defaultContext?: string;
}

export interface DashboardPatternProps {
  /** KPI tiles. Default: demo data for the period and granularity. An empty array shows the no-data state. */
  metrics?: DashboardMetric[];
  /** Controlled metric shown in the main chart (a metric id). */
  selectedMetric?: string;
  defaultSelectedMetric?: string;
  onSelectedMetricChange?: (id: string) => void;
  /** Controlled: the previous period as a dashed line in the main chart. */
  compare?: boolean;
  defaultCompare?: boolean;
  onCompareChange?: (compare: boolean) => void;
  period?: DashboardPeriod;
  defaultPeriod?: DashboardPeriod;
  onPeriodChange?: (period: DashboardPeriod) => void;
  granularity?: DashboardGranularity;
  defaultGranularity?: DashboardGranularity;
  onGranularityChange?: (granularity: DashboardGranularity) => void;
  /** The one-sentence summary on the Revenue tab. Default: built from the data. null hides it. */
  insight?: ReactNode | null;
  onInsightDismiss?: () => void;
  /** Needs attention: the rail beside the chart on wide screens, the first card when narrow. Default true. */
  rail?: boolean;
  /** Skeletons in every card while data loads. */
  loading?: boolean;
  /** Work panel start state (Ask and What changed). */
  panel?: DashboardPanelOptions;
  /** App shell props for your app (nav, workspace, account…), merged over the demo shell. */
  shell?: Partial<Omit<AppShellPatternProps, "children" | "workPanel">>;
}

const ASK_ICON = "MessageCircle";

/** Demo shell: the app-shell example's chrome (workspace, quick actions, Notifications, account) with rows for a billing product. Swap it through the shell prop, or edit it in your copy. */
export const DASHBOARD_DEMO_SHELL: Omit<AppShellPatternProps, "children"> = {
  layout: "inset",
  className: "layout-shell--viewport",
  workspace: {
    name: "Northwind",
    mark: "CreditCard",
    menu: [
      { heading: "Workspaces", items: [{ id: "northwind", label: "Northwind", selected: true }, { id: "northwind-eu", label: "Northwind EU" }] },
      { items: [{ id: "new-workspace", label: "Create workspace", icon: "Plus" }] },
    ],
  },
  nav: {
    title: "Northwind",
    markIcon: "CreditCard",
    items: [
      { id: "home", label: "Home", icon: "House", active: true },
      { id: "customers", label: "Customers", icon: "Users" },
      {
        id: "billing",
        label: "Billing",
        icon: "CreditCard",
        items: [
          { id: "invoices", label: "Invoices", badge: "14" },
          { id: "payments", label: "Payments" },
          { id: "plans", label: "Plans" },
        ],
      },
      { id: "reports", label: "Reports", icon: "ChartBar" },
    ],
  },
  search: {
    groups: [
      {
        heading: "Go to",
        items: [
          { id: "home", label: "Home", icon: "House" },
          { id: "customers", label: "Customers", icon: "Users" },
          { id: "invoices", label: "Invoices", icon: "FileText" },
          { id: "reports", label: "Reports", icon: "ChartBar" },
        ],
      },
      {
        heading: "Actions",
        items: [
          { id: "new-invoice", label: "New invoice", icon: "Plus" },
          { id: "export", label: "Export this view", icon: "Download" },
        ],
      },
    ],
  },
  notifications: {
    tabs: [
      {
        id: "billing",
        label: "Billing",
        items: [
          { id: "n1", title: "Three payments failed", body: "Retries run on Friday", createdAt: "Yesterday", read: false, icon: "CreditCard" },
          { id: "n2", title: "INV-1821 is 20 days late", body: "Pinecrest Clinics, $14,700.00", createdAt: "Today", read: false, icon: "TriangleAlert" },
          { id: "n3", title: "October invoices sent", body: "3,412 invoices", createdAt: "Nov 1", read: true, icon: "FileText" },
        ],
      },
      { id: "mentions", label: "Mentions", items: [], emptyTitle: "No mentions", emptyDescription: "When someone tags you on an invoice, it shows up here." },
    ],
  },
  account: {
    name: "Maya Chen",
    secondary: "Owner",
    initials: "MC",
    menu: [{ items: [{ id: "settings", label: "Settings", icon: "Settings" }] }, { items: [{ id: "sign-out", label: "Sign out", icon: "LogOut" }] }],
  },
};

const OVERDUE_COLUMNS: TableColumn[] = [
  { key: "customer", header: "Customer", emphasis: true },
  { key: "invoice", header: "Invoice" },
  { key: "status", header: "Status" },
  { key: "due", header: "Due", sortable: true, sortValue: (row) => Number(row.dueDay) },
  { key: "amount", header: "Amount", numeric: true },
];

/** A controlled-or-uncontrolled value. */
function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [inner, setInner] = useState(initial);
  const current = value ?? inner;
  return [
    current,
    (next: T) => {
      if (value === undefined) setInner(next);
      onChange?.(next);
    },
  ];
}

/** A card that shows a skeleton while loading, kit Empty when there is no data, or its content. */
function StateCard({
  title,
  description,
  loading,
  empty,
  emptyTitle,
  emptyDescription,
  height = 240,
  children,
}: {
  title: string;
  description: string;
  loading: boolean;
  empty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  height?: number;
  children: ReactNode;
}) {
  if (!loading && !empty) return <>{children}</>;
  return (
    <Card title={title} description={description} size="sm">
      {loading ? (
        <Skeleton shape="rect" height={height} label={`Loading ${title}`} />
      ) : (
        <Empty title={emptyTitle} description={emptyDescription} icon="ChartLine" />
      )}
    </Card>
  );
}

/** The panel toggle beside the header actions when wide; narrow, the shell's top bar already has one. */
function PagePanelToggle() {
  const narrow = useAppShell()?.narrow ?? false;
  return narrow ? null : <AppShellPattern.PanelToggle ariaLabel="Assistant" />;
}

/** Renders children with the shell's width: narrow below its --grid-breakpoint-md. */
function AtWidth({ children }: { children: (narrow: boolean) => ReactNode }) {
  const narrow = useAppShell()?.narrow ?? false;
  return <>{children(narrow)}</>;
}

/**
 * Northwind's billing home inside AppShellPattern (inset). Overview: four KPIs that pick the
 * revenue chart's metric, the chart, Needs attention and the oldest overdue invoices. Revenue:
 * the period / granularity / compare controls, a one-sentence summary, MRR movements, revenue by
 * plan, retention by signup month and top plans. The work panel holds Ask (kit Chat with a
 * context chip per card) and What changed. Every card has a labelled Ask in its footer, or an
 * Ask button in its chart header on the Revenue tab.
 */
export function DashboardPattern({
  metrics: metricsProp,
  selectedMetric: selectedProp,
  defaultSelectedMetric = "mrr",
  onSelectedMetricChange,
  compare: compareProp,
  defaultCompare = false,
  onCompareChange,
  period: periodProp,
  defaultPeriod = "3m",
  onPeriodChange,
  granularity: granularityProp,
  defaultGranularity = "weekly",
  onGranularityChange,
  insight,
  onInsightDismiss,
  rail = true,
  loading = false,
  panel,
  shell,
}: DashboardPatternProps) {
  const [period, setPeriod] = useControllable(periodProp, defaultPeriod, onPeriodChange);
  const [granularityRaw, setGranularity] = useControllable(granularityProp, defaultGranularity, onGranularityChange);
  const [selected, setSelected] = useControllable(selectedProp, defaultSelectedMetric, onSelectedMetricChange);
  const [compare, setCompare] = useControllable(compareProp, defaultCompare, onCompareChange);
  const [insightOpen, setInsightOpen] = useState(true);
  const [tab, setTab] = useState("overview");
  // "Open revenue report" unmounts with the Overview panel, so focus moves to the Revenue panel.
  const tabsRef = useRef<HTMLDivElement>(null);
  const focusPanel = useRef(false);
  useEffect(() => {
    if (!focusPanel.current) return;
    focusPanel.current = false;
    tabsRef.current?.querySelector<HTMLElement>(':scope > [role="tabpanel"]')?.focus();
  }, [tab]);
  function openRevenue() {
    focusPanel.current = true;
    setTab("revenue");
  }

  // A granularity the period does not offer falls back to the period's first one.
  const allowed = granularitiesFor(period);
  const granularity = allowed.includes(granularityRaw) ? granularityRaw : allowed[allowed.length - 1];
  // A custom range from the period DateRangePicker; the demo data follows the nearest period.
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const periodLabel = customRange ? rangeLabel(customRange) : (PERIODS.find((p) => p.value === period)?.label ?? "");
  const periodShort = customRange ? periodLabel : (PERIODS.find((p) => p.value === period)?.short ?? "this period");

  const metrics = metricsProp ?? metricsFor(period, granularity);
  const hasData = metrics.length > 0;
  const metric = metrics.find((m) => m.id === selected) ?? metrics[0];
  const labels = labelsFor(period, granularity);

  // Work panel: Ask (Chat) and What changed.
  const [panelOpen, setPanelOpen] = useState(panel?.defaultOpen ?? false);
  const [panelTab, setPanelTab] = useState<string>(panel?.defaultTab ?? "ask");
  const [context, setContext] = useState<string | undefined>(panel?.defaultContext);
  const [messages, setMessages] = useState<ChatMessage[]>(panel?.defaultMessages ?? []);
  const [thinking, setThinking] = useState(false);
  const replyTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current);
  }, []);

  function ask(card: string) {
    setContext(`${card} · ${periodLabel}`);
    setPanelTab("ask");
    setPanelOpen(true);
  }

  function send(question: string) {
    setMessages((all) => [...all, { id: `u${all.length}`, role: "user", content: question }]);
    setThinking(true);
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      setMessages((all) => [...all, { id: `a${all.length}`, role: "assistant", content: answerFor(question, period) }]);
      setThinking(false);
      replyTimer.current = null;
    }, 900);
  }

  // Revenue tab: the chart cards keep their icon-only Ask in the chart header, as before.
  const askButton = (card: string) => (
    <Button appearance="ghost" mode="neutral" size="sm" iconStart={ASK_ICON} ariaLabel={`Ask about ${card}`} onClick={() => ask(card)} />
  );
  const askAction = (card: string) => ({ label: `Ask about ${card}`, iconStart: ASK_ICON, iconOnly: true, onClick: () => ask(card) });

  const empty = !hasData;
  const noDataCopy = { emptyTitle: "No revenue yet", emptyDescription: "This fills in after your first paid invoice." };

  // ---------- Overview ----------

  // Main chart: the picked metric, the previous period dashed, a labelled reference line.
  const mainSeries = metric
    ? [
        { label: compare ? "This period" : shortName(metric.label), data: metric.series.current },
        ...(compare ? [{ label: "Previous period", data: metric.series.previous, dashed: true }] : []),
      ]
    : [];
  const latest = metric ? (metric.series.current[metric.series.current.length - 1] ?? 0) : 0;
  const mainSummary = metric
    ? `${shortName(metric.label)} went from ${metric.format(metric.series.current[0] ?? 0)} to ${metric.format(latest)}, ${metric.format(
        Math.abs(latest - metric.reference.value),
      )} ${latest < metric.reference.value ? "below" : "above"} ${metric.reference.label}.${
        compare ? ` The previous period ended at ${metric.format(metric.series.previous[metric.series.previous.length - 1] ?? 0)}.` : ""
      }`
    : "";

  const kpis = (narrow: boolean) =>
    loading ? (
      <Card size={narrow ? "sm" : "md"}>
        <div className="layout-metrics layout-metrics--fixed-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} lines={3} label={i === 0 ? "Loading metrics" : ""} />
          ))}
        </div>
      </Card>
    ) : empty ? (
      <Card size={narrow ? "sm" : "md"}>
        <Empty
          title="No metrics yet"
          description="MRR, collections and overdue invoices appear here after your first paid invoice. Connect billing to start."
          icon="ChartLine"
          actions={
            <Button appearance="outline" mode="neutral" size="sm" iconStart="Settings">
              Connect billing
            </Button>
          }
        />
      </Card>
    ) : (
      <Scoreboard
        aria-label="Metric shown in the chart"
        selectable
        value={metric?.id}
        onValueChange={setSelected}
        items={metrics.map((m) => ({
          id: m.id,
          label: m.label,
          value: m.value,
          delta: m.delta,
          trend: trendFor(m),
          deltaTone: m.deltaTone === "success" || m.deltaTone === "warning" || m.deltaTone === "danger" ? m.deltaTone : "neutral",
          // On a phone the tiles go two by two and drop what they compare to.
          hint: narrow ? undefined : metricsProp ? `vs previous ${periodShort.replace(/^last /, "")}` : hintFor(m.id, period),
          size: narrow ? "sm" : "md",
        }))}
      />
    );

  const chartCard = (narrow: boolean) => {
    const size = narrow ? "sm" : "md";
    if (loading || empty || !metric) {
      return (
        <Card size={size} icon="ChartLine" eyebrow="Revenue" title={metric ? shortName(metric.label) : "Revenue"}>
          {loading ? (
            <Skeleton shape="rect" height={narrow ? 120 : 280} label="Loading the revenue chart" />
          ) : (
            <Empty title={noDataCopy.emptyTitle} description={noDataCopy.emptyDescription} icon="ChartLine" />
          )}
        </Card>
      );
    }
    const name = shortName(metric.label);
    return (
      <Card
        size={size}
        icon="ChartLine"
        eyebrow={`Revenue · ${name} · ${granularity}`}
        meta={SYNCED_AT}
        title={findingFor(metric)}
        source={`Stripe · ${periodShort}`}
        askLabel="Ask"
        onAsk={() => ask(name)}
        actions={narrow ? undefined : [{ label: "Open revenue report", appearance: "outline", mode: "neutral", onClick: openRevenue }]}
      >
        <div className="dashboard-pattern__chart">
          <LineChart
            key={`${metric.id}-${period}-${granularity}`}
            variant="area"
            labels={labels}
            series={mainSeries}
            referenceLine={metric.reference}
            highlightLast={!narrow}
            showTable={false}
            showGrid={!narrow}
            height={narrow ? 120 : 280}
          />
          <p className="dashboard-pattern__sr">{mainSummary}</p>
        </div>
      </Card>
    );
  };

  const needsAttention = (narrow: boolean) => (
    <Card
      size={narrow ? "sm" : "md"}
      icon="TriangleAlert"
      eyebrow="Needs attention · today"
      title={empty || loading ? "Needs attention" : `${NEEDS_ATTENTION.length} accounts need a person`}
      askLabel={loading ? undefined : "Ask"}
      onAsk={loading ? undefined : () => ask("Needs attention")}
      actions={empty || loading ? undefined : [{ label: "Retry 3 payments", appearance: "outline", mode: "neutral" }]}
    >
      {loading ? (
        <Skeleton lines={4} label="Loading Needs attention" />
      ) : (
        <ListView
          label="Needs attention"
          size="sm"
          truncate="secondary"
          groups={narrow ? undefined : NEEDS_ATTENTION_GROUPS}
          items={empty ? [] : narrow ? NEEDS_ATTENTION_FOLDED : NEEDS_ATTENTION}
          empty={{ title: "Nothing needs you", description: "Failed payments and expiring cards show up here." }}
        />
      )}
    </Card>
  );

  const overdueRows = OVERDUE_INVOICES.map((row) => ({
    customer: row.customer,
    invoice: row.invoice,
    status: (
      <Badge size="sm" tone="danger" icon="CircleX">
        Overdue
      </Badge>
    ),
    due: `${row.due} · ${row.daysLate} days late`,
    dueDay: row.dueDay,
    amount: cents(row.amount),
  }));

  const overdueCard = (narrow: boolean) => (
    <Card
      size={narrow ? "sm" : "md"}
      flush
      icon="FileText"
      eyebrow="Billing · Invoices"
      meta={loading ? undefined : SYNCED_AT}
      title={empty || loading ? "Overdue invoices" : `${OVERDUE.count} invoices overdue, ${cents(OVERDUE.total)}`}
      source={empty || loading ? undefined : `Oldest first · ${OVERDUE_INVOICES.length} of ${OVERDUE.count} · Stripe, synced ${SYNCED_AT}`}
      askLabel={loading ? undefined : "Ask"}
      onAsk={loading ? undefined : () => ask("Overdue invoices")}
      actions={empty || loading ? undefined : [{ label: narrow ? `View all ${OVERDUE.count}` : `View all ${OVERDUE.count} invoices`, appearance: "outline", mode: "neutral" }]}
    >
      <Table
        aria-label="Overdue invoices, oldest first"
        columns={OVERDUE_COLUMNS}
        rows={empty ? [] : overdueRows}
        size="md"
        stack
        state={loading ? "loading" : empty ? "empty" : undefined}
        emptyLabel="No overdue invoices. Invoices past their due date show up here."
        rowActions={(row) => [
          { label: "Send reminder", onClick: () => undefined },
          { label: "Open invoice", onClick: () => undefined },
          { label: `Ask about ${String(row.invoice)}`, onClick: () => ask(String(row.invoice)) },
        ]}
      />
    </Card>
  );

  /**
   * Needs attention leads the source, so it is the first card on a phone. Wide (the shell's
   * --grid-breakpoint-md and up), the grid places it beside the chart, under the KPIs, with the
   * overdue invoices full width below.
   */
  const overview = (
    <AtWidth>
      {(narrow) => (
        <div
          className={[
            "dashboard-pattern__body",
            "dashboard-pattern__home",
            narrow ? "" : rail ? "dashboard-pattern__home--rail" : "dashboard-pattern__home--wide",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {rail ? <div className="dashboard-pattern__area-rail">{needsAttention(narrow)}</div> : null}
          <div className="dashboard-pattern__area-kpis">{kpis(narrow)}</div>
          <div className="dashboard-pattern__area-table">{overdueCard(narrow)}</div>
          <div className="dashboard-pattern__area-chart">{chartCard(narrow)}</div>
        </div>
      )}
    </AtWidth>
  );

  // ---------- Revenue: the controls and the four analysis cards, as they were on Overview ----------

  const numbers = insightFor(period);
  const insightContent =
    insight === undefined ? (
      <>
        Net new MRR was <strong>{numbers.netNew}</strong> over the {numbers.periodLabel}, mostly from{" "}
        <strong>{numbers.driver}</strong> in new subscriptions, and churn fell from <strong>{numbers.churnFrom}</strong> to{" "}
        <strong>{numbers.churnTo}</strong>.
      </>
    ) : (
      insight
    );
  const showInsight = hasData && !loading && insight !== null && insightOpen;

  const movements = movementsFor(period);
  const plans = planSeriesFor(period, granularity);
  const topPlans = topPlansFor(period, granularity);

  const revenue = (
    <div className="dashboard-pattern__body">
      <div className="dashboard-pattern__controls" role="group" aria-label="Chart controls">
        <div className="dashboard-pattern__period">
          <Field label="Period" htmlFor="dashboard-period" labelPosition="start">
            <DateRangePicker
              id="dashboard-period"
              size="sm"
              presets={PERIOD_PRESETS}
              maxDate={PERIOD_END}
              value={customRange ?? PERIOD_PRESETS.find((p) => p.id === period)}
              onValueChange={(range) => {
                const preset = PERIOD_PRESETS.find((p) => p.start === range.start && p.end === range.end);
                setCustomRange(preset ? null : range);
                setPeriod(preset ? (preset.id as DashboardPeriod) : nearestPeriod(range));
              }}
            />
          </Field>
        </div>
        <SegmentedControl
          size="sm"
          ariaLabel="Granularity"
          value={granularity}
          onChange={(value) => setGranularity(value as DashboardGranularity)}
          items={GRANULARITIES.map(({ value, label }) => ({ value, label, disabled: !allowed.includes(value) }))}
        />
        <div className="dashboard-pattern__compare">
          <Switch size="sm" label="Compare to previous period" checked={compare} onChange={setCompare} />
        </div>
      </div>

      {showInsight ? (
        <InsightCard
          tone="info"
          size="lg"
          title="In short"
          description={insightContent}
          onDismiss={() => {
            setInsightOpen(false);
            onInsightDismiss?.();
          }}
        />
      ) : null}

      <StateCard title="MRR movements" description="Where did this period's change come from?" loading={loading} empty={empty} {...noDataCopy}>
        <ComboChart
          title="MRR movements"
          description="Where did this period's change come from?"
          stack="stacked"
          data={movements}
          bars={MOVEMENT_KEYS.map(({ key, label }) => ({ key, label }))}
          line={{ key: "net", label: "Net new MRR" }}
          valueFormatter={{ bars: money, line: money }}
          actions={askButton("MRR movements")}
        />
      </StateCard>
      <StateCard title="Revenue by plan" description="What share of MRR does each plan bring in?" loading={loading} empty={empty} height={160} {...noDataCopy}>
        <LineChart
          title="Revenue by plan"
          description="What share of MRR does each plan bring in?"
          variant="area"
          stack="percent"
          height={160}
          labels={labels}
          series={plans}
          actions={askButton("Revenue by plan")}
        />
      </StateCard>

      <div className="layout-split">
        <StateCard
          title="Retention by signup month"
          description="How many accounts still pay, months after signing up?"
          loading={loading}
          empty={empty}
          {...noDataCopy}
        >
          <Heatmap
            title="Retention by signup month"
            description="How many accounts still pay, months after signing up?"
            rows={RETENTION.rows}
            columns={RETENTION.columns}
            data={RETENTION.data}
            valueFormatter={(value) => `${value}%`}
            actions={askButton("Retention by signup month")}
          />
        </StateCard>
        <Card title="Top plans" description="Which plans bring in the most MRR today?" size="sm" headerAction={askAction("Top plans")}>
          {loading ? (
            <Skeleton lines={4} label="Loading Top plans" />
          ) : empty ? (
            <Empty title="No plans billed yet" description="Plans show up here once someone pays for one." icon="Layers" />
          ) : (
            <BarList label="Top plans by MRR" data={topPlans} valueFormatter={moneyFull} />
          )}
        </Card>
      </div>
    </div>
  );

  const shellProps = { ...DASHBOARD_DEMO_SHELL, ...shell };

  return (
    <AppShellPattern
      {...shellProps}
      workPanel={{
        title: "Assistant",
        open: panelOpen,
        onOpenChange: setPanelOpen,
        tab: panelTab,
        onTabChange: setPanelTab,
        tabs: [
          {
            id: "ask",
            label: "Ask",
            content: (
              <Chat
                title={`Ask about billing, ${periodLabel.toLowerCase()}`}
                embedded
                messages={messages}
                isThinking={thinking}
                disabled={thinking}
                suggestions={messages.length === 0 ? SUGGESTIONS : []}
                emptyState="Ask about any card. The answer uses the numbers on this page."
                placeholder="Ask about this dashboard"
                context={context ? { label: context, onRemove: () => setContext(undefined) } : undefined}
                onSend={send}
              />
            ),
          },
          {
            id: "changes",
            label: "What changed",
            content: <ListView label="What changed since Monday" size="sm" items={CHANGES} />,
          },
        ],
      }}
    >
      <main className="layout-canvas layout-canvas--sticky-header dashboard-pattern">
        <div className="layout-header">
          <PageHeader
            title="Billing"
            subtitle={`November 2026 · synced from Stripe at ${SYNCED_AT}`}
            actions={
              <>
                <Button appearance="outline" mode="neutral" size="md" iconStart="Download">
                  Export
                </Button>
                <Button appearance="solid" mode="primary" size="md" iconStart="Plus">
                  New invoice
                </Button>
                <PagePanelToggle />
              </>
            }
          />
        </div>
        <div className="layout-content">
          <Tabs
            ref={tabsRef}
            ariaLabel="Billing views"
            value={tab}
            onChange={setTab}
            items={[
              { id: "overview", label: "Overview", content: overview },
              { id: "revenue", label: "Revenue", content: revenue },
            ]}
          />
        </div>
      </main>
    </AppShellPattern>
  );
}
