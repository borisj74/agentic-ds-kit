"use client";

import { useState, type ReactNode } from "react";
import { Button, TaskBrief } from "agentic-ds-kit";
import type { MultiSelectOption, PickerModel, TaskBriefStatus, TaskBriefValue } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const TOOLS: MultiSelectOption[] = [
  { value: "read_sheet", label: "Read sheets" },
  { value: "edit_sheet", label: "Edit sheets" },
  { value: "search_catalog", label: "Search catalogue" },
  { value: "send_email", label: "Send email" },
];

const MODELS: PickerModel[] = [
  { id: "fast", name: "Swift 2", vendor: "Northwind", contextWindow: "200K", costTier: "$", tagline: "Quick edits", recommended: true },
  { id: "deep", name: "Atlas 4", vendor: "Northwind", contextWindow: "1M", costTier: "$$$", tagline: "Long, careful work" },
];

const EMPTY: TaskBriefValue = { goal: "", criteria: [""], tools: [], model: "fast", autonomy: "risk" };

const FILLED: TaskBriefValue = {
  goal: "Update the EU price list for the spring catalogue from the new supplier sheet.",
  criteria: [
    "Every SKU in the EU list has a 2027 price",
    "Totals per category match the supplier sheet",
    "No price drops more than 20% without a note",
  ],
  spendCap: 5,
  minutes: 30,
  maxSteps: 40,
  tools: ["read_sheet", "edit_sheet"],
  model: "fast",
  autonomy: "risk",
};

const noop = () => {};

const BASE_CODE = `const [brief, setBrief] = useState({ goal: "", criteria: [""] });

<TaskBrief
  value={brief}
  onChange={setBrief}
  tools={[{ value: "read_sheet", label: "Read sheets" }, { value: "edit_sheet", label: "Edit sheets" }]}
  models={models}
  onStart={start}
  onSaveDraft={save}
/>`;

function Controlled({ initial, status, errorMessage }: { initial: TaskBriefValue; status?: TaskBriefStatus; errorMessage?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <TaskBrief
      value={value}
      onChange={setValue}
      tools={TOOLS}
      models={MODELS}
      status={status}
      errorMessage={errorMessage}
      onStart={noop}
      onSaveDraft={noop}
    />
  );
}

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Empty — Start waits for a goal and a check",
    about:
      "Start is disabled and the reason sits beside it. Leaving Goal or the checks empty puts the error under the control, linked with aria-describedby.",
    code: `<TaskBrief value={{ goal: "", criteria: [""] }} onChange={setBrief} tools={tools} onStart={start} />`,
    render: <Controlled initial={EMPTY} />,
  },
  {
    title: "Filled — goal, three checks, limits",
    about: "Limits are optional and stack on phones. Tools limit what the agent may call; the check-in level is a kit AutonomyDial.",
    code: `<TaskBrief value={brief} onChange={setBrief} tools={tools} models={models} onStart={start} onSaveDraft={save} />`,
    render: <Controlled initial={FILLED} />,
  },
  {
    title: "Error — start failed, form kept",
    about: "status error shows a kit Alert above the footer and keeps every field as it was, so the person can try again.",
    code: `<TaskBrief status="error" errorMessage="Couldn't start the task. The agent pool is busy, try again in a minute." … />`,
    render: <Controlled initial={FILLED} status="error" errorMessage="Couldn't start the task. The agent pool is busy, try again in a minute." />,
  },
  {
    title: "Started — one line",
    about: "status started folds the brief to one line: the goal, the number of checks and the limits that are set.",
    code: `<TaskBrief status="started" value={brief} />`,
    render: <TaskBrief status="started" value={FILLED} />,
  },
];

export function TaskBriefDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [value, setValue] = useState<TaskBriefValue>(FILLED);
  const [status, setStatus] = useState<TaskBriefStatus>("draft");

  function start() {
    setStatus("starting");
    window.setTimeout(() => setStatus("started"), 1200);
  }

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>TaskBrief</h2>
        <p className={styles.lede}>The brief before the plan: goal, done-when checks, limits. Not PlanReview. Not Chat.</p>
      </header>

      <section className={styles.master} aria-labelledby="taskbrief-master">
        <div className={styles.masterHeader}>
          <h2 id="taskbrief-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Fill it in and Start. Start goes through starting to one line.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={agentDoc.trail}>
                  <TaskBrief
                    value={value}
                    onChange={setValue}
                    tools={TOOLS}
                    models={MODELS}
                    status={status}
                    onStart={start}
                    onSaveDraft={noop}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={() => setStatus("draft")}>
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    appearance="outline"
                    mode="neutral"
                    iconStart="X"
                    onClick={() => {
                      setValue(EMPTY);
                      setStatus("draft");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  TaskBrief is what a person hands an agent before it plans. Each &quot;done when&quot; check is one line the
                  result must pass; DoneCheck marks them after the run. The plan itself is a PlanReview.
                </p>
              </div>
              <CodeBlock code={BASE_CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANT_DOCS.map((doc) => (
              <section key={doc.title} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={agentDoc.trail}>{doc.render}</div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{doc.about}</p>
                </div>
                <CodeBlock code={doc.code} />
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
