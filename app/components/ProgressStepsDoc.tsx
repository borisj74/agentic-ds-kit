"use client";

import { useState } from "react";
import { ProgressSteps } from "agentic-ds-kit";
import type { ProgressStepsOrientation, ProgressStepsSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: ProgressStepsSize[] = ["sm", "md"];
const ORIENTATIONS: ProgressStepsOrientation[] = ["horizontal", "vertical"];
const CURRENTS = [0, 1, 2, 3, 4] as const;

const STEPS = [
  { id: "plan", label: "Plan", description: "Starter to Growth" },
  { id: "billing", label: "Billing", description: "Visa ending 4242" },
  { id: "addons", label: "Add-ons", description: "Extra seats", optional: true },
  { id: "review", label: "Review", description: "$48/mo from Dec 1" },
];

const LABELS_ONLY = STEPS.map(({ id, label, optional }) => ({ id, label, optional }));

function masterCode(current: number, size: ProgressStepsSize, orientation: ProgressStepsOrientation) {
  const lines = ["<ProgressSteps", `  current={${current}}`];
  if (size !== "md") lines.push(`  size="${size}"`);
  if (orientation !== "horizontal") lines.push(`  orientation="${orientation}"`);
  lines.push("  onStepClick={(index) => setCurrent(index)}");
  lines.push("  steps={[");
  lines.push('    { id: "plan", label: "Plan", description: "Starter to Growth" },');
  lines.push('    { id: "billing", label: "Billing", description: "Visa ending 4242" },');
  lines.push('    { id: "addons", label: "Add-ons", description: "Extra seats", optional: true },');
  lines.push('    { id: "review", label: "Review", description: "$48/mo from Dec 1" },');
  lines.push("  ]}");
  lines.push("/>");
  return lines.join("\n");
}

export function ProgressStepsDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ProgressStepsSize>("md");
  const [orientation, setOrientation] = useState<ProgressStepsOrientation>("horizontal");
  const [current, setCurrent] = useState(1);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>ProgressSteps</h2>
        <p className={styles.lede}>
          Ordered steps for a required sequence, like a plan change or checkout. Each step shows a
          marker and a word: Done, Current, Upcoming, Error or Optional. Not Progress, Timeline or
          SetupGuide.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="progresssteps-master">
        <div className={styles.masterHeader}>
          <h2 id="progresssteps-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Northwind changing from Starter to Growth, step 2 of 4. Click a Done step to go back.
            Add-ons is optional, so its marker is dashed.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <ProgressSteps
                    steps={STEPS}
                    current={current}
                    size={size}
                    orientation={orientation}
                    onStepClick={(index) => setCurrent(index)}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={size === step}
                        onClick={() => setSize(step)}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Orientation</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Orientation">
                    {ORIENTATIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${orientation === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={orientation === option}
                        onClick={() => setOrientation(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Current</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Current step">
                    {CURRENTS.map((index) => (
                      <button
                        key={index}
                        type="button"
                        className={`${styles.sizeTab} ${current === index ? styles.sizeTabActive : ""}`}
                        aria-pressed={current === index}
                        onClick={() => setCurrent(index)}
                      >
                        {index === 4 ? "done" : String(index + 1)}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A required sequence such as a plan change, checkout or a multi-step form. Done steps
                  are buttons when you pass onStepClick. Upcoming steps are not. Put Back and Continue
                  under it with kit Button: Back neutral, Continue the one primary. For a skippable
                  first-run checklist use SetupGuide.
                </p>
              </div>
              <CodeBlock code={masterCode(current, size, orientation)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Labels only</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ProgressSteps steps={LABELS_ONLY} current={1} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Description is optional. Same piece.
                </p>
              </div>
              <CodeBlock
                code={
                  '<ProgressSteps current={1} steps={[{ id: "plan", label: "Plan" }, { id: "billing", label: "Billing" }]} />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Compact</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewNarrow}>
                  <ProgressSteps steps={STEPS} current={1} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Same props. When the container is narrower than 30rem, horizontal steps show Step n
                  of m, the current label, and a Progress bar with the next step in words.
                </p>
              </div>
              <CodeBlock code={'<ProgressSteps current={1} steps={[...]} />'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Vertical</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ProgressSteps steps={STEPS} current={1} orientation="vertical" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use vertical in a side column or a drawer. Timeline is still for now/next/later
                  roadmaps, not numbered steps.
                </p>
              </div>
              <CodeBlock
                code={'<ProgressSteps current={1} orientation="vertical" steps={[...]} />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ProgressSteps
                    current={1}
                    steps={[
                      { id: "plan", label: "Plan", description: "Starter to Growth" },
                      {
                        id: "billing",
                        label: "Billing",
                        description: "Card declined",
                        status: "error",
                      },
                      { id: "review", label: "Review", description: "$48/mo from Dec 1" },
                    ]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Set status to error on a step. It keeps the X and shows the word Error. Do not invent
                  an ErrorStep cousin.
                </p>
              </div>
              <CodeBlock
                code={
                  '<ProgressSteps current={1} steps={[{ id: "billing", label: "Billing", status: "error" }]} />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Small</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ProgressSteps steps={LABELS_ONLY} current={2} size="sm" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm shrinks the marker to space-6.</p>
              </div>
              <CodeBlock code={'<ProgressSteps current={2} size="sm" steps={[...]} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
