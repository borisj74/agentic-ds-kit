"use client";

import { useState } from "react";
import { Checkbox } from "agentic-ds-kit";
import type { CheckboxSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: CheckboxSize[] = ["sm", "md", "lg"];
const LABEL_MODES = ["labeled", "unlabeled"] as const;

type LabelMode = (typeof LABEL_MODES)[number];

const MASTER_LABEL = "Send me product updates";
const MASTER_ARIA = "Select row";

function masterCode(
  size: CheckboxSize,
  checked: boolean,
  indeterminate: boolean,
  error: boolean,
  disabled: boolean,
  labeled: boolean,
) {
  const lines = ["<Checkbox", '  id="updates"', `  size="${size}"`];
  if (labeled) {
    lines.push(`  label="${MASTER_LABEL}"`);
  } else {
    lines.push(`  ariaLabel="${MASTER_ARIA}"`);
  }
  lines.push(`  checked={${checked}}`);
  if (indeterminate) lines.push("  indeterminate");
  if (error) lines.push("  error");
  if (disabled) lines.push("  disabled");
  lines.push("  onChange={() => {}}");
  lines.push("/>");
  return lines.join("\n");
}

export function CheckboxDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<CheckboxSize>("md");
  const [labelMode, setLabelMode] = useState<LabelMode>("labeled");
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const labeled = labelMode === "labeled";

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Checkboxes</h1>
        <p className={styles.lede}>
          Multi-select and confirmations. Each in lg, md, and sm. Label optional.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="checkbox-master">
        <div className={styles.masterHeader}>
          <h2 id="checkbox-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size, label, and states to preview every Checkbox combination.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Checkbox
                    id="master-checkbox"
                    size={size}
                    checked={checked}
                    onChange={setChecked}
                    indeterminate={indeterminate}
                    error={error}
                    disabled={disabled}
                    label={labeled ? MASTER_LABEL : undefined}
                    ariaLabel={labeled ? undefined : MASTER_ARIA}
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
                  <span className={styles.panelLabel}>Label</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Label">
                    {LABEL_MODES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="checkbox-label"
                          value={option}
                          checked={labelMode === option}
                          onChange={() => setLabelMode(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Checked" size="sm" checked={checked} onChange={setChecked} />
                  <Switch label="Indeterminate" size="sm" checked={indeterminate} onChange={setIndeterminate} />
                  <Switch label="Error" size="sm" checked={error} onChange={setError} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  RadioGroup for exclusive choice. Unlabeled needs ariaLabel. Indeterminate only for a
                  parent that reflects mixed children.
                </p>
              </div>
              <CodeBlock code={masterCode(size, checked, indeterminate, error, disabled, labeled)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Checkbox
                      key={step}
                      id={`sizes-${step}`}
                      size={step}
                      label={MASTER_LABEL}
                      defaultChecked
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Show lg, md, and sm when hierarchy or density changes. Default is md.
                </p>
              </div>
              <CodeBlock
                code={SIZES.map(
                  (step) =>
                    `<Checkbox id="updates-${step}" size="${step}" label="${MASTER_LABEL}" />`,
                ).join("\n")}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Unlabeled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Checkbox
                      key={step}
                      id={`unlabeled-${step}`}
                      size={step}
                      ariaLabel={MASTER_ARIA}
                      defaultChecked
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Unlabeled needs ariaLabel. Use for table rows or other slots with no visible text.
                </p>
              </div>
              <CodeBlock
                code={SIZES.map(
                  (step) => `<Checkbox id="row-${step}" size="${step}" ariaLabel="${MASTER_ARIA}" />`,
                ).join("\n")}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Checkbox id="error-unchecked" label="Accept terms" error />
                  <Checkbox id="error-checked" label={MASTER_LABEL} error defaultChecked />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Error describes a problem on this control. Pair with Field when a message is needed
                  below.
                </p>
              </div>
              <CodeBlock code={'<Checkbox id="terms" label="Accept terms" error />'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Checkbox id="disabled-off" label={MASTER_LABEL} disabled />
                  <Checkbox id="disabled-on" label={MASTER_LABEL} disabled defaultChecked />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disabled dims the control and blocks interaction. The disabled state is exposed on
                  the input.
                </p>
              </div>
              <CodeBlock code={`<Checkbox id="updates" label="${MASTER_LABEL}" disabled />`} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Indeterminate</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Checkbox id="indeterminate-demo" label="Select all" indeterminate defaultChecked />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Indeterminate only for a parent that reflects mixed children. It is aria-checked
                  mixed and shows a minus, even if checked is also set.
                </p>
              </div>
              <CodeBlock
                code={'<Checkbox id="select-all" label="Select all" indeterminate />'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
