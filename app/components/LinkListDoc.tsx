"use client";

import { useState } from "react";
import { LinkList } from "agentic-ds-kit";
import { Section } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const noop = () => undefined;

const QUICK = [
  { id: "tax", label: "Tax Related List", onClick: noop },
  { id: "subscription", label: "Subscription Configuration", onClick: noop },
  { id: "portal", label: "Customer Portal", onClick: noop },
  { id: "orders", label: "Orders", onClick: noop },
  { id: "documents", label: "Document Information", onClick: noop },
];

const RELATED = [
  {
    id: "invoices",
    label: "Invoices",
    onClick: noop,
    icon: "File",
    description: "Every invoice on this account",
  },
  {
    id: "payments",
    label: "Payments",
    onClick: noop,
    icon: "CreditCard",
    description: "Payments and refunds",
  },
];

const HELP = [
  { id: "docs", label: "Documentation", href: "https://example.com/docs", external: true },
  { id: "status", label: "System status", href: "https://example.com/status", external: true },
];

const CODE = `<Section title="Quick links">
  <LinkList
    label="Quick links"
    items={[
      { id: "tax", label: "Tax Related List", href: "/tax" },
      { id: "portal", label: "Customer Portal", href: "/portal" },
    ]}
  />
</Section>`;

export function LinkListDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>LinkList</h1>
        <p className={styles.lede}>
          A column of links, one a row with a chevron at the end. Put it in a Section. Not ListView.
          Not navigation. Not a Card of its own.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="linklist-master">
        <div className={styles.masterHeader}>
          <h2 id="linklist-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>A record&apos;s quick links in its rail, inside a kit Section.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={{ maxWidth: "22rem" }}>
                  <Section title="Quick links">
                    <LinkList label="Quick links" items={QUICK} />
                  </Section>
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Keep it short: two to eight. Actions that change data stay Button or DropdownMenu.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icons and descriptions</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "22rem" }}>
                  <Section title="Related">
                    <LinkList label="Related" items={RELATED} />
                  </Section>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  An icon before each label and a line under it. Icons are lucide-react export names.
                </p>
              </div>
              <CodeBlock
                code={`<LinkList
  label="Related"
  items={[
    { id: "invoices", label: "Invoices", href: "/invoices", icon: "File", description: "Every invoice on this account" },
  ]}
/>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>External</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "22rem" }}>
                  <Section title="Help">
                    <LinkList label="Help" items={HELP} />
                  </Section>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Links that open somewhere else show the new-tab mark instead of the chevron.
                </p>
              </div>
              <CodeBlock
                code={`<LinkList
  label="Help"
  items={[
    { id: "docs", label: "Documentation", href: "https://example.com/docs", external: true },
  ]}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
