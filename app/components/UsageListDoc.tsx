"use client";

import { useState } from "react";
import { Card, UsageList } from "agentic-ds-kit";
import type { UsageListItem } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const PLAN: UsageListItem[] = [
  { id: "storage", label: "Storage", used: 32, limit: 50, unit: "GB" },
  { id: "api", label: "API calls", used: 8420, limit: 10000, note: "Resets on Oct 1" },
  { id: "seats", label: "Seats", used: 12, limit: 12, note: "All seats in use" },
];

const OVER: UsageListItem[] = [
  {
    id: "invoices",
    label: "Invoices sent",
    used: 1240,
    limit: 1000,
    note: "Extra invoices are billed at the overage rate",
  },
];

const UNDER: UsageListItem[] = [
  { id: "projects", label: "Projects", used: 4, limit: 20 },
  {
    id: "files",
    label: "File storage",
    used: 2.4,
    limit: 10,
    unit: "GB",
    note: "Shared across every project",
  },
];

const CODE = `<UsageList
  label="Plan usage"
  items={[
    { id: "storage", label: "Storage", used: 32, limit: 50, unit: "GB" },
    { id: "api", label: "API calls", used: 8420, limit: 10000, note: "Resets on Oct 1" },
    { id: "seats", label: "Seats", used: 12, limit: 12, note: "All seats in use" },
  ]}
/>`;

export function UsageListDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>UsageList</h1>
        <p className={styles.lede}>
          A list of usage limits, one a row: the limit&apos;s name, how much is used of it, a bar,
          and a short note. Not ListView. Not Table. Not Progress alone.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="usagelist-master">
        <div className={styles.masterHeader}>
          <h2 id="usagelist-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Three limits: under 80% brand, 80% warning, and 100% danger. Variants show overage and
            a list with nothing close.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Card title="Plan usage">
                    <UsageList label="Plan usage" items={PLAN} />
                  </Card>
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass real used and limit numbers. The list works out the percent and writes used
                  of limit over a kit Progress bar. Bars turn warning at 80% and danger at 100%.
                  Over the limit still prints the real numbers, with a full red bar. Put the list
                  in a Section or Card for a title; UsageList draws no box of its own. Do not wrap
                  it in both.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Over the limit</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Card title="Invoices">
                    <UsageList label="Usage" items={OVER} />
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use past the limit reads as it is, like 1,240 of 1,000, with a full red bar.
                  Progress clamps the fill at 100%.
                </p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Under every limit</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Card title="Workspace usage">
                    <UsageList label="Workspace usage" items={UNDER} />
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Brand bars when nothing is close to a limit. Integers group; decimals stay as
                  passed, like 2.4 of 10 GB.
                </p>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
