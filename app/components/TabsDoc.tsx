"use client";

import { useState } from "react";
import { Tabs } from "agentic-ds-kit";
import type { TabItem, TabsSize, TabsVariant } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: TabsSize[] = ["sm", "md", "lg"];
const VARIANTS: TabsVariant[] = ["segmented", "line"];

const MASTER_ITEMS: TabItem[] = [
  { id: "overview", label: "Overview", content: "What’s shipping now and how this kit is positioned." },
  { id: "docs", label: "Docs", content: "Token usage and how to compose this set." },
  { id: "api", label: "API", content: "Props, callbacks, and a11y details." },
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
  const [variant, setVariant] = useState<TabsVariant>("segmented");
  const [value, setValue] = useState("overview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Tabs</h1>
        <p className={styles.lede}>
          Switch between related views in place. Segmented or line, in lg, md, and sm. One piece.
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
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Variant">
                    {VARIANTS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${variant === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={variant === option}
                        onClick={() => setVariant(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Tabs to switch related views in place. Keep labels short and avoid nesting
                  tabs inside tabs.
                </p>
              </div>
              <CodeBlock code={masterCode(size, variant)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
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
                  Use line tabs for page-level sections where the list should stretch with the
                  content width.
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
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  {(["sm", "md", "lg"] as TabsSize[]).map((step) => (
                    <Tabs
                      key={step}
                      defaultValue="one"
                      size={step}
                      variant="segmented"
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
                      `<Tabs defaultValue="one" size="${step}" variant="segmented" items={[{ id: "one", label: "One", content: "…" }, { id: "two", label: "Two", content: "…" }]} />`,
                  )
                  .join("\n")}
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
