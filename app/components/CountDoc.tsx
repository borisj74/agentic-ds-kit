"use client";

import { useState } from "react";
import { Count } from "agentic-ds-kit";
import type { CountIntent, CountSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: CountSize[] = ["sm", "md", "lg"];
const INTENTS: CountIntent[] = ["info", "danger", "neutral"];

function masterCode(intent: CountIntent, size: CountSize, subtle: boolean, disabled: boolean) {
  const lines = ["<Count", "  count={3}"];
  if (intent !== "info") lines.push(`  intent="${intent}"`);
  if (size !== "md") lines.push(`  size="${size}"`);
  if (subtle) lines.push("  subtle");
  if (disabled) lines.push("  disabled");
  lines.push('  label="unread messages"', "/>");
  return lines.join("\n");
}

export function CountDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<CountSize>("md");
  const [intent, setIntent] = useState<CountIntent>("info");
  const [subtle, setSubtle] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Count</h1>
        <p className={styles.lede}>
          Small number badge for unread or pending counts. Not Badge. Not a button. Counts above max
          show as max+.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="count-master">
        <div className={styles.masterHeader}>
          <h2 id="count-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Three unread. Intent, size, subtle, and disabled live in the panel.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Count count={3} intent={intent} size={size} subtle={subtle} disabled={disabled} label="unread messages" />
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
                  <span className={styles.panelLabel}>Intent</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Intent">
                    {INTENTS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="count-intent"
                          value={option}
                          checked={intent === option}
                          onChange={() => setIntent(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Subtle" size="sm" checked={subtle} onChange={setSubtle} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass label so screen readers hear 3 unread messages, not just 3. Badge is for words.
                </p>
              </div>
              <CodeBlock code={masterCode(intent, size, subtle, disabled)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Intents</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Count intent="info" count={3} />
                  <Count intent="danger" count={8} />
                  <Count intent="neutral" count={24} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  info is the default ink fill. danger for items that need action now. neutral for plain
                  totals.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Count intent="info" count={3} />\n<Count intent="danger" count={8} />\n<Count intent="neutral" count={24} />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Subtle</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Count intent="info" subtle count={3} />
                  <Count intent="danger" subtle count={8} />
                  <Count intent="neutral" subtle count={24} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Lighter fill for quieter counts, like totals in a list.</p>
              </div>
              <CodeBlock
                code={
                  '<Count intent="info" subtle count={3} />\n<Count intent="danger" subtle count={8} />\n<Count intent="neutral" subtle count={24} />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes and max</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Count size="sm" count={3} />
                  <Count size="md" count={3} />
                  <Count size="lg" count={3} />
                  <Count count={150} />
                  <Count count={12} max={9} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Counts above max show max+. The default max is 99.</p>
              </div>
              <CodeBlock
                code={'<Count size="sm" count={3} />\n<Count count={150} />\n<Count count={12} max={9} />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Count disabled count={3} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Muted fill for counts on a disabled item.</p>
              </div>
              <CodeBlock code="<Count disabled count={3} />" />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
