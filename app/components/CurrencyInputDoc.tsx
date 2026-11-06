"use client";

import { useState } from "react";
import { CurrencyInput, Field } from "agentic-ds-kit";
import type { NumberInputSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: NumberInputSize[] = ["sm", "md", "lg"];
const PREVIEW_FILL = { maxWidth: "20rem" } as const;

export function CurrencyInputDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<NumberInputSize>("md");
  const [amount, setAmount] = useState<number | null>(1280);
  const [euro, setEuro] = useState<number | null>(980.5);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>CurrencyInput</h1>
        <p className={styles.lede}>
          A money amount. The symbol and grouping follow the currency and locale. Step defaults to
          0.01.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="currencyinput-master">
        <div className={styles.masterHeader}>
          <h2 id="currencyinput-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>USD by default. The symbol sits beside the number and is not part of the typed value.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Amount" htmlFor="currency-amount">
                    <CurrencyInput id="currency-amount" size={size} currency="USD" value={amount} onChange={setAmount} />
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
                  Wrap with Field. A plain number is NumberInput. Pair a Select when the person
                  chooses the currency code. Do not prefix an Input with a currency character.
                </p>
              </div>
              <CodeBlock code={'<Field label="Amount" htmlFor="amount"><CurrencyInput id="amount" currency="USD" /></Field>'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Euro, de-DE</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Amount" htmlFor="currency-eur">
                    <CurrencyInput
                      id="currency-eur"
                      currency="EUR"
                      locale="de-DE"
                      min={0}
                      value={euro}
                      onChange={setEuro}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  currency is an ISO 4217 code. locale places the symbol and the decimal mark. min
                  keeps the amount from stepping below zero.
                </p>
              </div>
              <CodeBlock code={'<CurrencyInput id="amount" currency="EUR" locale="de-DE" min={0} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
