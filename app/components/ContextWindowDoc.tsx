"use client";

import { useState } from "react";
import { ContextWindow } from "agentic-ds-kit";
import type { ContextSegment } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const seg = (system: number, memory: number, tools: number, messages: number, reserved: number): ContextSegment[] => [
  { id: "system", label: "System", tokens: system },
  { id: "memory", label: "Memory", tokens: memory },
  { id: "tools", label: "Tools", tokens: tools },
  { id: "messages", label: "Messages", tokens: messages },
  { id: "reserved", label: "Reserved", tokens: reserved },
];

const STATES = {
  normal: { used: 104_000, segments: seg(6_200, 9_800, 21_400, 58_600, 8_000) },
  warning: { used: 171_000, segments: seg(10_200, 16_100, 35_200, 96_400, 13_200) },
  full: { used: 200_000, segments: seg(11_900, 18_800, 41_200, 112_700, 15_400) },
} as const;

const noop = () => {};

export function ContextWindowDoc() {
  const [state, setState] = useState<keyof typeof STATES>("normal");
  const data = STATES[state];
  return (
    <AgentDocFrame
      id="contextwindow"
      name="ContextWindow"
      lede="How full the prompt context is. Not a usage meter. Not Progress."
      summary="Pick a fill level: the number rolls, the warning appears at 80% and Trim oldest steps up."
      preview={
        <div className={agentDoc.stack}>
          <ContextWindow compact used={data.used} limit={200_000} />
          <ContextWindow used={data.used} limit={200_000} segments={data.segments} onTrim={noop} />
        </div>
      }
      controls={<DocOptions label="Fill" options={["normal", "warning", "full"] as const} value={state} onChange={setState} />}
      usage="ContextWindow is about one thread's prompt context. Plan usage is a different meter. Near limit and full are said in text and an icon, never colour alone."
      code={`<ContextWindow
  used={104000}
  limit={200000}
  segments={segments}
  onTrim={trimOldest}
/>`}
      variants={[
        {
          title: "Normal — 52% used",
          about: "Compact for a header; full card with what uses the space.",
          code: `<ContextWindow compact used={104000} limit={200000} />
<ContextWindow used={104000} limit={200000} segments={segments} onTrim={trim} />`,
          render: (
            <div className={agentDoc.stack}>
              <ContextWindow compact used={104_000} limit={200_000} />
              <ContextWindow used={104_000} limit={200_000} segments={STATES.normal.segments} onTrim={noop} />
            </div>
          ),
        },
        {
          title: "Warning — near limit (≥ 80%)",
          about: "warningAt (0.8) adds the Near limit badge and a warning line; Trim oldest turns outline.",
          code: `<ContextWindow used={171000} limit={200000} segments={segments} onTrim={trim} />`,
          render: (
            <div className={agentDoc.stack}>
              <ContextWindow compact used={171_000} limit={200_000} />
              <ContextWindow used={171_000} limit={200_000} segments={STATES.warning.segments} onTrim={noop} />
            </div>
          ),
        },
        {
          title: "Full",
          about: "At the limit the badge reads Full and the next turn drops the oldest messages.",
          code: `<ContextWindow used={200000} limit={200000} segments={segments} onTrim={trim} />`,
          render: (
            <div className={agentDoc.stack}>
              <ContextWindow compact used={200_000} limit={200_000} />
              <ContextWindow used={200_000} limit={200_000} segments={STATES.full.segments} onTrim={noop} />
            </div>
          ),
        },
        {
          title: "Loading, error and limit unknown",
          about: "loading shows skeletons; error offers Retry; without limit there is no percentage.",
          code: `<ContextWindow used={0} loading />
<ContextWindow used={0} error="Couldn't count tokens for this thread." onRetry={retry} />
<ContextWindow used={38400} />`,
          render: (
            <div className={agentDoc.stack}>
              <ContextWindow compact used={0} loading />
              <ContextWindow used={0} loading />
              <ContextWindow used={0} error="Couldn't count tokens for this thread." onRetry={noop} />
              <ContextWindow used={38_400} />
            </div>
          ),
        },
      ]}
    />
  );
}
