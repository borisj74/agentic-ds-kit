"use client";

import { useState } from "react";
import { RadioGroup } from "@/ui/RadioGroup";
import type { RadioGroupSize } from "@/ui/RadioGroup";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: RadioGroupSize[] = ["lg", "md", "sm"];
const PLAN = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Studio Pro" },
];
const PREVIEW = { maxWidth: "20rem", width: "100%", marginInline: "auto" } as const;

function masterCode(size: RadioGroupSize, error: boolean, disabled: boolean) {
  const lines = [
    "<RadioGroup",
    '  name="plan"',
    '  legend="Plan"',
    `  size="${size}"`,
    '  value="pro"',
  ];
  if (error) lines.push('  error="Select a plan to continue."');
  if (disabled) lines.push("  disabled");
  lines.push("  options={plan}", "  onChange={() => {}}", "/>");
  return lines.join("\n");
}

export function RadioGroupDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<RadioGroupSize>("lg");
  const [plan, setPlan] = useState("pro");
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>RadioGroup</h1>
        <p className={styles.lede}>
          Single-select choices for settings and forms. Each in lg, md, and sm. One piece. Not a
          Radio cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="radio-master">
        <div className={styles.masterHeader}>
          <h2 id="radio-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size and states to preview every RadioGroup combination.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW}>
                  <RadioGroup
                    name="plan-master"
                    legend="Plan"
                    size={size}
                    options={PLAN}
                    value={plan}
                    onChange={setPlan}
                    disabled={disabled}
                    error={error ? "Select a plan to continue." : undefined}
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
                  <span className={styles.panelLabel}>States</span>
                  <div className={styles.previewStack}>
                    <Switch label="Error" size="sm" checked={error} onChange={setError} />
                    <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use radios for a single choice in a short list. Group related options and keep
                  one selected value per group. Do not invent Radio.
                </p>
              </div>
              <CodeBlock code={masterCode(size, error, disabled)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack} style={PREVIEW}>
                  {SIZES.map((step) => (
                    <RadioGroup
                      key={step}
                      name={`plan-${step}`}
                      legend={`Plan (${step})`}
                      size={step}
                      options={PLAN}
                      defaultValue="pro"
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use lg when the choice is a primary decision, md for most forms, and sm in dense
                  filters or side panels.
                </p>
              </div>
              <CodeBlock
                code={SIZES.map(
                  (step) =>
                    `<RadioGroup name="plan" legend="Plan (${step})" size="${step}" defaultValue="pro" options={plan} />`,
                ).join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW}>
                  <RadioGroup
                    name="plan-error"
                    legend="Plan"
                    size="lg"
                    options={PLAN}
                    error="Select a plan to continue."
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Show error on the group when a choice is required and still empty, or when the
                  selection is not allowed. Keep the message specific.
                </p>
              </div>
              <CodeBlock
                code={'<RadioGroup name="plan" legend="Plan" size="lg" error="Select a plan to continue." options={plan} />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled option</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW}>
                  <RadioGroup
                    name="region"
                    legend="Region"
                    size="lg"
                    defaultValue="us"
                    options={[
                      { value: "us", label: "United States" },
                      { value: "eu", label: "Europe", disabled: true },
                    ]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disable a single option when it is unavailable for the current account. Keep the
                  label readable so people know what they are missing.
                </p>
              </div>
              <CodeBlock
                code={
                  '<RadioGroup name="region" legend="Region" defaultValue="us" options={[{ value: "us", label: "United States" }, { value: "eu", label: "Europe", disabled: true }]} />'
                }
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled group</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW}>
                  <RadioGroup
                    name="seat"
                    legend="Seat type"
                    size="lg"
                    defaultValue="editor"
                    disabled
                    options={[
                      { value: "viewer", label: "Viewer" },
                      { value: "editor", label: "Editor" },
                    ]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disable the whole group when the parent step or permission locks the choice.
                </p>
              </div>
              <CodeBlock
                code={'<RadioGroup name="seat" legend="Seat type" defaultValue="editor" disabled options={seats} />'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
