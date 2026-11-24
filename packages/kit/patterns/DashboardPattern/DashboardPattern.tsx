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
import type { ScorecardProps } from "../../ui/Scorecard";
import { SegmentedControl } from "../../ui/SegmentedControl";
import { Select } from "../../ui/Select";
import { Skeleton } from "../../ui/Skeleton";
import { Switch } from "../../ui/Switch";
import { Table } from "../../ui/Table";
import type { TableColumn } from "../../ui/Table";
import { Tabs } from "../../ui/Tabs";
import { AppShellPattern, useAppShell } from "../AppShellPattern";
import type { AppShellPatternProps } from "../AppShellPattern";
import {
  CHANGES,
  CHURN_RISKS,
  GRANULARITIES,
  MOVEMENT_KEYS,
  NEEDS_ATTENTION,
  NEEDS_ATTENTION_GROUPS,
  PERIODS,
  RETENTION,
  STATUS,
  SUGGESTIONS,
  answerFor,
  granularitiesFor,
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
import "./DashboardPattern.css";

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
  /** Metric tiles. Default: demo data for the period and granularity. An empty array shows the no-data state. */
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
  /** The one-sentence summary. Default: built from the data. null hides it. */
  insight?: ReactNode | null;
  onInsightDismiss?: () => void;
  /** Needs attention beside the content on wide screens (under the table when narrow). Default true. */
  rail?: boolean;
  /** Skeletons in every card while data loads. */
  loading?: boolean;
  /** Work panel start state (Ask and What changed). */
  panel?: DashboardPanelOptions;
  /** App shell props for your app (nav, workspace, account…), merged over the demo shell. */
  shell?: Partial<Omit<AppShellPatternProps, "children" | "workPanel">>;
}

const ASK_ICON = "MessageCircle";

/** Demo shell: the app-shell example's chrome (workspace, quick actions, Notifications, saved views, account) with rows for a billing product. Swap it through the shell prop, or edit it in your copy. */
export const DASHBOARD_DEMO_SHELL: Omit<AppShellPatternProps, "children"> = {
  layout: "inset",
  className: "layout-shell--viewport",
  workspace: {
    name: "Agentix",
    mark: "ChartLine",
    menu: [
      { heading: "Workspaces", items: [{ id: "agentix", label: "Agentix", selected: true }, { id: "agentix-eu", label: "Agentix EU" }] },
      { items: [{ id: "new-workspace", label: "Create workspace", icon: "Plus" }] },
    ],
  },
  nav: {
    title: "Agentix",
    markIcon: "ChartLine",
    items: [
      { id: "revenue", label: "Revenue", icon: "ChartLine", active: true },
      { id: "customers", label: "Customers", icon: "Users", badge: "3,486" },
      { id: "invoices", label: "Invoices", icon: "FileText", badge: "12" },
      { id: "plans", label: "Plans", icon: "Layers" },
    ],
  },
  search: {
    groups: [
      {
        heading: "Go to",
        items: [
          { id: "revenue", label: "Revenue", icon: "ChartLine" },
          { id: "customers", label: "Customers", icon: "Users" },
          { id: "invoices", label: "Invoices", icon: "FileText" },
          { id: "plans", label: "Plans", icon: "Layers" },
        ],
      },
      { heading: "Actions", items: [{ id: "export", label: "Export this view", icon: "Download" }] },
    ],
  },
  notifications: {
    tabs: [
      {
        id: "billing",
        label: "Billing",
        items: [
          { id: "n1", title: "Three payments failed on Growth", body: "Retries run on Friday", createdAt: "Yesterday", read: false, icon: "CreditCard" },
          { id: "n2", title: "Kettle Analytics asked to cancel", body: "$2,180 MRR", createdAt: "Tue", read: false, icon: "TriangleAlert" },
          { id: "n3", title: "October invoices sent", body: "3,412 invoices", createdAt: "Nov 1", read: true, icon: "FileText" },
        ],
      },
      { id: "mentions", label: "Mentions", items: [], emptyTitle: "No mentions", emptyDescription: "When someone tags you on a report, it shows up here." },
    ],
  },
  projects: {
    label: "Saved views",
    items: [
      { id: "board-pack", label: "Q4 board pack", icon: "Folder" },
      { id: "churn-review", label: "Churn review", icon: "Folder" },
    ],
  },
  account: {
    name: "Ada Brennan",
    secondary: "Finance",
    initials: "AB",
    menu: [{ items: [{ id: "settings", label: "Settings", icon: "Settings" }] }, { items: [{ id: "sign-out", label: "Sign out", icon: "LogOut" }] }],
  },
};

const CHURN_COLUMNS: TableColumn[] = [
  { key: "account", header: "Account", emphasis: true },
  { key: "plan", header: "Plan" },
  { key: "mrr", header: "MRR", numeric: true },
  { key: "change", header: "Change", numeric: true },
  { key: "chance", header: "Chance", numeric: true },
  { key: "status", header: "Status" },
  { key: "next", header: "Next step" },
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

/** The panel toggle beside Export when wide; narrow, the shell's top bar already has one. */
function PagePanelToggle() {
  const narrow = useAppShell()?.narrow ?? false;
  return narrow ? null : <AppShellPattern.PanelToggle ariaLabel="Assistant" />;
}

/**
 * Wide: the rail sits beside the charts and the table runs full width below, so its columns fit.
 * Narrow (the shell's --grid-breakpoint-md): one column, with the rail under the table.
 */
function RailLayout({ main, table, rail, lead }: { main: ReactNode; table: ReactNode; rail: ReactNode; lead?: ReactNode }) {
  const narrow = useAppShell()?.narrow ?? false;
  if (!rail || narrow) {
    return (
      <>
        {main}
        {table}
        {rail}
      </>
    );
  }
  return (
    <>
      <div className="layout-split--primary dashboard-pattern__split">
        <div className="dashboard-pattern__stack">{main}</div>
        <div className="dashboard-pattern__stack">
          {lead}
          {rail}
        </div>
      </div>
      {table}
    </>
  );
}

/** Renders its children only when the shell is narrow (or, with wide, only when it is wide). */
function AtWidth({ wide = false, children }: { wide?: boolean; children: ReactNode }) {
  const narrow = useAppShell()?.narrow ?? false;
  return narrow === !wide ? <>{children}</> : null;
}

/**
 * The Scorecard look for each demo metric, from data it already has:
 * MRR against its target (reference), Net new MRR as an expressive line (its latest bucket differs
 * from the period total; the previous period joins when compare is on), and subscribers and churn as
 * meters toward a target or under a ceiling. ARPA and any other id keep the plain sparkline: ARPA's
 * latest point is its headline value, and it sits above last period's average the whole time. A metric with another id keeps the plain sparkline.
 */
export function metricLook(
  m: DashboardMetric,
  labels: string[],
  compare: boolean,
): Pick<ScorecardProps, "sparkline" | "sparklineVariant" | "reference" | "highlightLast" | "sparklineDates" | "compare" | "meter"> {
  const current = m.series.current;
  const latest = current[current.length - 1] ?? 0;
  switch (m.id) {
    case "mrr": {
      // Dots on the trailing points past the target; none when the whole period is past it (nothing crossed).
      const pastRef = (v: number) => (m.reference.highlight === "above" ? v > m.reference.value : v < m.reference.value);
      let past = 0;
      for (let i = current.length - 1; i >= 0 && pastRef(current[i]); i -= 1) past += 1;
      return {
        sparkline: current,
        sparklineVariant: "reference",
        reference: { value: m.reference.value, label: m.reference.label },
        highlightLast: past < current.length ? past : 0,
        sparklineDates: labels.length > 1 ? [labels[0], labels[labels.length - 1]] : undefined,
      };
    }
    case "netNew":
      // A flow: the latest bucket in the end tag differs from the period total on the card.
      return {
        sparkline: current,
        sparklineVariant: "expressive",
        compare: compare ? m.series.previous : undefined,
      };
    case "subscribers":
      return { meter: { value: latest, max: m.reference.value, label: `of ${m.format(m.reference.value)} target` } };
    case "churn":
      return {
        meter: { value: latest, max: m.reference.value, label: `of ${m.format(m.reference.value)} ceiling`, direction: "lower" },
      };
    default:
      return { sparkline: m.sparkline };
  }
}

/**
 * Revenue overview for a subscription business, inside AppShellPattern (inset): title with Tabs
 * and Export, period / granularity / compare controls, a one-sentence summary, a metric strip that
 * picks the main chart's metric, MRR movements, revenue by plan, retention by signup month, top
 * plans, accounts that might churn, and a Needs attention rail. The work panel holds Ask (kit
 * Chat with a context chip per card) and What changed. Every card has an Ask button.
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

  // A granularity the period does not offer falls back to the period's first one.
  const allowed = granularitiesFor(period);
  const granularity = allowed.includes(granularityRaw) ? granularityRaw : allowed[allowed.length - 1];
  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? "";

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

  const askButton = (card: string) => (
    <Button appearance="ghost" mode="neutral" size="sm" iconStart={ASK_ICON} ariaLabel={`Ask about ${card}`} onClick={() => ask(card)} />
  );
  const askAction = (card: string) => ({ label: `Ask about ${card}`, iconStart: ASK_ICON, iconOnly: true, onClick: () => ask(card) });

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

  // Main chart: the picked metric, the previous period dashed, a labelled reference line.
  const mainSeries = metric
    ? [
        { label: compare ? "This period" : metric.label, data: metric.series.current },
        ...(compare ? [{ label: "Previous period", data: metric.series.previous, dashed: true }] : []),
      ]
    : [];
  const past = metric
    ? metric.series.current.filter((v) => (metric.reference.highlight === "above" ? v > metric.reference.value : v < metric.reference.value)).length
    : 0;
  const mainSummary = metric
    ? `${metric.label} went from ${metric.format(metric.series.current[0] ?? 0)} to ${metric.format(
        metric.series.current[metric.series.current.length - 1] ?? 0,
      )}. ${past} of ${metric.series.current.length} points are ${metric.reference.highlight} ${metric.reference.label}.${
        compare ? ` The previous period ended at ${metric.format(metric.series.previous[metric.series.previous.length - 1] ?? 0)}.` : ""
      }`
    : "";

  // MRR only (a running total): how much it moved each bucket, as a strip under the area, and a
  // tooltip note on the largest drop. Flows and rates already show change, so they get neither.
  const mrrSteps =
    metric?.id === "mrr" ? metric.series.current.map((v, i, all) => (i === 0 ? 0 : v - (all[i - 1] ?? v))) : null;
  const unit = granularity === "daily" ? "day" : granularity === "weekly" ? "week" : "month";
  const mainStrip =
    metric && mrrSteps
      ? {
          label: `Net change per ${unit}`,
          data: mrrSteps,
          format: (v: number) => (v > 0 ? `+${metric.format(v)}` : v < 0 ? `\u2212${metric.format(-v)}` : metric.format(0)),
        }
      : undefined;
  const dropAt = mrrSteps ? mrrSteps.reduce((at, v, i) => (v < (mrrSteps[at] ?? 0) ? i : at), 0) : -1;
  const periodShort = PERIODS.find((p) => p.value === period)?.short ?? "this period";
  const mainNote =
    mrrSteps && dropAt > 0 && (mrrSteps[dropAt] ?? 0) < 0
      ? (index: number) => (index === dropAt ? `The largest drop in the ${periodShort}.` : undefined)
      : undefined;

  const movements = movementsFor(period);
  const plans = planSeriesFor(period, granularity);
  const topPlans = topPlansFor(period, granularity);
  const churnRows = CHURN_RISKS.map((row) => ({
    account: row.account,
    plan: row.plan,
    mrr: moneyFull(row.mrr),
    change:
      row.change === 0 ? (
        "—"
      ) : (
        <Badge size="sm" tone={row.change < 0 ? "danger" : "success"}>
          {moneyFull(row.change)}
        </Badge>
      ),
    chance: `${row.chance}%`,
    status: (
      <Badge size="sm" tone={STATUS[row.status].tone}>
        {STATUS[row.status].label}
      </Badge>
    ),
    next: row.next,
  }));

  const empty = !hasData;
  const noDataCopy = { emptyTitle: "No revenue yet", emptyDescription: "This fills in after your first paid invoice." };

  const insightCard = showInsight ? (
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
  ) : null;

  const needsAttention = (
    <Card title="Needs attention" description="Which payments and cards need a person today?" size="sm" flush headerAction={askAction("Needs attention")}>
      {loading ? (
        <div className="dashboard-pattern__pad">
          <Skeleton lines={4} label="Loading Needs attention" />
        </div>
      ) : (
        <ListView
          label="Needs attention"
          size="sm"
          truncate="secondary"
          groups={NEEDS_ATTENTION_GROUPS}
          items={empty ? [] : NEEDS_ATTENTION}
          empty={{ title: "Nothing needs you", description: "Failed payments and expiring cards show up here." }}
        />
      )}
    </Card>
  );

  const overview = (
    <div className="dashboard-pattern__body">
      <div className="dashboard-pattern__controls" role="group" aria-label="Chart controls">
        <div className="dashboard-pattern__period">
          <Select
            id="dashboard-period"
            size="sm"
            ariaLabel="Period"
            value={period}
            onChange={(value) => setPeriod(value as DashboardPeriod)}
            options={PERIODS.map(({ value, label }) => ({ value, label }))}
          />
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

      {/* The summary: above the metrics when narrow; at the top of the rail, beside the main chart, when wide. */}
      {rail ? <AtWidth>{insightCard}</AtWidth> : insightCard}

      {loading ? (
        <Card size="md">
          <div className="layout-metrics">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} lines={3} label={i === 0 ? "Loading metrics" : ""} />
            ))}
          </div>
        </Card>
      ) : empty ? (
        <Card size="md">
          <Empty
            title="No metrics yet"
            description="MRR, subscribers and churn appear here after your first paid invoice. Connect billing to start."
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
              badge: m.delta,
              badgeTone: m.deltaTone,
              hint: `vs previous ${period === "30d" ? "30 days" : period === "3m" ? "3 months" : "12 months"}`,
              ...metricLook(m, labels, compare),
            }))}
          />
      )}

      <RailLayout
        rail={rail ? needsAttention : null}
        lead={insightCard}
        main={
          <>
            <StateCard
              title={metric?.label ?? "MRR"}
              description={metric?.question ?? "Is recurring revenue on track for the target?"}
              loading={loading}
              empty={empty}
              {...noDataCopy}
            >
              {metric ? (
                <div className="dashboard-pattern__chart">
                  <LineChart
                    key={`${metric.id}-${period}-${granularity}`}
                    title={metric.label}
                    description={metric.question}
                    variant="area"
                    labels={labels}
                    series={mainSeries}
                    referenceLine={metric.reference}
                    highlightLast
                    changeStrip={mainStrip}
                    tooltipNote={mainNote}
                    actions={askButton(metric.label)}
                  />
                  <p className="dashboard-pattern__sr">{mainSummary}</p>
                </div>
              ) : null}
            </StateCard>

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
          </>
        }
        table={
          <Card
            title="Might churn this month"
            description="Which paying accounts could leave, and what happens next?"
            size="sm"
            flush
            headerAction={[askAction("Might churn this month"), { label: "View all", href: "#accounts" }]}
          >
            {loading ? (
              <div className="dashboard-pattern__pad">
                <Skeleton lines={5} label="Loading accounts" />
              </div>
            ) : empty ? (
              <div className="dashboard-pattern__pad">
                <Empty title="No accounts at risk" description="Accounts with failed payments, downgrades or low use show up here." icon="Users" />
              </div>
            ) : (
              <Table columns={CHURN_COLUMNS} rows={churnRows} size="md" />
            )}
          </Card>
        }
      />
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
                title={`Ask about revenue, ${periodLabel.toLowerCase()}`}
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
            title="Revenue overview"
            subtitle="Recurring revenue, subscribers and churn across every plan."
            actions={
              <>
                <Button appearance="outline" mode="neutral" size="md" iconStart="Download">
                  Export
                </Button>
                <PagePanelToggle />
              </>
            }
          />
        </div>
        <div className="layout-content">
          <Tabs
            ariaLabel="Revenue views"
            defaultValue="overview"
            items={[
              { id: "overview", label: "Overview", content: overview },
              ...["Subscribers", "Churn", "Cohorts"].map((label) => ({
                id: label.toLowerCase(),
                label,
                content: (
                  <Empty
                    title={`${label} goes here`}
                    description="This example builds the Overview tab. Compose the others from the same cards."
                    icon="ChartLine"
                    outlined
                  />
                ),
              })),
            ]}
          />
        </div>
      </main>
    </AppShellPattern>
  );
}
