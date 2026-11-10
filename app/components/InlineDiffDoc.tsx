"use client";

import { useState } from "react";
import { Button, InlineDiff } from "agentic-ds-kit";
import type { DiffLine, InlineDiffStatus } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";
import styles from "./ComponentDoc.module.css";

const LINES: DiffLine[] = [
  { type: "context", text: "const subtotal = sumLines(lines);", oldNo: 41, newNo: 41 },
  { type: "remove", text: "return subtotal * (1 + rate);", oldNo: 42 },
  { type: "add", text: "const total = subtotal * (1 + rate);", newNo: 42 },
  { type: "add", text: "return Math.round(total * 100) / 100;", newNo: 43 },
];
const BASE = {
  title: "Proposed edit · calcTotal",
  file: "src/billing/invoice.ts",
  hunkHeader: "@@ -41,2 +41,3 @@ calcTotal",
  lines: LINES,
  hunkLabel: "1 of 2 hunks",
};
const noop = () => {};

export function InlineDiffDoc() {
  const [status, setStatus] = useState<InlineDiffStatus>("pending");
  const [mode, setMode] = useState<"unified" | "split">("unified");
  return (
    <AgentDocFrame
      id="inlinediff"
      name="InlineDiff"
      lede="Accept or reject a proposed edit in place. Not ApprovalCard. Not CodeSnippet."
      summary="Accept (⌘/Ctrl+Enter) or Reject (Escape) and the card settles to one line."
      preview={
        <InlineDiff
          className={agentDoc.trail}
          {...BASE}
          mode={mode}
          status={status}
          onAccept={() => setStatus("accepted")}
          onReject={() => setStatus("rejected")}
          onAcceptAll={() => setStatus("accepted")}
          resolvedSummary={status === "accepted" ? "calcTotal · +2 −1 · src/billing/invoice.ts" : "calcTotal · kept the original"}
          resolvedAt="14:03"
        />
      }
      controls={
        <>
          <DocOptions label="Mode" options={["unified", "split"] as const} value={mode} onChange={setMode} />
          <div className={styles.panelGroup}>
            <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={() => setStatus("pending")}>
              Reset
            </Button>
          </div>
        </>
      }
      usage="InlineDiff reviews one proposed edit. Changes always carry + / − marks and say Added / Removed to screen readers. Accept is the one solid primary."
      code={`<InlineDiff
  title="Proposed edit · calcTotal"
  file="src/billing/invoice.ts"
  hunkHeader="@@ -41,2 +41,3 @@ calcTotal"
  lines={lines}
  hunkLabel="1 of 2 hunks"
  onAccept={accept}
  onReject={reject}
  onAcceptAll={acceptAll}
/>`}
      variants={[
        {
          title: "Pending — unified, multiline",
          about: "Line numbers, + / − marks, success and danger wells.",
          code: `<InlineDiff title="Proposed edit · calcTotal" file="…" hunkHeader="…" lines={lines} onAccept={accept} onReject={reject} onAcceptAll={acceptAll} />`,
          render: <InlineDiff className={agentDoc.trail} {...BASE} onAccept={noop} onReject={noop} onAcceptAll={noop} />,
        },
        {
          title: "Pending — split mode",
          about: "mode=\"split\" shows before and after side by side.",
          code: `<InlineDiff … mode="split" />`,
          render: <InlineDiff className={agentDoc.trail} {...BASE} mode="split" onAccept={noop} onReject={noop} onAcceptAll={noop} />,
        },
        {
          title: "Pending — inline phrase in a paragraph",
          about: "mode=\"inline\" marks the removed and added phrase inside prose with del and ins.",
          code: `<InlineDiff title="Suggested wording · README" mode="inline" segments={[{ type: "same", text: "Totals are rounded " }, { type: "remove", text: "to two decimals" }, { type: "add", text: "half-even in integer cents" }, { type: "same", text: " before tax is applied." }]} onAccept={accept} onReject={reject} />`,
          render: (
            <InlineDiff
              className={agentDoc.trail}
              title="Suggested wording · README"
              mode="inline"
              segments={[
                { type: "same", text: "Totals are rounded " },
                { type: "remove", text: "to two decimals" },
                { type: "add", text: "half-even in integer cents" },
                { type: "same", text: " before tax is applied." },
              ]}
              onAccept={noop}
              onReject={noop}
            />
          ),
        },
        {
          title: "Accepted and rejected — one line",
          about: "Resolved diffs collapse to a line that stays in the log.",
          code: `<InlineDiff … status="accepted" resolvedSummary="calcTotal · +2 −1 · src/billing/invoice.ts" resolvedAt="14:03" />
<InlineDiff … status="rejected" resolvedSummary="calcTotal · kept the original" resolvedAt="14:03" />`,
          render: (
            <div className={agentDoc.stack}>
              <InlineDiff className={agentDoc.trail} {...BASE} status="accepted" resolvedSummary="calcTotal · +2 −1 · src/billing/invoice.ts" resolvedAt="14:03" />
              <InlineDiff className={agentDoc.trail} {...BASE} status="rejected" resolvedSummary="calcTotal · kept the original" resolvedAt="14:03" />
            </div>
          ),
        },
        {
          title: "Disabled — file changed since the proposal",
          about: "status=\"stale\" mutes the diff, disables the actions and says why.",
          code: `<InlineDiff … status="stale" staleReason="invoice.ts changed after this edit was proposed. Ask for a fresh diff." />`,
          render: <InlineDiff className={agentDoc.trail} {...BASE} status="stale" staleReason="invoice.ts changed after this edit was proposed. Ask for a fresh diff." onAccept={noop} onReject={noop} onAcceptAll={noop} />,
        },
        {
          title: "Loading, error and empty",
          about: "Preparing, a failed apply with Retry, and no changes to review.",
          code: `<InlineDiff title="…" status="loading" />
<InlineDiff title="…" status="error" errorMessage="Couldn't apply the edit: the patch no longer matches line 42." onRetry={retry} />
<InlineDiff title="…" status="empty" />`,
          render: (
            <div className={agentDoc.stack}>
              <InlineDiff className={agentDoc.trail} title="Proposed edit · calcTotal" status="loading" />
              <InlineDiff className={agentDoc.trail} title="Proposed edit · calcTotal" status="error" errorMessage="Couldn't apply the edit: the patch no longer matches line 42." onRetry={noop} />
              <InlineDiff className={agentDoc.trail} title="Proposed edit · calcTotal" status="empty" />
            </div>
          ),
        },
      ]}
    />
  );
}
