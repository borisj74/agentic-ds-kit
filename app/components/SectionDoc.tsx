"use client";

import { useState } from "react";
import { Alert } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import { Scoreboard } from "agentic-ds-kit";
import { Section } from "agentic-ds-kit";
import type { SectionSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { Table } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: SectionSize[] = ["sm", "md", "lg"];
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
const METRICS = [
  {
    label: "Revenue",
    value: "$48.2k",
    delta: "+12.4%",
    trend: "up" as const,
    hint: "vs last 30 days",
    badge: "Live",
    badgeTone: "success" as const,
  },
  {
    label: "Churn",
    value: "1.2%",
    delta: "-0.3%",
    trend: "down" as const,
    hint: "vs last 30 days",
    badge: "Watch",
    badgeTone: "warning" as const,
  },
];

function masterCode(
  size: SectionSize,
  showDescription: boolean,
  showActions: boolean,
  collapsible: boolean,
) {
  const buttonSize = size === "lg" ? "md" : "sm";
  const lines = ["<Section", `  title="${MASTER_TITLE}"`];
  if (showDescription) lines.push(`  description="${MASTER_DESCRIPTION}"`);
  lines.push(`  size="${size}"`);
  if (collapsible) lines.push("  collapsible");
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
  const [collapsible, setCollapsible] = useState(false);
  const buttonSize = size === "lg" ? "md" : "sm";

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Section</h1>
        <p className={styles.lede}>
          Grouped page block. Unframed: no fill, radius, border, or box padding. Headings are static by
          default; pass collapsible for a chevron that toggles the body. Not PageHeader. Not Card.
          Not FieldSet. Not Accordion.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="section-master">
        <div className={styles.masterHeader}>
          <h2 id="section-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size, collapse, description, and actions. Body is kit Table.
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
                  collapsible={collapsible}
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
                    label="Collapsible"
                    checked={collapsible}
                    onChange={setCollapsible}
                  />
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
                  Use Section to group a heading with related content on a page. It has no fill,
                  radius, border, or box padding — Card owns the framed surface; layout-content owns
                  page inset. The heading is a label by default — no chevron. Pass collapsible
                  when the block should fold. Page title stays on PageHeader. Compact tiles with an
                  image or footer stay Card. Form legends stay FieldSet. Exclusive FAQ lists stay
                  Accordion. Actions must be kit Buttons.
                </p>
              </div>
              <CodeBlock code={masterCode(size, showDescription, showActions, collapsible)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Content</h2>
              <div className={styles.exampleCanvas}>
                <Section title="Key metrics" description="Overview for the current period">
                  <Scoreboard items={METRICS} />
                </Section>
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
                <Section title="Notices" description="Things that need a look">
                  <Alert variant="warning" title="Seats running low">
                    Three seats left on the Studio plan.
                  </Alert>
                </Section>
                <Section title="Account" description="Name used on invoices">
                  <Field label="Display name" htmlFor="section-display-name" hint="Shown on exported PDFs">
                    <Input id="section-display-name" defaultValue="Boris Jovanovic" />
                  </Field>
                </Section>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Each Section takes a different kit body: Scoreboard, Table, Alert, or Field. Do
                  not invent a local block. Headings stay static unless you pass collapsible.
                  Accordion is for exclusive FAQ lists.
                </p>
              </div>
              <CodeBlock
                code={`<Section title="Key metrics"><Scoreboard items={metrics} /></Section>
<Section title="Recent activity"><Table columns={columns} rows={rows} /></Section>
<Section title="Notices"><Alert variant="warning" title="Seats running low">Three seats left on the Studio plan.</Alert></Section>
<Section title="Account"><Field label="Display name" htmlFor="name"><Input id="name" /></Field></Section>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Collapsible</h2>
              <div className={styles.exampleCanvas}>
                <Section
                  title="Weekly users"
                  description="Daily average, last 7 days"
                  collapsible
                >
                  <Table columns={COLUMNS} rows={ROWS} />
                </Section>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass collapsible when the heading should toggle the body. Chevron before the title.
                  Docs pages and chart blocks usually stay static.
                </p>
              </div>
              <CodeBlock
                code={`<Section title="Weekly users" description="Daily average, last 7 days" collapsible>
  <Table columns={columns} rows={rows} />
</Section>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Closed</h2>
              <div className={styles.exampleCanvas}>
                <Section
                  title="Archived invoices"
                  description="Hidden until you need them"
                  collapsible
                  defaultOpen={false}
                >
                  <Table columns={COLUMNS} rows={ROWS} />
                </Section>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass collapsible and defaultOpen false when the body should start collapsed.
                  Controlled open and onOpenChange are available when the page owns the state.
                </p>
              </div>
              <CodeBlock
                code={`<Section title="Archived invoices" description="Hidden until you need them" collapsible defaultOpen={false}>
  <Table columns={columns} rows={rows} />
</Section>`}
              />
            </section>

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
          </div>
        )}
      </section>
    </div>
  );
}
