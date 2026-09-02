"use client";

import { useState } from "react";
import { Accordion } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const FAQ_ITEMS = [
  { id: "hours", title: "Hours", content: "Weekdays 9–5. Closed on public holidays." },
  { id: "address", title: "Address", content: "Knez Mihailova 1, Belgrade." },
  { id: "parking", title: "Parking", content: "Street parking in front of the studio. Garage one block north." },
];

const SETTINGS_ITEMS = [
  { id: "profile", title: "Profile", content: "Name, email, and how you show up to clients." },
  { id: "billing", title: "Billing", content: "Plan, invoices, and payment method." },
  { id: "team", title: "Team", content: "Who can edit this workspace." },
];

const CODE = `<Accordion
  defaultOpen="hours"
  items={[
    { id: "hours", title: "Hours", content: "Weekdays 9–5." },
    { id: "address", title: "Address", content: "Knez Mihailova 1." },
  ]}
/>`;

export function AccordionDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Accordion</h1>
        <p className={styles.lede}>One-open disclosure list for short related sections.</p>
      </header>

      <section className={styles.master} aria-labelledby="accordion-master">
        <div className={styles.masterHeader}>
          <h2 id="accordion-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Open one item at a time. Closing the open item leaves them all shut.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Accordion items={FAQ_ITEMS} defaultOpen="hours" />
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use for FAQ or short settings groups. Use Tabs for peer views. Use AppNav for the sidebar.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>FAQ</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Accordion items={FAQ_ITEMS} defaultOpen="hours" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Help copy the user opens one answer at a time.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Settings groups</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Accordion items={SETTINGS_ITEMS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Cluster related settings. Do not put a full form in every panel.</p>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
