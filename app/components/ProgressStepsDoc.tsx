"use client";

import { useState } from "react";
import { ProgressSteps } from "agentic-ds-kit";
import type { ProgressStepsOrientation, ProgressStepsSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ProgressStepsSize[] = ["sm", "md"];
const ORIENTATIONS: ProgressStepsOrientation[] = ["horizontal", "vertical"];
const CURRENTS = [0, 1, 2, 3, 4] as const;

const STEPS = [
  { id: "details", label: "Your details", description: "Name and email" },
  { id: "company", label: "Company details", description: "Website and location" },
  { id: "team", label: "Invite your team", description: "Start collaborating" },
  { id: "socials", label: "Add your socials", description: "Automatic sharing" },
];

const LABELS_ONLY = STEPS.map(({ id, label }) => ({ id, label }));

function masterCode(current: number, size: ProgressStepsSize, orientation: ProgressStepsOrientation) {
  const lines = ["<ProgressSteps", `  current={${current}}`];
  if (size !== "md") lines.push(`  size="${size}"`);
  if (orientation !== "horizontal") lines.push(`  orientation="${orientation}"`);
  lines.push("  steps={[");
  lines.push('    { id: "details", label: "Your details", description: "Name and email" },');
  lines.push('    { id: "company", label: "Company details", description: "Website and location" },');
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
        <h1 className={styles.heroTitle}>ProgressSteps</h1>
        <p className={styles.lede}>
          Ordered wizard steps: numbered circles, labels, and a connecting line. Complete, current,
          and upcoming. One piece. Not Progress. Not Timeline.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="progresssteps-master">
        <div className={styles.masterHeader}>
          <h2 id="progresssteps-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Step 2 of 4 current. Size, orientation, and current live in the panel. Checkmarks are
            complete. Brand ring is current.
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
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Checkout, onboarding, and multi-step forms. Do not use Progress (0–100) or
                  Timeline (now/next/later). Do not invent StepItem or Stepper cousins.
                </p>
              </div>
              <CodeBlock code={masterCode(current, size, orientation)} />
            </div>
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
                  '<ProgressSteps current={1} steps={[{ id: "details", label: "Your details" }, { id: "company", label: "Company details" }]} />'
                }
              />
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
                  Use vertical in a narrow column or sidebar. Timeline is still for now/next/later
                  roadmaps, not numbered wizards.
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
                      { id: "details", label: "Your details", description: "Name and email" },
                      {
                        id: "company",
                        label: "Company details",
                        description: "Fix the required fields",
                        status: "error",
                      },
                      { id: "team", label: "Invite your team", description: "Start collaborating" },
                    ]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Override status on a step for error. Do not invent an ErrorStep cousin.
                </p>
              </div>
              <CodeBlock
                code={
                  '<ProgressSteps current={1} steps={[{ id: "company", label: "Company details", status: "error" }]} />'
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
