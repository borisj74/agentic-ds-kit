"use client";

import { useState } from "react";
import { Accordion, Field, Input } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const FAQ_ITEMS = [
  { id: "hours", title: "Hours", content: "Weekdays 9–5. Closed on public holidays." },
  { id: "address", title: "Address", content: "Knez Mihailova 1, Belgrade." },
  { id: "parking", title: "Parking", content: "Street parking in front of the studio. Garage one block north." },
];

const SETTINGS_ITEMS = [
  {
    id: "billing-contact",
    title: "Billing contact",
    meta: "Updated 2 days ago",
    content: (
      <Field label="Invoice email" htmlFor="accordion-invoice-email" hint="Northwind sends INV-1842 and later invoices here">
        <Input id="accordion-invoice-email" type="email" defaultValue="billing@northwind.com" />
      </Field>
    ),
  },
  { id: "invoices", title: "Invoices", count: 12, content: "Twelve invoices this year. The last one, INV-1842, was $1,240.00." },
  { id: "team", title: "Team seats", count: 8, content: "Eight of ten seats on the Growth plan are in use." },
  { id: "sso", title: "Single sign-on", meta: "Enterprise plan", disabled: true, content: "Available on the Enterprise plan." },
];

const MULTIPLE_CODE = `<Accordion
  type="multiple"
  defaultOpen={["billing-contact", "invoices"]}
  items={[
    { id: "billing-contact", title: "Billing contact", meta: "Updated 2 days ago", content: <Field …><Input … /></Field> },
    { id: "invoices", title: "Invoices", count: 12, content: "Twelve invoices this year." },
    { id: "sso", title: "Single sign-on", meta: "Enterprise plan", disabled: true, content: "…" },
  ]}
/>`;

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
        <h2 className={styles.heroTitle}>Accordion</h2>
        <p className={styles.lede}>Disclosure list for short related sections.</p>
      </header>

      <section className={styles.master} aria-labelledby="accordion-master">
        <div className={styles.masterHeader}>
          <h2 id="accordion-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>One item open at a time by default. Down and Up move between headers, Right opens, Left closes.</p>
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
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use for FAQ or short settings groups. Use Tabs for peer views. Use AppNav for the sidebar.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </DocNotes>
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
              <h2 className={styles.exampleTitle}>Settings groups, several open</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Accordion type="multiple" items={SETTINGS_ITEMS} defaultOpen={["billing-contact", "invoices"]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  type multiple keeps several panels open. Panels can hold kit pieces such as a Field. meta and count
                  sit in the header; a disabled item shows but does not open, and Tab skips it.
                </p>
              </div>
              <CodeBlock code={MULTIPLE_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
