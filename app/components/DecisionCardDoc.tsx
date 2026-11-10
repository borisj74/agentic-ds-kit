"use client";

import { useState } from "react";
import { Button, DecisionCard } from "agentic-ds-kit";
import type { DecisionCardStatus, DecisionOption } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";
import styles from "./ComponentDoc.module.css";

const OPTIONS: DecisionOption[] = [
  { id: "keep", label: "Keep v1 endpoint for 30 days", description: "Safer; clients migrate on their own time.", recommended: true },
  { id: "remove", label: "Remove v1 now", description: "Faster; breaks 3 known clients." },
  { id: "ask", label: "Ask the API team first", description: "Pauses the run until they reply." },
];

const Q = "The v1 invoices endpoint has 3 callers. What should I do with it?";
const BASE = { title: "Billing refactor asks", meta: "paused · 0:42", question: Q, options: OPTIONS };
const noop = () => {};

export function DecisionCardDoc() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<DecisionCardStatus>("pending");
  const [mode, setMode] = useState<"choices" | "free text">("choices");

  function confirm() {
    setStatus("sending");
    window.setTimeout(() => setStatus("resolved"), 1000);
  }

  return (
    <AgentDocFrame
      id="decisioncard"
      name="DecisionCard"
      lede="The agent asks and waits. Not ApprovalCard. Not AlertDialog."
      summary="Pick an option, confirm (⌘/Ctrl+Enter), and the card resolves to one line."
      preview={
        <div className={agentDoc.stack}>
          {mode === "choices" ? (
            <DecisionCard {...BASE} value={value} onValueChange={setValue} status={status} onConfirm={confirm} onSkip={() => setStatus("skipped")} resolvedAt="14:03" resolvedLabel={status === "skipped" ? "agent used its default: keep v1" : undefined} />
          ) : (
            <DecisionCard title="Docs sweep asks" meta="paused · 1:10" question="Which style guide should headings follow?" allowFreeText value={value} onValueChange={setValue} status={status} onConfirm={confirm} onSkip={() => setStatus("skipped")} resolvedAt="14:03" />
          )}
        </div>
      }
      controls={
        <>
          <DocOptions
            label="Answer"
            options={["choices", "free text"] as const}
            value={mode}
            onChange={(next) => {
              setMode(next);
              setValue("");
              setStatus("pending");
            }}
          />
          <div className={styles.panelGroup}>
            <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={() => { setStatus("pending"); setValue(""); }}>
              Reset
            </Button>
          </div>
        </>
      }
      usage="DecisionCard pauses the agent for a choice. The recommended option is a quiet badge, never preselected. Confirm is the one solid primary; one action to approve is an ApprovalCard."
      code={`<DecisionCard
  title="Billing refactor asks"
  meta="paused · 0:42"
  question="${Q}"
  options={options}
  value={value}
  onValueChange={setValue}
  onConfirm={send}
  onSkip={skip}
/>`}
      variants={[
        {
          title: "Pending — multiple choice",
          about: "Options are a kit RadioGroup in card layout. Confirm stays disabled until something is chosen.",
          code: `<DecisionCard title="Billing refactor asks" meta="paused · 0:42" question="…" options={options} onConfirm={send} onSkip={skip} />`,
          render: <DecisionCard {...BASE} onConfirm={noop} onSkip={noop} />,
        },
        {
          title: "Pending — free text",
          about: "Without options (allowFreeText), the card asks for a short answer in a Field-wrapped Textarea.",
          code: `<DecisionCard title="Docs sweep asks" question="Which style guide should headings follow?" allowFreeText value={value} onValueChange={setValue} onConfirm={send} onSkip={skip} />`,
          render: <DecisionCard title="Docs sweep asks" meta="paused · 1:10" question="Which style guide should headings follow?" allowFreeText value="Use the Nistha writing guide, sentence case." onConfirm={noop} onSkip={noop} />,
        },
        {
          title: "Selected, not confirmed",
          about: "The chosen option takes the selection ring; Confirm turns on.",
          code: `<DecisionCard … value="keep" />`,
          render: <DecisionCard {...BASE} value="keep" onConfirm={noop} onSkip={noop} />,
        },
        {
          title: "Loading — sending answer",
          about: "status sending dims the options, disables Skip and spins Confirm. The card is aria-busy.",
          code: `<DecisionCard … value="keep" status="sending" />`,
          render: <DecisionCard {...BASE} value="keep" status="sending" onConfirm={noop} onSkip={noop} />,
        },
        {
          title: "Error — answer not sent",
          about: "status error keeps the choice and says why. Confirm again to retry.",
          code: `<DecisionCard … value="keep" status="error" errorMessage="The agent stopped before your answer arrived." />`,
          render: <DecisionCard {...BASE} value="keep" status="error" errorMessage="The agent stopped before your answer arrived." onConfirm={noop} onSkip={noop} />,
        },
        {
          title: "Resolved and skipped — one line",
          about: "Resolved shows the chosen label; skipped says what the agent did instead.",
          code: `<DecisionCard … status="resolved" value="keep" resolvedAt="14:03" />
<DecisionCard … status="skipped" resolvedLabel="agent used its default: keep v1" resolvedAt="14:03" />`,
          render: (
            <div className={agentDoc.stack}>
              <DecisionCard {...BASE} status="resolved" value="keep" resolvedAt="14:03" />
              <DecisionCard {...BASE} status="skipped" resolvedLabel="agent used its default: keep v1" resolvedAt="14:03" />
            </div>
          ),
        },
      ]}
    />
  );
}
