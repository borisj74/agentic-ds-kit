"use client";

import { useState } from "react";
import { ListView } from "agentic-ds-kit";
import type { ListViewItem } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const PEOPLE: ListViewItem[] = [
  {
    id: "maya",
    primary: "Maya Chen",
    secondary: "maya@acme.com",
    name: "Maya Chen",
    badge: "Admin",
    badgeTone: "info",
    actions: [
      { id: "edit", label: "Edit", icon: "Pencil" },
      { id: "remove", label: "Remove", icon: "Trash2", danger: true },
    ],
  },
  {
    id: "jon",
    primary: "Jon Hale",
    secondary: "jon@acme.com",
    name: "Jon Hale",
    badge: "Active",
    badgeTone: "success",
  },
  {
    id: "priya",
    primary: "Priya Shah",
    secondary: "priya@acme.com",
    name: "Priya Shah",
  },
  {
    id: "owen",
    primary: "Owen Blake",
    secondary: "Deactivated",
    name: "Owen Blake",
    disabled: true,
    badge: "Disabled",
  },
];

const FILES: ListViewItem[] = [
  { id: "brand", primary: "Brand guidelines", secondary: "Updated yesterday", icon: "File", badge: "PDF", badgeTone: "neutral" },
  { id: "tokens", primary: "Token sheet", secondary: "Edited 2 hours ago", icon: "File" },
  { id: "archive", primary: "Archive", secondary: "Read only", icon: "Folder", disabled: true },
];

const GROUPED: ListViewItem[] = [
  { id: "maya", primary: "Maya Chen", secondary: "Product design", name: "Maya Chen", group: "design" },
  { id: "leo", primary: "Leo Hart", secondary: "Brand", name: "Leo Hart", group: "design" },
  { id: "jon", primary: "Jon Hale", secondary: "Frontend", name: "Jon Hale", group: "eng" },
  { id: "priya", primary: "Priya Shah", secondary: "Platform", name: "Priya Shah", group: "eng" },
];

const OVERFLOW: ListViewItem[] = [
  {
    id: "maya",
    primary: "Maya Chen",
    secondary: "Workspace owner",
    name: "Maya Chen",
    actions: [
      { id: "edit", label: "Edit", icon: "Pencil" },
      { id: "copy", label: "Copy", icon: "Copy" },
      { id: "remove", label: "Remove", icon: "Trash2", danger: true },
    ],
  },
];

const CODE = `<ListView
  label="People"
  items={[
    { id: "maya", primary: "Maya Chen", secondary: "maya@acme.com", name: "Maya Chen", badge: "Admin", badgeTone: "info" },
    { id: "jon", primary: "Jon Hale", secondary: "jon@acme.com", name: "Jon Hale" },
  ]}
/>`;

export function ListViewDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>ListView</h1>
        <p className={styles.lede}>
          A list of records, one row each. Not Table. Not TreeView. Not the list-detail pattern.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="listview-master">
        <div className={styles.masterHeader}>
          <h2 id="listview-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Primary and secondary lines, kit Avatar, optional Badge, and at most two trailing actions.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <ListView label="People" items={PEOPLE} />
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use for people, files, and other records. Use Table when values line up in columns. Use
                  TreeView for a nested hierarchy. Use the list-detail pattern when a pane sits beside the
                  list.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView label="Files" items={FILES} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Leading media is Avatar when name, src, or initials is set. Otherwise a Lucide icon. One
                  leading slot.
                </p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Single select</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView
                    label="Pick a person"
                    items={PEOPLE}
                    selection="single"
                    defaultSelected={["jon"]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>One row at a time. Space or click selects. Disabled rows stay visible.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Multiple · check</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView
                    label="Choose people"
                    items={PEOPLE}
                    selection="multiple"
                    defaultSelected={["maya", "priya"]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Multiple uses the kit Checkbox. Do not invent a row check.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Drill</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView label="Open a person" items={PEOPLE} interaction="drill" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Drill puts a chevron on the row and makes the body a button. Put detail beside the list,
                  not under the row.
                </p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Group headers</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView
                    label="Directory"
                    items={GROUPED}
                    groups={[
                      { id: "design", label: "Design" },
                      { id: "eng", label: "Engineering" },
                    ]}
                    collapsibleGroups
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Optional headers. collapsibleGroups lets people close a section.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Overflow actions</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView label="People" items={OVERFLOW} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Two actions stay on the row. A third goes in kit DropdownMenu.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Size sm</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView label="Compact people" items={PEOPLE} size="sm" selection="single" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm and md only. This kit has no Density.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView
                    label="People"
                    items={[]}
                    empty={{
                      title: "No people yet",
                      description: "Invite someone to this workspace.",
                      icon: "User",
                    }}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Empty items render kit Empty. Do not invent a local blank slate.</p>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
