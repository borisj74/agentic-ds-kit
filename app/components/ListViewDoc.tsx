"use client";

import { useState } from "react";
import { ListView } from "agentic-ds-kit";
import type { ListViewItem } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

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
    secondary: "owen@acme.com",
    name: "Owen Blake",
    disabled: true,
    badge: "Deactivated",
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

const LONG_EMAILS: ListViewItem[] = [
  { id: "olivia", primary: "Olivia Rhye", secondary: "olivia.rhye@accounts.untitledui.com", name: "Olivia Rhye" },
  { id: "phoenix", primary: "Phoenix Baker-Montgomery", secondary: "phoenix.baker-montgomery@untitledui.com", name: "Phoenix Baker" },
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

const NEEDS_ATTENTION: ListViewItem[] = [
  { id: "fernway", primary: "Fernway Tours", secondary: "$310 · Low funds", priority: "medium", primaryAction: { id: "retry", label: "Retry", actionLabel: "Retry Fernway Tours" }, actions: [{ id: "open", label: "Open in Stripe" }, { id: "snooze", label: "Snooze a week" }] },
  { id: "marlow", primary: "Marlow Dental", secondary: "$1,450 · Expires Nov 30", priority: "high", primaryAction: { id: "link", label: "Send link", actionLabel: "Send link Marlow Dental" }, actions: [{ id: "open", label: "Open in Stripe" }, { id: "snooze", label: "Snooze a week" }] },
  { id: "hollis", primary: "Hollis & Grey", secondary: "$720 · Bank verification", priority: "high", primaryAction: { id: "email", label: "Email", actionLabel: "Email Hollis & Grey" }, actions: [{ id: "open", label: "Open in Stripe" }, { id: "snooze", label: "Snooze a week" }] },
  { id: "quarry", primary: "Quarry Coffee", secondary: "$260 · Expires Dec 4", priority: "medium", primaryAction: { id: "link", label: "Send link", actionLabel: "Send link Quarry Coffee" }, actions: [{ id: "open", label: "Open in Stripe" }, { id: "snooze", label: "Snooze a week" }] },
  { id: "brightline", primary: "Brightline Studio", secondary: "$640 · Declined twice", priority: "high", primaryAction: { id: "retry", label: "Retry", actionLabel: "Retry Brightline Studio" }, actions: [{ id: "open", label: "Open in Stripe" }, { id: "snooze", label: "Snooze a week" }] },
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
        <h2 className={styles.heroTitle}>ListView</h2>
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
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use for people, files, and other records. Use Table when values line up in columns. Use
                  TreeView for a nested hierarchy. Use the list-detail pattern when a pane sits beside the
                  list.
                </p>
              </div>
              <CodeBlock code={CODE} />
            </DocNotes>
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
              <h2 className={styles.exampleTitle}>Truncate</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewNarrow}>
                  <ListView label="Account" items={LONG_EMAILS} truncate="secondary" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  In a narrow column, truncate=&quot;secondary&quot; keeps long emails on one line with an
                  ellipsis instead of wrapping mid-word; &quot;both&quot; clips the primary line too. The full
                  text stays in the row&apos;s accessible name and shows as the hover title.
                </p>
              </div>
              <CodeBlock
                code={`<ListView
  label="Account"
  truncate="secondary"
  items={[{ id: "olivia", primary: "Olivia Rhye", secondary: "olivia.rhye@accounts.untitledui.com", name: "Olivia Rhye" }]}
/>`}
              />
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
                <p className={styles.usageBody}>xs, sm and md only. This kit has no Density.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Size xs · priority · one verb</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <ListView
                    label="Needs attention"
                    size="xs"
                    sort="priority"
                    truncate="both"
                    items={NEEDS_ATTENTION}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  xs rows are 40px tall, for dense cards like a dashboard Needs attention list. priority puts a
                  bar marker in the leading slot and starts the secondary line with High, Medium or Low, so the
                  marker is never the only signal. sort=&quot;priority&quot; orders high first and keeps your order
                  within each level. primaryAction is the row&apos;s one verb in a fixed-width slot so verbs line
                  up; the other actions go in the menu. actionLabel names the button for screen readers when the
                  verb alone is not enough: visible &quot;Send link&quot;, read as &quot;Send link Marlow Dental&quot;. Keep the card&apos;s primary button off the rows.
                </p>
              </div>
              <CodeBlock
                code={`<ListView
  label="Needs attention"
  size="xs"
  sort="priority"
  truncate="both"
  items={[
    {
      id: "marlow",
      primary: "Marlow Dental",
      secondary: "$1,450 · Expires Nov 30",
      priority: "high",
      primaryAction: { id: "link", label: "Send link", actionLabel: "Send link Marlow Dental" },
      actions: [{ id: "open", label: "Open in Stripe" }, { id: "snooze", label: "Snooze a week" }],
    },
  ]}
/>`}
              />
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
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Status dot and time</h2>
              <div className={styles.exampleCanvas}>
                <ListView
                  label="Recent changes"
                  size="sm"
                  items={[
                    { id: "c1", primary: "Seats went up on three teams", secondary: "Mostly from the spring promotion", dot: "success", meta: "2h ago" },
                    { id: "c2", primary: "Two cards are about to expire", secondary: "Both renew on the 1st", dot: "warning", meta: "Yesterday" },
                    { id: "c3", primary: "Refund issued to one team", secondary: "Billed twice in error", dot: "neutral", meta: "Mon" },
                  ]}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  dot puts a small status dot in the leading slot when there is no avatar or icon; the text still says what happened. meta is short muted text at the row end, like a relative time.
                </p>
              </div>
              <CodeBlock
                code={`<ListView
  label="Recent changes"
  size="sm"
  items={[
    { id: "c1", primary: "Seats went up on three teams", secondary: "Mostly from the spring promotion", dot: "success", meta: "2h ago" },
    { id: "c2", primary: "Two cards are about to expire", secondary: "Both renew on the 1st", dot: "warning", meta: "Yesterday" },
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
