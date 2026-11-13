"use client";

import { useState } from "react";
import { Field, TagInput } from "agentic-ds-kit";
import type { TagInputSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: TagInputSize[] = ["sm", "md"];
const PREVIEW_FILL = { maxWidth: "20rem" } as const;
const SUGGESTIONS = ["billing", "priority", "enterprise", "onboarding", "renewal"];

export function TagInputDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<TagInputSize>("md");
  const [tags, setTags] = useState<string[]>(["billing"]);
  const [keywords, setKeywords] = useState<string[]>([]);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>TagInput</h2>
        <p className={styles.lede}>
          Tags the person types. Enter or a comma adds one. Suggestions are optional. A fixed list
          is MultiSelect.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="taginput-master">
        <div className={styles.masterHeader}>
          <h2 id="taginput-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Duplicates are ignored. Backspace on an empty query removes the last tag.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Keywords" htmlFor="taginput-keywords">
                    <TagInput
                      id="taginput-keywords"
                      size={size}
                      placeholder="Add a keyword"
                      value={tags}
                      onChange={setTags}
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
                  Wrap with Field. Each tag is kit Tag. Use MultiSelect when every value must come
                  from a list.
                </p>
              </div>
              <CodeBlock code={'<Field label="Keywords" htmlFor="keywords"><TagInput id="keywords" /></Field>'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Suggestions</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Labels" htmlFor="taginput-suggestions">
                    <TagInput
                      id="taginput-suggestions"
                      placeholder="Add a label"
                      suggestions={SUGGESTIONS}
                      value={keywords}
                      onChange={setKeywords}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  suggestions appear while typing. Arrow keys move, Enter adds the highlighted one
                  or the typed text. The person can still add a word that is not suggested.
                </p>
              </div>
              <CodeBlock code={'<TagInput id="labels" suggestions={labels} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
