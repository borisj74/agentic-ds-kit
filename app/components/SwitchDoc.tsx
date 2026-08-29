"use client";

import { useState } from "react";
import { Switch } from "@/ui/Switch";
import type { SwitchSize } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SIZES: SwitchSize[] = ["sm", "md", "lg"];
const MASTER_LABEL = "Notifications";

function masterCode(size: SwitchSize, checked: boolean, disabled: boolean) {
  const lines = ["<Switch", `  label="${MASTER_LABEL}"`, `  size="${size}"`];
  lines.push(`  checked={${checked}}`);
  if (disabled) lines.push("  disabled");
  lines.push("  onChange={() => {}}", "/>");
  return lines.join("\n");
}

export function SwitchDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<SwitchSize>("md");
  const [checked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Switch</h1>
        <p className={styles.lede}>
          Immediate on/off. Pill track, role=switch. Not a Checkbox.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="switch-master">
        <div className={styles.masterHeader}>
          <h2 id="switch-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle the switch on the canvas. Size and disabled live in the panel.
          </p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "variants"}
              className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`}
              onClick={() => setTab("variants")}
            >
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <Switch
                    label={MASTER_LABEL}
                    size={size}
                    checked={checked}
                    onChange={setChecked}
                    disabled={disabled}
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
                  <span className={styles.panelLabel}>State</span>
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Instant settings only. Checkbox for multi-select or agree-to-terms. RadioGroup
                  for one of several. Unlabeled needs ariaLabel.
                </p>
              </div>
              <CodeBlock code={masterCode(size, checked, disabled)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Unlabeled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Switch
                      key={step}
                      size={step}
                      ariaLabel={MASTER_LABEL}
                      defaultChecked
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Unlabeled needs ariaLabel. Width fits the control.
                </p>
              </div>
              <CodeBlock
                code={SIZES.map(
                  (step) => `<Switch size="${step}" ariaLabel="${MASTER_LABEL}" />`,
                ).join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack} style={{ maxWidth: "20rem" }}>
                  <Switch size="sm" label="Small" defaultChecked />
                  <Switch size="md" label="Medium" defaultChecked />
                  <Switch size="lg" label="Large" defaultChecked />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  sm, md, and lg. Default is md.
                </p>
              </div>
              <CodeBlock
                code={'<Switch size="sm" label="Small" />\n<Switch size="md" label="Medium" />\n<Switch size="lg" label="Large" />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack} style={{ maxWidth: "20rem" }}>
                  <Switch label={MASTER_LABEL} disabled />
                  <Switch label={MASTER_LABEL} disabled defaultChecked />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disabled dims the control and blocks interaction. The disabled state is exposed
                  on the button.
                </p>
              </div>
              <CodeBlock
                code={`<Switch label="${MASTER_LABEL}" disabled />\n<Switch label="${MASTER_LABEL}" disabled defaultChecked />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Settings list</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack} style={{ maxWidth: "20rem" }}>
                  <Switch label="Notifications" defaultChecked />
                  <Switch label="Dark mode" />
                  <Switch label="Weekly digest" defaultChecked />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Labeled switches in a settings row. Label left, control right. Takes effect now.
                </p>
              </div>
              <CodeBlock
                code={'<Switch label="Notifications" defaultChecked />\n<Switch label="Dark mode" />\n<Switch label="Weekly digest" defaultChecked />'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
