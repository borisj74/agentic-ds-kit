"use client";

import { useState } from "react";
import { UsageMeter } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const NORMAL = {
  used: 6420,
  categories: [
    { id: "chat", label: "Chat", value: 1930 },
    { id: "code", label: "Code agent", value: 1410 },
    { id: "tools", label: "Tool calls", value: 580 },
    { id: "other", label: "Other", value: 500 },
  ],
  daily: [180, 220, 210, 260, 240, 300, 280, 310, 290, 350, 330, 380, 360, 412],
};

const WARNING = {
  used: 9240,
  categories: [
    { id: "chat", label: "Chat", value: 3510 },
    { id: "code", label: "Code agent", value: 3140 },
    { id: "tools", label: "Tool calls", value: 1390 },
    { id: "other", label: "Other", value: 1200 },
  ],
  daily: [420, 480, 510, 560, 600, 620, 680, 700, 740, 780, 820, 860, 900, 968],
};

const BASE = { title: "AI credits · Pro plan", limit: 10000, periodStart: "Nov 1", resetLabel: "resets Dec 1", dailyCap: 1000 };
const noop = () => {};

export function UsageMeterDoc() {
  const [state, setState] = useState<"normal" | "warning">("warning");
  const data = state === "normal" ? NORMAL : WARNING;
  return (
    <AgentDocFrame
      id="usagemeter"
      name="UsageMeter"
      lede="Plan usage and AI credits. Built from Meter, UsageList and LineChart."
      summary="Switch between normal and near limit: the Meter, warning and Upgrade change with it."
      preview={
        <UsageMeter
          {...BASE}
          {...data}
          paceNote="At this pace you hit the limit in ~2 days."
          onUpgrade={noop}
          onViewUsage={noop}
        />
      }
      controls={<DocOptions label="Usage" options={["normal", "warning"] as const} value={state} onChange={setState} />}
      usage="UsageMeter composes kit Meter (total), UsageList (by category), LineChart (daily, with the cap) and Alert (near limit). Upgrade becomes the solid primary only near or over the limit."
      code={`<UsageMeter
  title="AI credits · Pro plan"
  used={9240}
  limit={10000}
  categories={categories}
  periodStart="Nov 1"
  resetLabel="resets Dec 1"
  daily={daily}
  dailyCap={1000}
  onUpgrade={upgrade}
  onViewUsage={viewUsage}
/>`}
      variants={[
        {
          title: "Normal — 64% used",
          about: "No warning and no upgrade push.",
          code: `<UsageMeter title="AI credits · Pro plan" used={6420} limit={10000} categories={categories} daily={daily} dailyCap={1000} />`,
          render: <UsageMeter {...BASE} {...NORMAL} />,
        },
        {
          title: "Warning — near limit",
          about: "From warnAt (0.9) the Meter turns warning, an Alert says what is left and Upgrade plan appears.",
          code: `<UsageMeter … used={9240} paceNote="At this pace you hit the limit in ~2 days." onUpgrade={upgrade} onViewUsage={viewUsage} />`,
          render: <UsageMeter {...BASE} {...WARNING} paceNote="At this pace you hit the limit in ~2 days." onUpgrade={noop} onViewUsage={noop} />,
        },
        {
          title: "Limit reached",
          about: "At or over the limit the Meter and Alert switch to danger.",
          code: `<UsageMeter … used={10000} onUpgrade={upgrade} />`,
          render: <UsageMeter {...BASE} {...WARNING} used={10000} onUpgrade={noop} onViewUsage={noop} />,
        },
        {
          title: "Loading and error",
          about: "Skeletons while loading; a load error with Retry.",
          code: `<UsageMeter title="…" used={0} limit={10000} loading />
<UsageMeter title="…" used={0} limit={10000} error="Couldn't load usage." onRetry={retry} />`,
          render: (
            <div className={agentDoc.stack}>
              <UsageMeter {...BASE} used={0} loading />
              <UsageMeter {...BASE} used={0} error="Couldn't load usage." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
