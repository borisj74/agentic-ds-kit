"use client";

import { useState } from "react";
import { ChangeSummary, type ChangeItem } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import { RadioControl } from "./ControlsPanel";
import agentDoc from "./AgentDoc.module.css";

const MIXED: ChangeItem[] = [
  { id: "mrr", label: "MRR", before: "$48.2K", after: "$52.9K", delta: "+9.8%", direction: "up", sentiment: "good" },
  { id: "churn", label: "Churned accounts", before: "14", after: "9", delta: "−5", direction: "down", sentiment: "good" },
  { id: "response", label: "Avg. response time", before: "2.1h", after: "3.4h", delta: "+1.3h", direction: "up", sentiment: "bad" },
  { id: "trial", label: "Trial conversions", before: "22%", after: "22%", delta: "0 pts", direction: "flat", sentiment: "neutral" },
];
const ALL_UP: ChangeItem[] = [
  { id: "mrr", label: "MRR", before: "$48.2K", after: "$52.9K", delta: "+9.8%", direction: "up", sentiment: "good" },
  { id: "seats", label: "Active seats", before: "310", after: "342", delta: "+32", direction: "up", sentiment: "good" },
  { id: "nps", label: "NPS", before: "41", after: "46", delta: "+5", direction: "up", sentiment: "good" },
];
const ALL_DOWN: ChangeItem[] = [
  { id: "churn", label: "Churned accounts", before: "14", after: "9", delta: "−5", direction: "down", sentiment: "good" },
  { id: "failed", label: "Failed payments", before: "6", after: "2", delta: "−4", direction: "down", sentiment: "good" },
  { id: "expansion", label: "Expansion revenue", before: "$6.1K", after: "$4.8K", delta: "−21%", direction: "down", sentiment: "bad" },
];
const FLAT: ChangeItem[] = [
  { id: "mrr", label: "MRR", before: "$52.9K", after: "$52.9K", delta: "0%", direction: "flat", sentiment: "neutral" },
  { id: "seats", label: "Active seats", before: "342", after: "342", delta: "0", direction: "flat", sentiment: "neutral" },
];
const NARRATED: ChangeItem[] = [
  { id: "net-new", label: "Net new MRR", before: "$33.7k", after: "$40.7k", delta: "+20.8%", direction: "up", sentiment: "good", why: "Annual offer brought 18 upgrades" },
  { id: "churn-rate", label: "Churn rate", before: "2.6%", after: "2.1%", delta: "−0.5 pt", direction: "down", sentiment: "good", why: "Fewer card failures after retries moved to Friday" },
  { id: "mrr", label: "MRR", before: "$372.1k", after: "$412.6k", delta: "+10.9%", direction: "up", sentiment: "good", why: "Upgrades from Growth to Scale" },
  { id: "starter-churn", label: "Starter churn", before: "2.4%", after: "4.8%", delta: "+2.4 pt", direction: "up", sentiment: "bad", why: "Cancellations cite the new Starter price" },
  { id: "failed", label: "Failed payments", before: "9", after: "14", delta: "+5", direction: "up", sentiment: "bad", why: "Two cards expired at Brightline and Hollis & Grey" },
];
const HEADLINE = "Growth came from upgrades and the annual offer; Starter churn doubled after the Oct 28 price change.";
const QUIET = "No metric moved more than 2%. The biggest change was trial conversion, −0.2 pt.";
const noop = () => {};
const SETS = { narrated: NARRATED, mixed: MIXED, "all up": ALL_UP, "all down": ALL_DOWN } as const;

export function ChangeSummaryDoc() {
  const [set, setSet] = useState<keyof typeof SETS>("narrated");
  return (
    <AgentDocFrame
      id="changesummary"
      name="ChangeSummary"
      lede="A compact “what moved” card: a headline sentence, then before → after, a delta and a why per metric."
      summary="Switch data sets: colour follows the sentiment set per metric, not the direction."
      preview={
        set === "narrated" ? (
          <ChangeSummary title="Revenue · What moved" period="Oct → Nov" summary={HEADLINE} groupBy="sentiment" items={NARRATED} onViewAll={noop} onAsk={noop} />
        ) : (
          <ChangeSummary period="Oct → Nov 2026" items={SETS[set]} onViewAll={noop} />
        )
      }
      controls={<RadioControl label="Data" options={["narrated", "mixed", "all up", "all down"] as const} value={set} onChange={setSet} />}
      usage="Each metric sets its own sentiment: churn going down is good. The word good, bad or neutral is always visible, and each row reads as one sentence to screen readers. Lead with summary, group with groupBy sentiment and give each row a short why (no trailing period). onAsk adds an Ask in Chat Button. Use Scoreboard for a row of KPIs and LineChart for a series."
      code={`<ChangeSummary
  title="Revenue · What moved"
  period="Oct → Nov"
  summary="Growth came from upgrades and the annual offer; Starter churn doubled after the Oct 28 price change."
  groupBy="sentiment"
  items={[
    { id: "mrr", label: "MRR", before: "$372.1k", after: "$412.6k", delta: "+10.9%", direction: "up", sentiment: "good", why: "Upgrades from Growth to Scale" },
    { id: "starter-churn", label: "Starter churn", before: "2.4%", after: "4.8%", delta: "+2.4 pt", direction: "up", sentiment: "bad", why: "Cancellations cite the new Starter price" },
  ]}
  onViewAll={openReport}
  onAsk={openChat}
/>`}
      variants={[
        {
          title: "Narrated",
          about: "A headline sentence, then Better and Worse groups with a count; each row has a one-line why.",
          code: `<ChangeSummary title="Revenue · What moved" period="Oct → Nov" summary={headline} groupBy="sentiment" items={items} onViewAll={openReport} onAsk={openChat} />`,
          render: <ChangeSummary title="Revenue · What moved" period="Oct → Nov" summary={HEADLINE} groupBy="sentiment" items={NARRATED} onViewAll={noop} onAsk={noop} />,
        },
        {
          title: "Quiet month",
          about: "No items, only the summary: no groups and no Empty state.",
          code: `<ChangeSummary title="Revenue · What moved" period="Oct → Nov" summary={summary} items={[]} onAsk={openChat} />`,
          render: <ChangeSummary title="Revenue · What moved" period="Oct → Nov" summary={QUIET} items={[]} onAsk={noop} />,
        },
        {
          title: "Mixed up / down",
          about: "Good, bad and neutral moves in one period.",
          code: `<ChangeSummary period="Oct → Nov 2026" items={items} onViewAll={openReport} />`,
          render: <ChangeSummary period="Oct → Nov 2026" items={MIXED} onViewAll={noop} />,
        },
        {
          title: "All down — sentiment configured per row",
          about: "Down is good for churn and failed payments, bad for expansion revenue.",
          code: `<ChangeSummary period="Oct → Nov 2026" items={items} onViewAll={openReport} />`,
          render: <ChangeSummary period="Oct → Nov 2026" items={ALL_DOWN} onViewAll={noop} />,
        },
        {
          title: "No change",
          about: "Flat moves are neutral, with a right arrow.",
          code: `<ChangeSummary period="Nov → Nov" items={items} onViewAll={openReport} />`,
          render: <ChangeSummary period="Nov → Nov" items={FLAT} onViewAll={noop} />,
        },
        {
          title: "Loading, empty and error",
          about: "Skeleton rows; a kit Empty before two full periods; a load error with Retry.",
          code: `<ChangeSummary items={[]} loading />
<ChangeSummary items={[]} />
<ChangeSummary items={[]} error="Couldn't load this period." onRetry={retry} />`,
          render: (
            <div className={agentDoc.stack}>
              <ChangeSummary items={[]} loading />
              <ChangeSummary items={[]} />
              <ChangeSummary items={[]} error="Couldn’t load this period." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
