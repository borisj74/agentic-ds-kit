"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import { Section } from "@/ui/Section";
import type { SectionSize } from "@/ui/Section";
import { Switch } from "@/ui/Switch";
import { Table } from "@/ui/Table";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: SectionSize[] = ["lg", "md", "sm"];
const MASTER_TITLE = "Recent activity";
const MASTER_DESCRIPTION = "Last 30 days";
const COLUMNS = [
  { key: "task", header: "Task" },
  { key: "owner", header: "Owner" },
];
const ROWS = [
  { task: "Invoice Q3", owner: "Boris" },
  { task: "Renewals", owner: "Mila" },
];

function masterCode(size: SectionSize, showDescription: boolean, showActions: boolean) {
  const buttonSize = size === "lg" ? "md" : "sm";
  const lines = ["<Section", `  title="${MASTER_TITLE}"`];
  if (showDescription) lines.push(`  description="${MASTER_DESCRIPTION}"`);
  lines.push(`  size="${size}"`);
  if (showActions) {
    lines.push(`  actions={<Button variant="secondary" size="${buttonSize}">View all</Button>}`);
  }
  lines.push(">");
  lines.push("  <Table columns={columns} rows={rows} />");
  lines.push("</Section>");
  return lines.join("\n");
}

export function SectionDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<SectionSize>("md");
  const [showDescription, setShowDescription] = useState(true);
  const [showActions, setShowActions] = useState(true);
  const buttonSize = size === "lg" ? "md" : "sm";

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Section</h1>
        <p className={styles.lede}>
          Grouped page block with a heading, optional description, and optional actions. Not PageHeader. Not Card. Not FieldSet.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="section-master">
        <div className={styles.masterHeader}>
          <h2 id="section-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size, description, and actions. Body is kit Table.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Section
                  title={MASTER_TITLE}
                  description={showDescription ? MASTER_DESCRIPTION : undefined}
                  size={size}
                  actions={
                    showActions ? (
                      <Button variant="secondary" size={buttonSize}>
                        View all
                      </Button>
                    ) : undefined
                  }
                >
                  <Table columns={COLUMNS} rows={ROWS} />
                </Section>
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
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Structure</span>
                  <Switch
                    size="sm"
                    label="Description"
                    checked={showDescription}
                    onChange={setShowDescription}
                  />
                  <Switch
                    size="sm"
                    label="Actions"
                    checked={showActions}
                    onChange={setShowActions}
                  />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Section to group a heading with related content on a page. Page title stays
                  on PageHeader. Framed tiles stay Card. Form legends stay FieldSet. Actions must
                  be kit Buttons. One primary per view.
                </p>
              </div>
              <CodeBlock code={masterCode(size, showDescription, showActions)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                {(["sm", "md", "lg"] as SectionSize[]).map((step) => (
                  <Section key={step} title={`Activity (${step})`} size={step}>
                    <Table columns={COLUMNS} rows={ROWS} />
                  </Section>
                ))}
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Size changes the gap under the heading and between stacked sections. Use sm in
                  dense settings, md on most pages, and lg when the block needs more air.
                </p>
              </div>
              <CodeBlock
                code={["sm", "md", "lg"]
                  .map(
                    (step) =>
                      `<Section title="Activity (${step})" size="${step}">\n  <Table columns={columns} rows={rows} />\n</Section>`,
                  )
                  .join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Actions</h2>
              <div className={styles.exampleCanvas}>
                <Section
                  title="Recent activity"
                  description="Latest project updates"
                  actions={
                    <Button variant="secondary" size="sm">
                      View all
                    </Button>
                  }
                >
                  <Table columns={COLUMNS} rows={ROWS} />
                </Section>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Put kit Buttons in actions for a section-level next step. Keep them secondary
                  unless this is the only primary on the view.
                </p>
              </div>
              <CodeBlock
                code={`<Section
  title="Recent activity"
  description="Latest project updates"
  actions={<Button variant="secondary" size="sm">View all</Button>}
>
  <Table columns={columns} rows={rows} />
</Section>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Title only</h2>
              <div className={styles.exampleCanvas}>
                <Section title="Notifications">
                  <Table columns={COLUMNS} rows={ROWS} />
                </Section>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Skip description when the heading is enough. Keep the body as kit pieces.
                </p>
              </div>
              <CodeBlock
                code={`<Section title="Notifications">
  <Table columns={columns} rows={rows} />
</Section>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
