"use client";

import { useState } from "react";
import { Delta } from "agentic-ds-kit";
import type { DeltaDirection, DeltaSize, DeltaTone } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: DeltaSize[] = ["sm", "md"];
const DIRECTIONS: DeltaDirection[] = ["up", "down", "flat"];
const TONES: ("auto" | DeltaTone)[] = ["auto", "success", "danger", "warning", "neutral"];

const VALUE: Record<DeltaDirection, string> = {
  up: "+$600",
  down: "−$90",
  flat: "No change",
};

function masterCode(direction: DeltaDirection, tone: "auto" | DeltaTone, size: DeltaSize) {
  const lines = ["<Delta", `  value="${VALUE[direction]}"`, `  direction="${direction}"`];
  if (tone !== "auto") lines.push(`  tone="${tone}"`);
  if (size !== "md") lines.push(`  size="${size}"`);
  lines.push("/>");
  return lines.join("\n");
}

export function DeltaDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<DeltaSize>("md");
  const [direction, setDirection] = useState<DeltaDirection>("up");
  const [tone, setTone] = useState<"auto" | DeltaTone>("auto");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Delta</h2>
        <p className={styles.lede}>
          How a value moved: an arrow and the signed change, no fill. Money changes are a Delta, never a Badge.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="delta-master">
        <div className={styles.masterHeader}>
          <h2 id="delta-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Up $600 against last month. Direction, tone and size live in the panel.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Delta
                  value={VALUE[direction]}
                  direction={direction}
                  tone={tone === "auto" ? undefined : tone}
                  size={size}
                />
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
                  <span className={styles.panelLabel}>Direction</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Direction">
                    {DIRECTIONS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="delta-direction"
                          value={option}
                          checked={direction === option}
                          onChange={() => setDirection(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Tone</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Tone">
                    {TONES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="delta-tone"
                          value={option}
                          checked={tone === option}
                          onChange={() => setTone(option)}
                        />
                        {option === "auto" ? "from direction" : option}
                      </label>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Write the sign in value (+$600, −$90) or say No change, so the arrow and colour are never the
                  only signal. Tone follows direction; override it when a rise is bad news, like costs.
                </p>
              </div>
              <CodeBlock code={masterCode(direction, tone, size)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Directions</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Delta value="+$600" direction="up" />
                  <Delta value="−$90" direction="down" />
                  <Delta value="No change" direction="flat" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Up is success, down is danger, flat is neutral.</p>
              </div>
              <CodeBlock
                code={
                  '<Delta value="+$600" direction="up" />\n<Delta value="−$90" direction="down" />\n<Delta value="No change" direction="flat" />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Tone override</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Delta value="+$1,240" direction="up" tone="danger" />
                  <Delta value="−0.5 pt" direction="down" tone="success" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Costs that went up are bad news; churn that went down is good news. The arrow still shows
                  the direction.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Delta value="+$1,240" direction="up" tone="danger" />\n<Delta value="−0.5 pt" direction="down" tone="success" />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Delta value="+$600" direction="up" size="sm" />
                  <Delta value="+$600" direction="up" size="md" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm 12/16 for dense rows and Scorecard. md 14/20 for table rows.</p>
              </div>
              <CodeBlock code={'<Delta value="+$600" direction="up" size="sm" />\n<Delta value="+$600" direction="up" />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
