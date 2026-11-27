"use client";

import { useState, type ReactNode } from "react";
import { AssumptionLog } from "agentic-ds-kit";
import type { Assumption } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel } from "./ControlsPanel";

/** A fake pricing-update run: what the agent decided without asking. */
const OPEN: Assumption[] = [
  {
    id: "currency",
    text: "Supplier prices are in EUR",
    confidence: 0.42,
    source: "default",
    steps: ["Read the supplier sheet", "Convert to shop prices", "Write the EU list"],
    status: "open",
  },
  {
    id: "vat",
    text: "Supplier prices exclude VAT",
    confidence: 0.64,
    source: "earlier chat",
    steps: ["Convert to shop prices", "Write the EU list"],
    status: "open",
  },
  {
    id: "rounding",
    text: "Round shop prices to .99",
    confidence: 0.81,
    source: "price-rules.md",
    steps: ["Write the EU list"],
    status: "open",
  },
  {
    id: "season",
    text: "The spring catalogue starts on 1 March",
    confidence: 0.9,
    source: "catalogue.yaml",
    steps: ["Schedule the price change"],
    status: "open",
  },
];

const MIXED: Assumption[] = [
  OPEN[0],
  { ...OPEN[1], status: "corrected", correction: "Supplier prices include 21% VAT" },
  { ...OPEN[2], status: "confirmed" },
  OPEN[3],
];

const noop = () => {};

const ITEMS_CODE = `items={[
    { id: "currency", text: "Supplier prices are in EUR", confidence: 0.42, source: "default", steps: ["Read the supplier sheet", "Convert to shop prices", "Write the EU list"], status: "open" },
    { id: "vat", text: "Supplier prices exclude VAT", confidence: 0.64, source: "earlier chat", steps: [...], status: "corrected", correction: "Supplier prices include 21% VAT" },
  ]}`;

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Open — weakest first",
    about: "Open rows sort by confidence, lowest first. Each shows a small Meter and the word Low, Medium or High, its source as a Tag, and the steps that use it.",
    code: `<AssumptionLog ${ITEMS_CODE} onConfirm={confirm} onCorrect={correct} />`,
    render: <AssumptionLog items={OPEN} onConfirm={noop} onCorrect={noop} />,
  },
  {
    title: "Mixed — confirmed and corrected",
    about: "Corrected rows show the old text struck through, the new text, and how many steps the agent will redo. Confirmed rows go quiet.",
    code: `<AssumptionLog items={items} filter="all" onConfirm={confirm} onCorrect={correct} />`,
    render: <AssumptionLog items={MIXED} filter="all" onConfirm={noop} onCorrect={noop} />,
  },
  {
    title: "Long list — limit",
    about: "Only the weakest few show; \"Show n more\" reveals the rest and moves focus to the first new row. limit={0} shows every row.",
    code: `<AssumptionLog items={items} limit={2} onConfirm={confirm} onCorrect={correct} />`,
    render: <AssumptionLog items={OPEN} limit={2} onConfirm={noop} onCorrect={noop} />,
  },
  {
    title: "Compact — for a run header",
    about: "compact is one line: the open count and the weakest open assumption with its confidence.",
    code: `<AssumptionLog compact items={items} />`,
    render: <AssumptionLog compact items={OPEN} />,
  },
  {
    title: "Empty — nothing left to check",
    about: "When no rows match the filter, the list is a kit Empty.",
    code: `<AssumptionLog items={[]} />`,
    render: <AssumptionLog items={[]} />,
  },
];

export function AssumptionLogDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [items, setItems] = useState<Assumption[]>(OPEN);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>AssumptionLog</h2>
        <p className={styles.lede}>The guesses an agent made without asking. Not DecisionCard. Not MemoryPanel.</p>
      </header>

      <section className={styles.master} aria-labelledby="assumptionlog-master">
        <div className={styles.masterHeader}>
          <h2 id="assumptionlog-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Confirm a guess, or Correct it: Enter saves, Escape cancels.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={agentDoc.trail}>
                  <div className={agentDoc.stack}>
                    <AssumptionLog compact items={items} />
                    <AssumptionLog
                      items={items}
                      onConfirm={(id) => setItems((list) => list.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a)))}
                      onCorrect={(id, correction) =>
                        setItems((list) => list.map((a) => (a.id === id ? { ...a, status: "corrected", correction } : a)))
                      }
                    />
                  </div>
                </div>
              </div>
              <ControlsPanel onReset={() => setItems(OPEN)} />
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  AssumptionLog lists what the agent decided on its own, weakest first, so a person can confirm or correct
                  it before it matters. A question the agent waits on is a DecisionCard.
                </p>
              </div>
              <CodeBlock
                code={`<AssumptionLog
  ${ITEMS_CODE}
  onConfirm={confirm}
  onCorrect={(id, correction) => correct(id, correction)}
/>`}
              />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANT_DOCS.map((doc) => (
              <section key={doc.title} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={agentDoc.trail}>{doc.render}</div>
                </div>
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
