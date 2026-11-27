"use client";

import { useState } from "react";
import { Tabs } from "agentic-ds-kit";
import type { TabItem, TabsSize, TabsVariant } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl, SizeControl } from "./ControlsPanel";

const SIZES: TabsSize[] = ["sm", "md", "lg"];
const VARIANTS: TabsVariant[] = ["line", "segmented"];

const MASTER_ITEMS: TabItem[] = [
  { id: "overview", label: "Overview", content: "What’s shipping now and how this kit is positioned." },
  { id: "docs", label: "Docs", content: "Token usage and how to compose this set." },
  { id: "api", label: "API", content: "Props, callbacks, and a11y details." },
];

const OVERFLOW_ITEMS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "overdue", label: "Overdue", count: 3 },
  { id: "drafts", label: "Drafts", count: 5 },
  { id: "paid", label: "Paid" },
  { id: "scheduled", label: "Scheduled" },
  { id: "refunded", label: "Refunded" },
  { id: "void", label: "Void" },
];

function itemsSnippet(entries: { id: string; label: string; content: string; disabled?: boolean }[]) {
  const inner = entries
    .map((item) => {
      const disabled = item.disabled ? ", disabled: true" : "";
      return `    { id: "${item.id}", label: "${item.label}", content: "${item.content}"${disabled} }`;
    })
    .join(",\n");
  return `  items={[\n${inner},\n  ]}`;
}

function masterCode(size: TabsSize, variant: TabsVariant) {
  return [
    "<Tabs",
    `  defaultValue="overview"`,
    `  size="${size}"`,
    `  variant="${variant}"`,
    itemsSnippet([
      { id: "overview", label: "Overview", content: "…" },
      { id: "docs", label: "Docs", content: "…" },
      { id: "api", label: "API", content: "…" },
    ]),
    "/>",
  ].join("\n");
}

export function TabsDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<TabsSize>("md");
  const [variant, setVariant] = useState<TabsVariant>("line");
  const [value, setValue] = useState("overview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Tabs</h2>
        <p className={styles.lede}>
          Switch between related views in place. Line by default, or segmented, in lg, md, and sm. Tabs can carry an icon and a count, and scroll or fold into a More menu when they don’t fit. One piece.
          Not AppNav. Not RadioGroup. Not TabsList or TabsTrigger cousins.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="tabs-master">
        <div className={styles.masterHeader}>
          <h2 id="tabs-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size and variant to preview every Tabs combination.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Tabs
                  items={MASTER_ITEMS}
                  value={value}
                  onChange={setValue}
                  size={size}
                  variant={variant}
                />
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
                <RadioControl label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Tabs to switch related views in place. Keep labels short and avoid nesting
                  tabs inside tabs.
                </p>
              </div>
              <CodeBlock code={masterCode(size, variant)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Line</h2>
              <div className={styles.exampleCanvas}>
                <Tabs
                  defaultValue="activity"
                  size="lg"
                  variant="line"
                  items={[
                    { id: "activity", label: "Activity", content: "Recent updates." },
                    { id: "members", label: "Members", content: "People with access." },
                    { id: "settings", label: "Settings", content: "Workspace preferences." },
                  ]}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Default for page-level sections where the list should stretch with the content
                  width.
                </p>
              </div>
              <CodeBlock
                code={`<Tabs
  defaultValue="activity"
  size="lg"
  variant="line"
  items={[
    { id: "activity", label: "Activity", content: "Recent updates." },
    { id: "members", label: "Members", content: "People with access." },
    { id: "settings", label: "Settings", content: "Workspace preferences." },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Segmented</h2>
              <div className={styles.exampleCanvas}>
                <Tabs
                  defaultValue="preview"
                  size="lg"
                  variant="segmented"
                  items={[
                    { id: "preview", label: "Preview", content: "Live composition." },
                    { id: "code", label: "Code", content: "Source for this example." },
                  ]}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use segmented tabs for compact local switching: preview and code, filters, or
                  settings panes.
                </p>
              </div>
              <CodeBlock
                code={`<Tabs
  defaultValue="preview"
  size="lg"
  variant="segmented"
  items={[
    { id: "preview", label: "Preview", content: "Live composition." },
    { id: "code", label: "Code", content: "Source for this example." },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  {(["sm", "md", "lg"] as TabsSize[]).map((step) => (
                    <Tabs
                      key={step}
                      defaultValue="one"
                      size={step}
                      variant="line"
                      items={[
                        { id: "one", label: `One (${step})`, content: `Content for ${step}.` },
                        { id: "two", label: "Two", content: "Second panel." },
                      ]}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use lg for page chrome, md for cards and drawers, and sm for dense toolbars.
                </p>
              </div>
              <CodeBlock
                code={["sm", "md", "lg"]
                  .map(
                    (step) =>
                      `<Tabs defaultValue="one" size="${step}" variant="line" items={[{ id: "one", label: "One", content: "…" }, { id: "two", label: "Two", content: "…" }]} />`,
                  )
                  .join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon and count</h2>
              <div className={styles.exampleCanvas}>
                <Tabs
                  defaultValue="all"
                  items={[
                    { id: "all", label: "All" },
                    { id: "overdue", label: "Overdue", count: 3 },
                    { id: "drafts", label: "Drafts", count: 5 },
                    { id: "paid", label: "Paid" },
                    { id: "disputed", label: "Disputed", icon: "Lock", disabled: true },
                  ]}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A count is a neutral kit Count and part of the tab’s name, so the number carries the
                  meaning, never colour. An icon sits before the label.
                </p>
              </div>
              <CodeBlock
                code={`<Tabs
  defaultValue="all"
  items={[
    { id: "all", label: "All" },
    { id: "overdue", label: "Overdue", count: 3 },
    { id: "drafts", label: "Drafts", count: 5 },
    { id: "paid", label: "Paid" },
    { id: "disputed", label: "Disputed", icon: "Lock", disabled: true },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Overflow</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack} style={{ maxWidth: "24rem" }}>
                  <Tabs
                    ariaLabel="Invoices, scroll"
                    defaultValue="all"
                    items={OVERFLOW_ITEMS}
                  />
                  <Tabs
                    ariaLabel="Invoices, more"
                    defaultValue="all"
                    overflow="more"
                    items={OVERFLOW_ITEMS}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  By default the row stays on one line and scrolls sideways. With overflow=&quot;more&quot;,
                  tabs that don’t fit move into a More menu; the selected tab always stays in the row.
                </p>
              </div>
              <CodeBlock
                code={`<Tabs defaultValue="all" items={items} />
<Tabs defaultValue="all" overflow="more" items={items} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Manual activation</h2>
              <div className={styles.exampleCanvas}>
                <Tabs
                  defaultValue="timeline"
                  activation="manual"
                  items={[
                    { id: "timeline", label: "Timeline", content: "Sent Nov 4, reminder Nov 18." },
                    { id: "lines", label: "Lines", content: "Pro plan, 12 seats, $1,250." },
                  ]}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Arrow keys move focus and Enter or Space selects. Use it when a panel is slow to load.
                </p>
              </div>
              <CodeBlock
                code={`<Tabs defaultValue="timeline" activation="manual" items={[…]} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <Tabs
                  defaultValue="general"
                  size="lg"
                  items={[
                    { id: "general", label: "General", content: "Profile and preferences." },
                    { id: "billing", label: "Billing", content: "Plans and invoices.", disabled: true },
                  ]}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disable a tab when that section isn’t available yet. Keep the label so people
                  know what’s coming.
                </p>
              </div>
              <CodeBlock
                code={`<Tabs
  defaultValue="general"
  size="lg"
  items={[
    { id: "general", label: "General", content: "Profile and preferences." },
    { id: "billing", label: "Billing", content: "Plans and invoices.", disabled: true },
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
