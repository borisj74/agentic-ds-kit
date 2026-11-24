"use client";

import { useState } from "react";
import { LoadError } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const MASTER_CODE = `<LoadError
  message="Couldn’t load invoices."
  reference="Ref 7F3A-91C2"
  onRetry={reload}
/>`;

export function LoadErrorDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const retry = () => undefined;

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>LoadError</h2>
        <p className={styles.lede}>
          What a list, card, chart or page shows when its data failed to load. Same sizes as Empty.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="loaderror-master">
        <div className={styles.masterHeader}>
          <h2 id="loaderror-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>sm, with a reference and Try again.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <LoadError message="Couldn’t load invoices." reference="Ref 7F3A-91C2" onRetry={retry} />
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  role=alert, a CircleX icon and words, so colour is never the only signal. Name what
                  failed, give a reference people can copy, and pass onRetry for the Try again Button
                  (KitLabels tryAgain). Put it in the space the Skeleton held; focus stays put. After a
                  retry that fails again, focus returns to Try again.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <LoadError size="sm" message="Couldn’t load revenue." reference="Ref 7F3A" onRetry={retry} />
                <LoadError size="md" message="Couldn’t load revenue." reference="Ref 7F3A-91C2" onRetry={retry} />
                <LoadError size="lg" message="Couldn’t load billing." reference="Ref 7F3A-91C2" onRetry={retry} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  sm: in a chart, list or table cell, bare icon. md: a card body, 32px danger tile. lg: a
                  page, 40px tile.
                </p>
              </div>
              <CodeBlock
                code={`<LoadError size="sm" message="Couldn’t load revenue." reference="Ref 7F3A" onRetry={reload} />
<LoadError size="md" message="Couldn’t load revenue." reference="Ref 7F3A-91C2" onRetry={reload} />
<LoadError size="lg" message="Couldn’t load billing." reference="Ref 7F3A-91C2" onRetry={reload} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>No retry</h2>
              <div className={styles.exampleCanvas}>
                <LoadError message="Couldn’t load the audit log. Your data is safe." />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Leave out onRetry when trying again can’t help.</p>
              </div>
              <CodeBlock code={'<LoadError message="Couldn’t load the audit log. Your data is safe." />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
