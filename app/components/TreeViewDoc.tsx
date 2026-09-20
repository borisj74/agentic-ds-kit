"use client";

import { useState } from "react";
import { TreeView } from "agentic-ds-kit";
import type { TreeViewItem } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const WORKSPACE: TreeViewItem[] = [
  {
    id: "design",
    label: "Design",
    children: [
      { id: "brand", label: "Brand" },
      { id: "components", label: "Components" },
      {
        id: "research",
        label: "Research",
        children: [
          { id: "interviews", label: "Interviews" },
          { id: "surveys", label: "Surveys" },
        ],
      },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    children: [
      { id: "frontend", label: "Frontend" },
      { id: "backend", label: "Backend" },
    ],
  },
  { id: "legal", label: "Legal" },
];

const WITH_DISABLED: TreeViewItem[] = [
  {
    id: "acme",
    label: "Acme",
    children: [
      { id: "north", label: "North America" },
      { id: "emea", label: "EMEA", disabled: true },
      {
        id: "apac",
        label: "APAC",
        children: [
          { id: "tokyo", label: "Tokyo" },
          { id: "sydney", label: "Sydney", disabled: true },
        ],
      },
    ],
  },
  { id: "archive", label: "Archive", disabled: true, children: [] },
];

const CODE = `<TreeView
  label="Workspace"
  selection="multiple"
  defaultExpanded={["design"]}
  items={[
    { id: "design", label: "Design", children: [{ id: "brand", label: "Brand" }] },
    { id: "legal", label: "Legal" },
  ]}
/>`;

export function TreeViewDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>TreeView</h1>
        <p className={styles.lede}>
          Nested hierarchy people open and close level by level. Not Accordion. Not SideNav.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="treeview-master">
        <div className={styles.masterHeader}>
          <h2 id="treeview-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Folders expand one level at a time. Leaves have no chevron. Arrow keys move, open, and close.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <TreeView
                    label="Workspace"
                    items={WORKSPACE}
                    defaultExpanded={["design", "research"]}
                    showIcons
                    showLines
                  />
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use for teams, folders, and account trees. Use Accordion for FAQ copy. Use SideNav
                  for app navigation. Use Table when rows are flat and comparable.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Single select</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <TreeView
                    label="Pick a folder"
                    items={WORKSPACE}
                    selection="single"
                    defaultExpanded={["engineering"]}
                    defaultSelected={["frontend"]}
                    showIcons
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>One node at a time. Expand with the chevron or Right arrow.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Multiple · branch check</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <TreeView
                    label="Choose teams"
                    items={WORKSPACE}
                    selection="multiple"
                    defaultExpanded={["design", "engineering"]}
                    showIcons
                    showLines
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Checking a folder checks its descendants. A mixed branch shows the kit Checkbox
                  indeterminate state.
                </p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Size sm</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <TreeView
                    label="Compact tree"
                    items={WORKSPACE}
                    size="sm"
                    selection="single"
                    defaultExpanded={["design"]}
                    showIcons
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm and md only. This kit has no Density.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <TreeView
                    label="Accounts"
                    items={WITH_DISABLED}
                    selection="multiple"
                    defaultExpanded={["acme", "apac"]}
                    showIcons
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Disabled nodes stay visible and cannot be selected.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <TreeView label="Workspace" items={[]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>An empty tree keeps role=tree and its accessible name.</p>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
