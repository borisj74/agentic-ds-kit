"use client";

import { useState } from "react";
import { DataTable } from "@/ui/DataTable";
import type { DataTableColumn, DataTableRow } from "@/ui/DataTable";
import { CodeBlock } from "./CodeBlock";
import { FACES } from "./faces";
import styles from "./ComponentDoc.module.css";

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "role", header: "Role", sortable: true },
  { key: "status", header: "Status", sortable: true },
  { key: "projects", header: "Projects", type: "number", sortable: true },
];

const ROWS: DataTableRow[] = [
  {
    name: { type: "avatar", label: "Maya Chen", name: "Maya Chen", src: FACES["Maya Chen"] },
    role: "Designer",
    status: { type: "badge", label: "Active", tone: "success" },
    projects: 12,
  },
  {
    name: { type: "avatar", label: "Noah Williams", name: "Noah Williams", src: FACES["Noah Williams"] },
    role: "Engineer",
    status: { type: "badge", label: "Active", tone: "success" },
    projects: 8,
  },
  {
    name: { type: "avatar", label: "Iris Okafor", name: "Iris Okafor", src: FACES["Iris Okafor"] },
    role: "Product",
    status: { type: "badge", label: "Invited", tone: "info" },
    projects: 4,
  },
  {
    name: { type: "avatar", label: "Jordan Lee", name: "Jordan Lee", src: FACES["Jordan Lee"] },
    role: "Designer",
    status: { type: "badge", label: "Away", tone: "warning" },
    projects: 6,
  },
  {
    name: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera", src: FACES["Alex Rivera"] },
    role: "Engineer",
    status: { type: "badge", label: "Active", tone: "success" },
    projects: 9,
  },
];

const CELL_TYPE_COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "file", header: "File", sortable: true },
  { key: "payment", header: "Payment", sortable: true },
  { key: "tags", header: "Tags", sortable: true },
  { key: "trend", header: "Trend", sortable: true },
  { key: "team", header: "Team", sortable: true },
];

const CELL_TYPE_ROWS: DataTableRow[] = [
  {
    name: { type: "avatar", label: "Maya Chen", name: "Maya Chen", src: FACES["Maya Chen"] },
    file: { type: "file", label: "brief.pdf" },
    payment: { type: "payment", label: "Visa" },
    tags: {
      type: "badges",
      badges: [
        { label: "Design", tone: "info" },
        { label: "Core" },
      ],
    },
    trend: { type: "trendPositive", value: "12%" },
    team: {
      type: "avatarGroup",
      people: [
        { name: "Maya Chen", src: FACES["Maya Chen"] },
        { name: "Noah Williams", src: FACES["Noah Williams"] },
        { name: "Iris Okafor", src: FACES["Iris Okafor"] },
        { name: "Jordan Lee", src: FACES["Jordan Lee"] },
      ],
    },
  },
  {
    name: { type: "avatar", label: "Noah Williams", name: "Noah Williams", src: FACES["Noah Williams"] },
    file: { type: "file", label: "spec.md" },
    payment: { type: "payment", label: "Mastercard" },
    tags: {
      type: "badges",
      badges: [{ label: "Eng", tone: "brand" }],
    },
    trend: { type: "trendNegative", value: "4%" },
    team: {
      type: "avatarGroup",
      people: [{ name: "Noah Williams", src: FACES["Noah Williams"] }, { name: "Alex Rivera", src: FACES["Alex Rivera"] }],
    },
  },
];


const INTERACTIVE_COLUMNS: DataTableColumn[] = [
  { key: "status", header: "Status" },
  { key: "progress", header: "Progress" },
  { key: "rating", header: "Rating" },
  { key: "actions", header: "Actions" },
  { key: "icons", header: "Icons" },
  { key: "menu", header: "Menu" },
];

const INTERACTIVE_ROWS: DataTableRow[] = [
  {
    status: {
      type: "select",
      label: "Status",
      value: "active",
      options: [
        { value: "active", label: "Active" },
        { value: "invited", label: "Invited" },
        { value: "away", label: "Away" },
      ],
    },
    progress: { type: "progress", value: 64 },
    rating: { type: "rating", value: 4 },
    actions: {
      type: "actions",
      actions: [{ label: "Edit" }, { label: "Delete", variant: "danger" }],
    },
    icons: {
      type: "actionIcons",
      actions: [
        { icon: "Pencil", ariaLabel: "Edit" },
        { icon: "Trash2", ariaLabel: "Delete", variant: "danger" },
      ],
    },
    menu: { type: "actionMenu", label: "Row actions" },
  },
];

const INTERACTIVE_CODE = `<DataTable
  caption="Interactive cells"
  columns={[
    { key: "status", header: "Status" },
    { key: "progress", header: "Progress" },
    { key: "rating", header: "Rating" },
    { key: "actions", header: "Actions" },
  ]}
  rows={rows}
/>`;
const FILTERS = [
  { key: "status", label: "Status" },
  { key: "role", label: "Role" },
];

const TOOLBAR_CODE = `<DataTable
  caption="Team members"
  selectable
  toolbar
  searchPlaceholder="Search members..."
  filters={[
    { key: "status", label: "Status" },
    { key: "role", label: "Role" },
  ]}
  columnSettings
  columns={[
    { key: "name", header: "Name" },
    { key: "role", header: "Role" },
    { key: "status", header: "Status" },
    { key: "projects", header: "Projects", type: "number" },
  ]}
  rows={[
    {
      name: { type: "avatar", label: "Maya Chen", name: "Maya Chen", src: "/faces/maya-chen.jpg" },
      role: "Designer",
      status: { type: "badge", label: "Active", tone: "success" },
      projects: 12,
    },
  ]}
/>`;

const EMPTY_CODE = `<DataTable columns={columns} rows={[]} emptyMessage="No team members yet." />`;

const CELL_TYPES_CODE = `<DataTable
  caption="Cell types"
  columns={[
    { key: "name", header: "Name" },
    { key: "file", header: "File" },
    { key: "payment", header: "Payment" },
    { key: "tags", header: "Tags" },
    { key: "trend", header: "Trend" },
    { key: "team", header: "Team" },
  ]}
  rows={rows}
/>`;

const PREVIEW_FILL = { maxWidth: "100%" } as const;
const MASTER_LAYOUT = { gridTemplateColumns: "minmax(0, 1fr)" } as const;

export function DataTableDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  const toolbarTable = (
    <DataTable
      caption="Team members"
      selectable
      toolbar
      searchPlaceholder="Search members..."
      filters={FILTERS}
      columnSettings
      columns={COLUMNS}
      rows={ROWS}
    />
  );

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>DataTable</h1>
        <p className={styles.lede}>
          Responsive structured data with search, filters, column settings, and clear empty states.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="datatable-master">
        <div className={styles.masterHeader}>
          <h2 id="datatable-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toolbar with search, filters, column settings, and row selection. Each td is a kit Cell.
            Table stays the short static list.
          </p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "variants"}
              className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`}
              onClick={() => setTab("variants")}
            >
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout} style={MASTER_LAYOUT}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  {toolbarTable}
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  DataTable for searchable datasets. Table for a short static list. Render kit Cell in
                  each td — Avatar, Badge, and Checkbox through Cell. Do not invent a local cell.
                </p>
              </div>
              <CodeBlock code={TOOLBAR_CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Toolbar</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  {toolbarTable}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Search, filters, and Columns. Result strip shows how many rows match. Name is Cell
                  type=avatar; status is type=badge.
                </p>
              </div>
              <CodeBlock code={TOOLBAR_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Cell types</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <DataTable
                    caption="Cell types"
                    columns={CELL_TYPE_COLUMNS}
                    rows={CELL_TYPE_ROWS}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  File, payment, badges, trend, and avatarGroup are Cell types. Do not invent Tag,
                  Trend, FileIcon, or PaymentMethod.
                </p>
              </div>
              <CodeBlock code={CELL_TYPES_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty state</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <DataTable columns={COLUMNS} rows={[]} emptyMessage="No team members yet." />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Keep the header row. Centered emptyMessage when rows is empty or search and filters
                  match nothing.
                </p>
              </div>
              <CodeBlock code={EMPTY_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
