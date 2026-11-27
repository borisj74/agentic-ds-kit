"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Spinner } from "agentic-ds-kit";
import type { SpinnerSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, SizeControl } from "./ControlsPanel";

const SIZES: SpinnerSize[] = ["sm", "md", "lg"];

function masterCode(size: SpinnerSize) {
  if (size === "md") return "<Spinner />";
  return `<Spinner size="${size}" />`;
}

export function SpinnerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<SpinnerSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Spinner</h2>
        <p className={styles.lede}>
          Spinning circular loader for indeterminate waits. One piece. Not LoadingAnimation dot-grid.
          Not ThinkingAnimation.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="spinner-master">
        <div className={styles.masterHeader}>
          <h2 id="spinner-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Medium spinner. Size lives in the panel.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Spinner size={size} />
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  role=status with aria-live polite. Pass label for visible copy beside the spinner.
                </p>
              </div>
              <CodeBlock code={masterCode(size)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm 12, md 16, and lg 20 on one piece.</p>
              </div>
              <CodeBlock
                code={[
                  "<Spinner size=\"sm\" />",
                  "<Spinner size=\"md\" />",
                  "<Spinner size=\"lg\" />",
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With label</h2>
              <div className={styles.exampleCanvas}>
                <Spinner label="Processing payment…" />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Visible label beside the spinner.</p>
              </div>
              <CodeBlock code={'<Spinner label="Processing payment…" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>In a button</h2>
              <div className={styles.exampleCanvas}>
                <Button loading>Saving…</Button>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A kit Button has its own spinner: set loading. The button keeps its width. Keep Spinner for waits outside a button.
                </p>
              </div>
              <CodeBlock
                code={`import { Button } from "agentic-ds-kit";

<Button loading>Saving…</Button>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Inverse</h2>
              <div className={styles.exampleCanvas}>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-control-md)",
                    background: "var(--primary)",
                  }}
                >
                  <Spinner inverse label="Syncing" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>On a primary fill, set inverse for the on-primary ink.</p>
              </div>
              <CodeBlock code={"<Spinner inverse label=\"Syncing\" />"} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>When to use which</h2>
              <div>
                <p className={styles.usageBody}>
                  Skeleton for the first load of a known layout. Spinner for a short wait, and Button
                  loading for a button action. Progress when the percent is known, and indeterminate
                  Progress when work is underway and the percent is not. Empty or LoadError when it fails
                  or there is nothing. Keep Meter for zones, a datatip and reference lines.
                </p>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
