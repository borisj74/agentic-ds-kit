"use client";

import { useState } from "react";
import { AgentSteering } from "agentic-ds-kit";
import type { AgentSteeringStatus } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const BASE = { name: "Billing refactor", meta: "step 6 · editing invoice.ts", elapsed: "02:14" };
const SUGGESTIONS = ["Focus on refunds", "Skip the docs", "Smaller PRs"];
const CONFIRM = { title: "Stop this run?", description: "2 files are half-edited. Stopping leaves them as they are; nothing is rolled back." };
const noop = () => {};

export function AgentSteeringDoc() {
  const [status, setStatus] = useState<AgentSteeringStatus>("running");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [applied, setApplied] = useState<string | undefined>();

  function steer(value: string) {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setApplied(`${value.toLowerCase()} · 14:03`);
      setText("");
    }, 900);
  }

  return (
    <AgentDocFrame
      id="agentsteering"
      name="AgentSteering"
      lede="Redirect, pause or stop a running agent. Not DecisionCard. Not AgentPlan."
      summary="Type a steer and press Enter. Pause, resume, or stop (confirmed in an AlertDialog)."
      preview={
        <AgentSteering
          {...BASE}
          status={status}
          value={text}
          onValueChange={setText}
          onSteer={steer}
          sending={sending}
          applied={applied}
          suggestions={SUGGESTIONS}
          onPause={() => setStatus("paused")}
          onResume={() => setStatus("running")}
          onStop={() => setStatus("stopped")}
          stopConfirm={CONFIRM}
          stoppedNote="Stopped by you · 14:05 · 2 files left as edited"
          onOpenTrail={noop}
        />
      }
      controls={
        <DocOptions
          label="Status"
          options={["running", "paused", "stopped", "done"] as const}
          value={status}
          onChange={(next) => {
            setStatus(next);
            setApplied(undefined);
          }}
        />
      }
      usage="AgentSteering redirects a run in a sentence. Send is the one solid primary; Stop is outline danger and confirms in a kit AlertDialog when work can't be undone."
      code={`<AgentSteering
  name="Billing refactor"
  meta="step 6 · editing invoice.ts"
  elapsed="02:14"
  value={text}
  onValueChange={setText}
  onSteer={steer}
  suggestions={["Focus on refunds", "Skip the docs", "Smaller PRs"]}
  onPause={pause}
  onStop={stop}
  stopConfirm={{ title: "Stop this run?", description: "2 files are half-edited." }}
/>`}
      variants={[
        {
          title: "Running — composer ready",
          about: "Quick steers fill the composer. Send stays off until there is text.",
          code: `<AgentSteering … suggestions={suggestions} onSteer={steer} />`,
          render: <AgentSteering {...BASE} suggestions={SUGGESTIONS} onSteer={noop} onValueChange={noop} onPause={noop} onStop={noop} />,
        },
        {
          title: "Submitting a steer",
          about: "sending spins the send button and marks the card aria-busy.",
          code: `<AgentSteering … value="Focus on refunds, leave tax for later" sending />`,
          render: <AgentSteering {...BASE} value="Focus on refunds, leave tax for later" sending onPause={noop} onStop={noop} />,
        },
        {
          title: "Steering applied",
          about: "applied confirms what landed and when.",
          code: `<AgentSteering … applied="focus on refunds · 14:03" />`,
          render: <AgentSteering {...BASE} applied="focus on refunds · 14:03" onSteer={noop} onPause={noop} onStop={noop} />,
        },
        {
          title: "Paused",
          about: "Paused swaps Pause for Resume; the composer takes a note for the resume.",
          code: `<AgentSteering … status="paused" onResume={resume} />`,
          render: <AgentSteering {...BASE} status="paused" onSteer={noop} onResume={noop} onStop={noop} />,
        },
        {
          title: "Stopped",
          about: "Stopped shows who stopped it and what was left, with Open trail.",
          code: `<AgentSteering … status="stopped" stoppedNote="Stopped by you · 14:05 · 2 files left as edited" onOpenTrail={openTrail} />`,
          render: <AgentSteering {...BASE} status="stopped" stoppedNote="Stopped by you · 14:05 · 2 files left as edited" onOpenTrail={noop} />,
        },
        {
          title: "Disabled — agent already finished",
          about: "done turns steering off and keeps the layout.",
          code: `<AgentSteering … status="done" suggestions={suggestions} />`,
          render: <AgentSteering {...BASE} status="done" suggestions={SUGGESTIONS} />,
        },
        {
          title: "Error — steer not delivered",
          about: "error keeps the text and offers Retry.",
          code: `<AgentSteering … value="Focus on refunds" error="Couldn't reach the agent. Your text is kept." onRetry={retry} />`,
          render: <AgentSteering {...BASE} value="Focus on refunds" error="Couldn't reach the agent. Your text is kept." onRetry={noop} onSteer={noop} onPause={noop} onStop={noop} />,
        },
        {
          title: "Loading",
          about: "loading shows skeletons.",
          code: `<AgentSteering name="Billing refactor" loading />`,
          render: <div className={agentDoc.stack}><AgentSteering {...BASE} loading /></div>,
        },
      ]}
    />
  );
}
