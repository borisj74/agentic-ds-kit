"use client";

import { useState } from "react";
import { Alert } from "@/ui/Alert";
import type { AlertVariant } from "@/ui/Alert";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const VARIANTS: AlertVariant[] = ["info", "success", "warning", "danger"];

const COPY: Record<AlertVariant, { title: string; body: string; about: string }> = {
  info: {
    title: "Heads up",
    body: "Invoices export overnight. You will get an email when the file is ready.",
    about: "Use Info for neutral guidance that is not a success or a problem.",
  },
  success: {
    title: "Saved",
    body: "Your changes are live.",
    about: "Use Success after a write that already completed.",
  },
  warning: {
    title: "Card expires soon",
    body: "Update billing before the 12th or the workspace pauses.",
    about: "Use Warning when the user can still fix it.",
  },
  danger: {
    title: "Export failed",
    body: "We could not reach the file store. Try again or check the connection.",
    about: "Use Danger for a failure or harmful state on this page.",
  },
};

export function AlertDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [variant, setVariant] = useState<AlertVariant>("info");
  const current = COPY[variant];

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Alert</h1>
        <p className={styles.lede}>Inline status banner that stays on the page. Not a toast.</p>
      </header>

      <section className={styles.master} aria-labelledby="alert-master">
        <div className={styles.masterHeader}>
          <h2 id="alert-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Switch variant to preview info, success, warning, and danger.</p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button type="button" role="tab" aria-selected={tab === "preview"} className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`} onClick={() => setTab("preview")}>
              Preview
            </button>
            <button type="button" role="tab" aria-selected={tab === "variants"} className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`} onClick={() => setTab("variants")}>
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Alert variant={variant} title={current.title}>
                    {current.body}
                  </Alert>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Variant">
                    {VARIANTS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="alert-variant"
                          value={option}
                          checked={variant === option}
                          onChange={() => setVariant(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Keep it on the page. Use Badge for a compact chip. Use Modal when they can dismiss. Use AlertDialog when they must choose.
                </p>
              </div>
              <CodeBlock
                code={`<Alert variant="${variant}" title="${current.title}">\n  ${current.body}\n</Alert>`}
              />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANTS.map((option) => (
              <section key={option} className={styles.example}>
                <h2 className={styles.exampleTitle}>{option[0].toUpperCase() + option.slice(1)}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewFill}>
                    <Alert variant={option} title={COPY[option].title}>
                      {COPY[option].body}
                    </Alert>
                  </div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{COPY[option].about}</p>
                </div>
                <CodeBlock
                  code={`<Alert variant="${option}" title="${COPY[option].title}">${COPY[option].body}</Alert>`}
                />
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
