"use client";

import { useState } from "react";
import { TraceWaterfall } from "agentic-ds-kit";
import type { TraceSpan } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const S = 1000;
const SPANS: TraceSpan[] = [
  { id: "plan", label: "Plan task", kind: "model", startMs: 0.5 * S, endMs: 4.7 * S, cost: 0.03, tokensIn: 2100, tokensOut: 640 },
  { id: "read", label: "read_file ×3", kind: "tool", startMs: 5 * S, endMs: 6.8 * S },
  {
    id: "draft",
    label: "Draft patch",
    kind: "model",
    startMs: 7 * S,
    endMs: 19.5 * S,
    cost: 0.11,
    tokensIn: 6400,
    tokensOut: 2100,
    detail: [
      { label: "Model", value: "Claude Sonnet 5.5" },
      { label: "Retries", value: "0" },
    ],
  },
  { id: "approve", label: "Approval · migrate-db", kind: "approval", startMs: 19.5 * S, endMs: 50 * S },
  { id: "tests", label: "run_tests", kind: "tool", startMs: 50 * S, endMs: 59.1 * S },
  { id: "fix", label: "Fix rounding", kind: "model", startMs: 59.1 * S, endMs: 67 * S, cost: 0.06 },
  { id: "tests2", label: "run_tests", kind: "tool", startMs: 67 * S, endMs: 72.4 * S },
  { id: "summary", label: "Write summary", kind: "model", startMs: 71.4 * S, endMs: 74 * S, cost: 0.02 },
];

const RUNNING: TraceSpan[] = [...SPANS.slice(0, 5), { id: "fix", label: "Fix rounding", kind: "model", startMs: 59.1 * S, cost: 0.06 }];
const FAILED: TraceSpan[] = [...SPANS.slice(0, 4), { id: "tests", label: "run_tests", kind: "tool", startMs: 50 * S, endMs: 58 * S, failed: true }];
const noop = () => {};

export function TraceWaterfallDoc() {
  const [selected, setSelected] = useState<string | null>("draft");
  return (
    <AgentDocFrame
      id="tracewaterfall"
      name="TraceWaterfall"
      lede="Where a run's time and money went. Not BarChart. Not Meter."
      summary="Select a span to open its detail. Running spans draw dashed toward now."
      preview={<TraceWaterfall className={agentDoc.full} title="Run trace · Billing refactor" spans={SPANS} selectedId={selected} onSpanClick={setSelected} />}
      usage="TraceWaterfall explains one run. Kinds reuse existing roles (model primary, tool success, approval caution), and failed or running is always said in text."
      code={`<TraceWaterfall
  title="Run trace · Billing refactor"
  spans={spans}
  selectedId={spanId}
  onSpanClick={setSpanId}
/>`}
      variants={[
        {
          title: "Complete run — span selected",
          about: "Totals, an axis, one row per span, and the selected span's detail.",
          code: `<TraceWaterfall title="…" spans={spans} selectedId="draft" onSpanClick={setSpanId} />`,
          render: <TraceWaterfall className={agentDoc.full} title="Run trace · Billing refactor" spans={SPANS} selectedId="draft" onSpanClick={noop} />,
        },
        {
          title: "In progress — last span grows toward now",
          about: "A span without endMs draws dashed to the end; the legend explains the dash.",
          code: `<TraceWaterfall title="…" status="running" totalMs={62000} spans={spansSoFar} />`,
          render: <TraceWaterfall className={agentDoc.full} title="Run trace · Billing refactor" status="running" totalMs={62 * S} spans={RUNNING} onSpanClick={noop} />,
        },
        {
          title: "One failed span",
          about: "A failed span takes a danger well; the run's error sits under the spans.",
          code: `<TraceWaterfall title="…" status="failed" spans={spans} error="run_tests failed · 3 tests · exit code 1" />`,
          render: <TraceWaterfall className={agentDoc.full} title="Run trace · Billing refactor" status="failed" spans={FAILED} error="run_tests failed · 3 tests · exit code 1" onSpanClick={noop} />,
        },
        {
          title: "Compact — totals-only bar",
          about: "compact folds the trace into one line for a header.",
          code: `<TraceWaterfall title="…" spans={spans} compact />
<TraceWaterfall title="…" spans={spansSoFar} status="running" totalMs={62000} compact />`,
          render: (
            <div className={agentDoc.stack}>
              <TraceWaterfall className={agentDoc.trail} title="Run trace" spans={SPANS} compact />
              <TraceWaterfall className={agentDoc.trail} title="Run trace" spans={RUNNING} status="running" totalMs={62 * S} compact />
            </div>
          ),
        },
        {
          title: "Loading, error and empty",
          about: "Skeletons; a load error with Retry; a run with no spans yet.",
          code: `<TraceWaterfall title="…" spans={[]} loading />
<TraceWaterfall title="…" spans={[]} loadError="Couldn't load the trace for this run." onRetry={retry} />
<TraceWaterfall title="…" spans={[]} />`,
          render: (
            <div className={agentDoc.stack}>
              <TraceWaterfall className={agentDoc.full} title="Run trace · Billing refactor" spans={[]} loading />
              <TraceWaterfall className={agentDoc.full} title="Run trace · Billing refactor" spans={[]} loadError="Couldn't load the trace for this run." onRetry={noop} />
              <TraceWaterfall className={agentDoc.full} title="Run trace · Billing refactor" spans={[]} />
            </div>
          ),
        },
      ]}
    />
  );
}
