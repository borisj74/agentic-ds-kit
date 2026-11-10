"use client";

import { useState, type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

export interface AgentVariantDoc {
  title: string;
  about: string;
  code: string;
  render: ReactNode;
}

/**
 * Shared frame for the agent pattern docs from batch 3 on: the same hero, Master (Preview with
 * controls) and Variants list as the hand-written docs, so the K79 stage picks them up the same way.
 */
export function AgentDocFrame({
  id,
  name,
  lede,
  summary,
  preview,
  controls,
  usage,
  code,
  variants,
}: {
  id: string;
  name: string;
  lede: string;
  summary: string;
  preview: ReactNode;
  controls?: ReactNode;
  usage: string;
  code: string;
  variants: AgentVariantDoc[];
}) {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>{name}</h1>
        <p className={styles.lede}>{lede}</p>
      </header>

      <section className={styles.master} aria-labelledby={`${id}-master`}>
        <div className={styles.masterHeader}>
          <h2 id={`${id}-master`} className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>{summary}</p>
          <DocTabList value={tab} onChange={(next) => setTab(next as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>{preview}</div>
              {controls ? (
                <aside className={styles.panel} aria-label="Controls">
                  {controls}
                </aside>
              ) : null}
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>{usage}</p>
              </div>
              <CodeBlock code={code} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {variants.map((doc) => (
              <section key={doc.title} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>{doc.render}</div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{doc.about}</p>
                </div>
                <CodeBlock code={doc.code} />
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** A row of option buttons for the Controls panel, same look as the other docs. */
export function DocOptions<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.panelGroup}>
      <span className={styles.panelLabel}>{label}</span>
      <div className={styles.sizeGroup} role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.sizeTab} ${value === option ? styles.sizeTabActive : ""}`}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
