"use client";

import { useState } from "react";
import { ThinkingAnimation } from "@/ui/ThinkingAnimation";
import type { ThinkingAnimationSize } from "@/ui/ThinkingAnimation";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ThinkingAnimationSize[] = ["sm", "md", "lg"];

function masterCode(size: ThinkingAnimationSize, showLabel: boolean) {
  const lines = ["<ThinkingAnimation", '  label="Thinking"', `  size="${size}"`];
  if (!showLabel) lines.push("  showLabel={false}");
  lines.push("/>");
  return lines.join("\n");
}

export function ThinkingAnimationDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ThinkingAnimationSize>("md");
  const [showLabel, setShowLabel] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>ThinkingAnimation</h1>
        <p className={styles.lede}>
          A calm processing indicator for assistants and short system waits. One piece. Not
          LoadingAnimation. Not Spinner.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="thinkinganimation-master">
        <div className={styles.masterHeader}>
          <h2 id="thinkinganimation-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Show only while work is actively happening. Size and label live in the panel.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <ThinkingAnimation label="Thinking" size={size} showLabel={showLabel} />
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
                  <span className={styles.panelLabel}>Structure</span>
                  <Switch size="sm" label="Label" checked={showLabel} onChange={setShowLabel} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use ThinkingAnimation while an assistant or agent is working. Hide it when the
                  wait ends. Not LoadingAnimation.
                </p>
              </div>
              <CodeBlock code={masterCode(size, showLabel)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <ThinkingAnimation key={step} label="Thinking" size={step} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use sm in tight chrome, md for most waits, and lg when the indicator is the
                  focus.
                </p>
              </div>
              <CodeBlock
                code={SIZES.map((step) => `<ThinkingAnimation label="Thinking" size="${step}" />`).join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
