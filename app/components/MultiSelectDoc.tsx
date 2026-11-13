"use client";

import { useState } from "react";
import { Field, MultiSelect } from "agentic-ds-kit";
import type { MultiSelectSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: MultiSelectSize[] = ["sm", "md"];
const PREVIEW_FILL = { maxWidth: "20rem" } as const;
const TEAMS = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "product", label: "Product" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
];

export function MultiSelectDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<MultiSelectSize>("md");
  const [teams, setTeams] = useState<string[]>(["design", "product"]);
  const [many, setMany] = useState<string[]>(["design", "engineering", "marketing", "product"]);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>MultiSelect</h2>
        <p className={styles.lede}>
          Several values stay in the field as removable tags. Typing filters the list. A short menu
          of choices is still Select multiple.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="multiselect-master">
        <div className={styles.masterHeader}>
          <h2 id="multiselect-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Enter toggles the highlighted option. Backspace on an empty query removes the last tag.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Teams" htmlFor="multi-teams">
                    <MultiSelect
                      id="multi-teams"
                      size={size}
                      placeholder="Select teams"
                      options={TEAMS}
                      value={teams}
                      onChange={setTeams}
                    />
                  </Field>
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
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Wrap with Field. Tags are kit Tag. Overflow is kit Badge. Tags the person types,
                  rather than picks, are TagInput.
                </p>
              </div>
              <CodeBlock code={'<Field label="Teams" htmlFor="teams"><MultiSelect id="teams" options={teams} /></Field>'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Overflow</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Teams" htmlFor="multi-overflow">
                    <MultiSelect
                      id="multi-overflow"
                      maxVisible={2}
                      placeholder="Select teams"
                      options={TEAMS}
                      value={many}
                      onChange={setMany}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  maxVisible keeps the first tags and a Badge with the rest. The hidden values stay
                  selected and can be cleared from the list.
                </p>
              </div>
              <CodeBlock code={'<MultiSelect id="teams" maxVisible={2} options={teams} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
